import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidImageType, isValidImageExtension } from "@/lib/security";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (máx 5MB)" }, { status: 400 });
    }

    if (!isValidImageType(file.type) || !isValidImageExtension(file.name)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido. Use JPG, PNG, WebP ou AVIF." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    const publicPath = `/uploads/${fileName}`;

    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), buffer);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${appUrl}${publicPath}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload" },
      { status: 500 }
    );
  }
}
