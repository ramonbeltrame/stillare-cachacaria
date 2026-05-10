import { NextRequest, NextResponse } from "next/server";
import { shippingCalculateSchema } from "@/lib/validations";
import { calcularFrete } from "@/lib/correios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = shippingCalculateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { zipCode, items } = parsed.data;

    const totalWeight = items.reduce(
      (sum, item) => sum + item.weightGrams * item.quantity,
      0
    );

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const comprimento = Math.min(105, Math.max(16, totalItems * 8));
    const largura = Math.min(105, Math.max(11, totalItems * 6));
    const altura = Math.min(105, Math.max(2, totalItems * 3));

    const shippingOptions = await calcularFrete({
      cepDestino: zipCode.replace(/\D/g, ""),
      peso: totalWeight,
      comprimento,
      largura,
      altura,
    });

    return NextResponse.json({ shippingOptions });
  } catch (error: any) {
    console.error("Shipping calculate error:", error);
    return NextResponse.json(
      { error: "Erro ao calcular frete" },
      { status: 500 }
    );
  }
}
