import { prisma } from "./prisma";
import { sendInvoiceEmail } from "./email-service";

let nuvemFiscalToken: string | null = null;
let tokenExpiry: Date | null = null;

async function getNuvemFiscalToken(): Promise<string> {
  if (nuvemFiscalToken && tokenExpiry && new Date() < tokenExpiry) {
    return nuvemFiscalToken;
  }

  if (!process.env.NUVEM_FISCAL_CLIENT_ID) {
    throw new Error("Nuvem Fiscal não configurada");
  }

  const response = await fetch("https://auth.nuvemfiscal.com.br/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.NUVEM_FISCAL_CLIENT_ID,
      client_secret: process.env.NUVEM_FISCAL_CLIENT_SECRET || "",
      scope: "nfe cnpj",
    }),
  });

  const data = await response.json();
  nuvemFiscalToken = data.access_token;
  tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);
  return nuvemFiscalToken!;
}

function getAliquotaICMS(uf: string): number {
  const aliquotas: Record<string, number> = {
    SP: 15, RJ: 20, MG: 18, RS: 17, SC: 17, PR: 12,
    BA: 18, GO: 17, PE: 18, CE: 18, AM: 20, PA: 17,
    MA: 20, ES: 17, MT: 17, MS: 17, DF: 18, RN: 18,
    PB: 18, AL: 19, SE: 19, TO: 18, RO: 17, AC: 17,
    AP: 18, RR: 17, PI: 21,
  };
  return aliquotas[uf] || 17;
}

