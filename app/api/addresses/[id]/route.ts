import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await request.json();

    const existing = await prisma.shippingAddress.findFirst({
      where: { id: params.id, userId },
    });
    if (!existing) return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 });

    if (body.isDefault) {
      await prisma.shippingAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.shippingAddress.update({
      where: { id: params.id },
      data: {
        recipientName: body.recipientName,
        phone: body.phone,
        street: body.street,
        number: body.number,
        complement: body.complement,
        neighborhood: body.neighborhood,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        isDefault: body.isDefault || false,
      },
    });

    return NextResponse.json({ address });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const userId = (session.user as any).id;

    const existing = await prisma.shippingAddress.findFirst({
      where: { id: params.id, userId },
    });
    if (!existing) return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 });

    await prisma.shippingAddress.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
