export async function calcularFrete(params: {
  cepDestino: string;
  peso: number;
  comprimento: number;
  largura: number;
  altura: number;
}) {
  const cepOrigem = process.env.CORREIOS_ORIGIN_ZIP || "13400000";

  if (!process.env.CORREIOS_USER) {
    return mockCalcularFrete(params);
  }

  try {
    const token = await getCorreiosToken();
    const servicos = ["03298", "03220"];

    const response = await fetch(
      "https://api.correios.com.br/preco/v1/nacional",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idLote: "1",
          parametrosProduto: servicos.map((servico) => ({
            coProduto: servico,
            nuRequisicao: "1",
            cepOrigem,
            cepDestino: params.cepDestino.replace("-", ""),
            psObjeto: String(Math.ceil((params.peso / 1000) * 100) / 100),
            tpObjeto: "2",
            comprimento: params.comprimento,
            largura: params.largura,
            altura: params.altura,
            servicosAdicionais: ["001"],
            vlDeclarado: "0",
          })),
        }),
      }
    );

    const data = await response.json();
    if (!data.parametrosProduto) return mockCalcularFrete(params);

    return data.parametrosProduto.map((item: any) => ({
      code: item.coProduto,
      name: item.coProduto === "03298" ? "PAC" : "SEDEX",
      deliveryDays: parseInt(item.prazoEntrega),
      price: parseFloat(item.pcFinal.replace(",", ".")),
    }));
  } catch {
    return mockCalcularFrete(params);
  }
}

function mockCalcularFrete(params: { cepDestino: string }) {
  const basePricePAC = 18.5;
  const basePriceSEDEX = 35.0;
  const digits = params.cepDestino.replace(/\D/g, "").padEnd(8, "0");
  const factor = 0.85 + (parseInt(digits.slice(0, 4)) % 30) / 100;

  return [
    {
      code: "03298",
      name: "PAC",
      deliveryDays: 10 + (parseInt(digits[5]) || 0),
      price: Number((basePricePAC * factor).toFixed(2)),
    },
    {
      code: "03220",
      name: "SEDEX",
      deliveryDays: 3 + (parseInt(digits[5]) % 3 || 0),
      price: Number((basePriceSEDEX * factor).toFixed(2)),
    },
  ];
}

async function getCorreiosToken(): Promise<string> {
  if (!process.env.CORREIOS_USER || !process.env.CORREIOS_PASSWORD) {
    throw new Error("Credenciais dos Correios não configuradas");
  }

  // Se tiver cartão, usa autenticação com cartão
  if (process.env.CORREIOS_CARD) {
    const response = await fetch(
      "https://api.correios.com.br/token/v1/autentica/cartaopostagem",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.CORREIOS_USER}:${process.env.CORREIOS_PASSWORD}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ numero: process.env.CORREIOS_CARD }),
      }
    );
    const data = await response.json();
    return data.token;
  }

  // Sem cartão: autenticação simples com o código de acesso
  const response = await fetch(
    "https://api.correios.com.br/token/v1/autentica/contrato",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.CORREIOS_USER}:${process.env.CORREIOS_PASSWORD}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );
  const data = await response.json();
  return data.token;
}

export async function rastrearEncomenda(codigoRastreamento: string) {
  if (!process.env.CORREIOS_USER) {
    return mockRastrearEncomenda(codigoRastreamento);
  }

  try {
    const token = await getCorreiosToken();
    const response = await fetch(
      `https://api.correios.com.br/sro/v1/objetos?codigosObjetos=${codigoRastreamento}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();
    const objeto = data.objetos?.[0];
    if (!objeto) return null;

    return {
      trackingCode: objeto.codObjeto,
      status: mapTrackingStatus(objeto.eventos?.[0]?.tipo),
      events: (objeto.eventos || []).map((evento: any) => ({
        date: evento.dtHrCriado,
        status: evento.descricao,
        location: `${evento.unidade?.endereco?.cidade || ""}, ${evento.unidade?.endereco?.uf || ""}`,
        message: evento.detalhe || "",
      })),
    };
  } catch {
    return mockRastrearEncomenda(codigoRastreamento);
  }
}

function mockRastrearEncomenda(codigo: string) {
  return {
    trackingCode: codigo,
    status: "IN_TRANSIT",
    events: [
      {
        date: new Date(Date.now() - 86400000).toISOString(),
        status: "Objeto postado",
        location: "Charqueada, SP",
        message: "Objeto encaminhado para tratamento",
      },
      {
        date: new Date(Date.now() - 43200000).toISOString(),
        status: "Objeto em trânsito",
        location: "Piracicaba, SP",
        message: "Objeto encaminhado para unidade de destino",
      },
    ],
  };
}

function mapTrackingStatus(tipo: string): string {
  const map: Record<string, string> = {
    PO: "PENDING",
    RO: "IN_TRANSIT",
    DO: "IN_TRANSIT",
    TO: "IN_TRANSIT",
    OEC: "OUT_FOR_DELIVERY",
    BDE: "DELIVERED",
    BD: "DELIVERED",
    BDI: "DELIVERED",
  };
  return map[tipo] || "IN_TRANSIT";
}
