"use client";

import { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  CreditCard,
  CheckCircle2,
  XCircle,
  Settings,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

interface IntegrationStatus {
  name: string;
  description: string;
  envKey: string;
  status: "connected" | "disconnected" | "unknown";
  icon: React.ElementType;
}

export default function AdminConfiguracoesPage() {
  const [companyInfo, setCompanyInfo] = useState({
    brandName: "Stillare",
    contactEmail: "contato@stillare.com.br",
    contactPhone: "(11) 99999-9999",
    cnpj: "00.000.000/0001-00",
  });

  const integrations: IntegrationStatus[] = [
    {
      name: "Mercado Pago",
      description: "Gateway de pagamentos",
      envKey: "MERCADO_PAGO_ACCESS_TOKEN",
      status: process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
        ? "connected"
        : "disconnected",
      icon: CreditCard,
    },
    {
      name: "Correios",
      description: "Cálculo e rastreio de fretes",
      envKey: "CORREIOS_API_KEY",
      status: "unknown",
      icon: ExternalLink,
    },
    {
      name: "Nuvem Fiscal",
      description: "Emissão de notas fiscais",
      envKey: "NUVEM_FISCAL_API_KEY",
      status: "unknown",
      icon: Building2,
    },
    {
      name: "SendGrid",
      description: "Envio de emails transacionais",
      envKey: "SENDGRID_API_KEY",
      status: "unknown",
      icon: Mail,
    },
    {
      name: "Cloudinary",
      description: "Upload e otimização de imagens",
      envKey: "CLOUDINARY_CLOUD_NAME",
      status: "unknown",
      icon: ExternalLink,
    },
  ];

  const handleSaveCompany = () => {
    toast.success("Informações da empresa salvas!");
  };

  const getStatusBadge = (status: IntegrationStatus["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px] gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Conectado
          </Badge>
        );
      case "disconnected":
        return (
          <Badge className="bg-red-500/10 text-red-400 border-0 text-[10px] gap-1">
            <XCircle className="h-3 w-3" />
            Desconectado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/10 text-yellow-400 border-0 text-[10px] gap-1">
            <XCircle className="h-3 w-3" />
            Não configurado
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-amber-100">
          Configurações
        </h1>
        <p className="text-amber-100/40 text-sm mt-1">
          Gerencie as configurações da loja e integrações
        </p>
      </div>

      <Card className="bg-[#120a04] border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-400" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="brandName" className="text-amber-100/70">
              Nome da Marca
            </Label>
            <Input
              id="brandName"
              value={companyInfo.brandName}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, brandName: e.target.value })
              }
              className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail" className="text-amber-100/70">
                Email de Contato
              </Label>
              <Input
                id="contactEmail"
                value={companyInfo.contactEmail}
                onChange={(e) =>
                  setCompanyInfo({
                    ...companyInfo,
                    contactEmail: e.target.value,
                  })
                }
                className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone" className="text-amber-100/70">
                Telefone
              </Label>
              <Input
                id="contactPhone"
                value={companyInfo.contactPhone}
                onChange={(e) =>
                  setCompanyInfo({
                    ...companyInfo,
                    contactPhone: e.target.value,
                  })
                }
                className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="cnpj" className="text-amber-100/70">
              CNPJ
            </Label>
            <Input
              id="cnpj"
              value={companyInfo.cnpj}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, cnpj: e.target.value })
              }
              className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100 font-mono"
            />
          </div>
          <div className="pt-2">
            <Button
              onClick={handleSaveCompany}
              className="bg-amber-500 hover:bg-amber-600 text-black font-medium gap-2"
            >
              Salvar Informações
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#120a04] border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-amber-400" />
            Status das Integrações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {integrations.map((integration, index) => (
            <div key={integration.name}>
              {index > 0 && <Separator className="bg-amber-500/10" />}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10">
                    <integration.icon className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-amber-100 font-medium text-sm">
                      {integration.name}
                    </p>
                    <p className="text-amber-100/40 text-xs">
                      {integration.description}
                    </p>
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-[#120a04] border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-amber-100 text-lg">
            Variáveis de Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-100/50 text-sm mb-4">
            As integrações são configuradas através de variáveis de ambiente no
            arquivo <code className="text-amber-300">.env.local</code>.
            Consulte a documentação para configurar cada serviço.
          </p>
          <div className="space-y-2 text-xs">
            {integrations.map((integration) => (
              <div
                key={integration.envKey}
                className="flex items-center justify-between p-2 bg-[#0c0602] rounded"
              >
                <code className="text-amber-300">{integration.envKey}</code>
                <span className="text-amber-100/30">{integration.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