export async function emitirNFe(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      user: true,
      shippingAddress: true,
    },
  });

  if (!order) throw new Error("Pedido não encontrado");

  const aliquotaICMS = getAliquotaICMS(order.shippingAddress?.state || "SP");

  const payload = {
    natureza_operacao: "Venda de Mercadoria",
    serie: 1,
    tipo_documento: 1,
    emitente: {
      cnpj: process.env.EMPRESA_CNPJ?.replace(/\D/g, "") || "",
      razao_social: process.env.EMPRESA_RAZAO_SOCIAL || "",
      nome_fantasia: process.env.EMPRESA_NOME_FANTASIA || "",
      inscricao_estadual: process.env.EMPRESA_IE || "",
      regime_tributario: parseInt(process.env.EMPRESA_REGIME_TRIBUTARIO || "1"),
      endereco: {
        logradouro: process.env.EMPRESA_LOGRADOURO || "",
        numero: process.env.EMPRESA_NUMERO || "",
        bairro: process.env.EMPRESA_BAIRRO || "",
        municipio: process.env.EMPRESA_MUNICIPIO || "",
        uf: process.env.EMPRESA_UF || "",
        cep: process.env.EMPRESA_CEP || "",
        telefone: process.env.EMPRESA_TELEFONE || "",
      },
    },
    destinatario: {
      cpf: order.billingCpf?.replace(/\D/g, "") || undefined,
      nome: order.billingName,
      email: order.billingEmail,
      endereco: {
        logradouro: order.shippingAddress?.street || "",
        numero: order.shippingAddress?.number || "",
        complemento: order.shippingAddress?.complement || "",
        bairro: order.shippingAddress?.neighborhood || "",
        municipio: order.shippingAddress?.city || "",
        uf: order.shippingAddress?.state || "",
        cep: order.shippingAddress?.zipCode?.replace("-", "") || "",
      },
    },
    itens: order.items.map((item, index) => ({
      numero_item: index + 1,
      codigo_produto: item.product.sku,
      descricao: item.product.name,
      cfop: item.product.cfop || "5102",
      ncm: item.product.ncm || "2208.90.00",
      quantidade_comercial: item.quantity,
      valor_unitario_comercial: Number(item.unitPrice),
      valor_total_bruto: Number(item.unitPrice) * item.quantity,
      codigo_ean: "SEM GTIN",
      unidade_comercial: "UN",
      icms: {
        origem: 0,
        cst: "102",
        modalidade_base_calculo: 3,
        valor_base_calculo: Number(item.unitPrice) * item.quantity,
        aliquota: aliquotaICMS,
        valor: (Number(item.unitPrice) * item.quantity * aliquotaICMS) / 100,
      },
      pis: { cst: "07" },
      cofins: { cst: "07" },
    })),
    transporte: {
      modalidade_frete: 1,
      volume: {
        quantidade: 1,
        especie: "Caixa",
        peso_bruto:
          order.items.reduce(
            (acc, item) =>
              acc + ((item.product.weightGrams || 800) * item.quantity),
            0
          ) / 1000,
        peso_liquido:
          order.items.reduce(
            (acc, item) =>
              acc + ((item.product.weightGrams || 750) * item.quantity),
            0
          ) / 1000,
      },
    },
    cobranca: {
      fatura: {
        numero: order.orderNumber,
        valor_original: Number(order.totalAmount),
        valor_liquido: Number(order.totalAmount),
      },
    },
    totais: {
      valor_produtos: Number(order.subtotal),
      valor_frete: Number(order.shippingCost),
      valor_total: Number(order.totalAmount),
    },
    informacoes_adicionais: {
      contribuinte: `Pedido: ${order.orderNumber}. Venda sujeita a Lei 9.294/1996. Proibida a venda para menores de 18 anos.`,
    },
  };

  if (!process.env.NUVEM_FISCAL_CLIENT_ID) {
    const mockNfe = await mockEmitirNFe(order);
    return mockNfe;
  }

  try {
    const token = await getNuvemFiscalToken();

    const response = await fetch(
      `${process.env.NUVEM_FISCAL_BASE_URL}/nfe`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const nfeData = await response.json();

    if (!response.ok) {
      throw new Error(nfeData.message || "Erro ao emitir NFe");
    }

    await prisma.invoice.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        userId: order.userId,
        nfeNumber: nfeData.numero,
        nfeSeries: String(nfeData.serie),
        nfeKey: nfeData.chave_acesso,
        nfeUrl: nfeData.link_consulta_portal,
        pdfUrl: nfeData.link_download_pdf,
        status: "AUTHORIZED",
        totalAmount: order.totalAmount,
        nuvemFiscalId: nfeData.id,
        nuvemFiscalResponse: nfeData,
        issuedAt: new Date(),
      },
      update: {
        nfeNumber: nfeData.numero,
        nfeSeries: String(nfeData.serie),
        nfeKey: nfeData.chave_acesso,
        nfeUrl: nfeData.link_consulta_portal,
        pdfUrl: nfeData.link_download_pdf,
        status: "AUTHORIZED",
        nuvemFiscalId: nfeData.id,
        nuvemFiscalResponse: nfeData,
        issuedAt: new Date(),
      },
    });

    await sendInvoiceEmail(order.id, nfeData);
    return nfeData;
  } catch (error: any) {
    await prisma.invoice.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        userId: order.userId,
        status: "FAILED",
        errorMessage: error.message,
      },
      update: {
        status: "FAILED",
        errorMessage: error.message,
      },
    });

    console.error("Erro ao emitir NFe:", error);
    throw error;
  }
}

async function mockEmitirNFe(order: any) {
  const nfeKey = `352${new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 34)}`.padEnd(44, "0");
  const nfeNumber = String(Math.floor(Math.random() * 100000) + 1).padStart(6, "0");

  await prisma.invoice.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      userId: order.userId,
      nfeNumber,
      nfeSeries: "1",
      nfeKey,
      status: "AUTHORIZED",
      totalAmount: order.totalAmount,
      issuedAt: new Date(),
    },
    update: {
      nfeNumber,
      nfeKey,
      status: "AUTHORIZED",
      issuedAt: new Date(),
    },
  });

  return {
    numero: nfeNumber,
    serie: "1",
    chave_acesso: nfeKey,
  };
}
