import { NextRequest, NextResponse } from "next/server";
import { rastrearEncomenda } from "@/lib/correios";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const trackingData = await rastrearEncomenda(params.code);

    if (!trackingData) {
      return NextResponse.json(
        { error: "Código de rastreamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tracking: trackingData });
  } catch (error: any) {
    console.error("Shipping track error:", error);
    return NextResponse.json(
      { error: "Erro ao rastrear encomenda" },
      { status: 500 }
    );
  }
}
