import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { isValidImageType, isValidImageExtension } from "@/lib/security";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const IMAGES_DIR = path.join(process.cwd(), "public", "images");

// GET: List all images grouped by section
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "all";

    const result: any = {
      products: [],
      hero: [],
      about: [],
      categories: [],
    };

    // Product images from DB
    const productImages = await prisma.productImage.findMany({
      include: { product: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ productId: "asc" }, { displayOrder: "asc" }],
    });

    // Group by product
    const productMap = new Map<string, any>();
    for (const img of productImages) {
      if (!productMap.has(img.productId)) {
        productMap.set(img.productId, {
          productId: img.productId,
          productName: img.product.name,
          productSlug: img.product.slug,
          images: [],
        });
      }
      productMap.get(img.productId).images.push({
        id: img.id,
        imageUrl: img.imageUrl,
        altText: img.altText,
        displayOrder: img.displayOrder,
        isPrimary: img.isPrimary,
      });
    }
    result.products = Array.from(productMap.values());

    // Static images from filesystem
    const staticDirs = ["hero", "about", "categories"];
    for (const dir of staticDirs) {
      const dirPath = path.join(IMAGES_DIR, dir);
      try {
        const files = await fs.readdir(dirPath);
        result[dir] = files
          .filter((f) => /\.(jpg|jpeg|png|webp|avif)$/i.test(f))
          .map((f) => ({
            filename: f,
            imageUrl: `/images/${dir}/${f}`,
          }));
      } catch {
        result[dir] = [];
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Upload new image to a specific section
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const section = (formData.get("section") as string) || "products";
    const productId = formData.get("productId") as string | null;

    if (!file) return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Arquivo muito grande" }, { status: 400 });
    if (!isValidImageType(file.type) || !isValidImageExtension(file.name)) {
      return NextResponse.json({ error: "Tipo não permitido" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

    let targetDir: string;
    if (section === "products" && productId) {
      targetDir = path.join(IMAGES_DIR, "products");
    } else {
      targetDir = path.join(IMAGES_DIR, section);
    }

    await fs.mkdir(targetDir, { recursive: true });
    const filePath = path.join(targetDir, safeName);
    await fs.writeFile(filePath, buffer);

    const imageUrl = `/images/${section === "products" ? "products" : section}/${safeName}`;

    // If product section, create DB record
    if (section === "products" && productId) {
      const existingCount = await prisma.productImage.count({ where: { productId } });
      const img = await prisma.productImage.create({
        data: {
          productId,
          imageUrl,
          altText: formData.get("altText") as string || null,
          displayOrder: existingCount,
          isPrimary: existingCount === 0,
        },
      });
      return NextResponse.json({ success: true, image: img });
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update image (reorder, set primary, change alt)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await request.json();
    const { action, imageId, productId, data } = body;

    switch (action) {
      case "setPrimary": {
        await prisma.$transaction([
          prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
          prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
        ]);
        return NextResponse.json({ success: true });
      }
      case "reorder": {
        const { items } = data;
        for (const item of items) {
          await prisma.productImage.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          });
        }
        return NextResponse.json({ success: true });
      }
      case "updateAlt": {
        await prisma.productImage.update({
          where: { id: imageId },
          data: { altText: data.altText },
        });
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove an image
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("id");
    const filename = searchParams.get("filename");
    const section = searchParams.get("section") || "products";

    // Delete from DB if it's a product image
    if (imageId) {
      const img = await prisma.productImage.findUnique({ where: { id: imageId } });
      if (!img) return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });

      const productImages = await prisma.productImage.findMany({
        where: { productId: img.productId },
      });
      if (productImages.length <= 1) {
        return NextResponse.json({ error: "Produto precisa de pelo menos 1 foto" }, { status: 400 });
      }

      // Delete file from disk
      try {
        const filePath = path.join(process.cwd(), "public", img.imageUrl);
        await fs.unlink(filePath);
      } catch {}

      await prisma.productImage.delete({ where: { id: imageId } });

      // If deleted image was primary, set next as primary
      if (img.isPrimary) {
        const next = await prisma.productImage.findFirst({
          where: { productId: img.productId },
          orderBy: { displayOrder: "asc" },
        });
        if (next) {
          await prisma.productImage.update({
            where: { id: next.id },
            data: { isPrimary: true },
          });
        }
      }
      return NextResponse.json({ success: true });
    }

    // Delete static image file
    if (filename && section) {
      try {
        const filePath = path.join(IMAGES_DIR, section, filename);
        await fs.unlink(filePath);
      } catch {
        return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
