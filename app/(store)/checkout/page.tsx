"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Check,
  CreditCard,
  MapPin,
  Package,
  Plus,
  ArrowLeft,
  Truck,
  Ticket,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CheckoutSteps } from "@/components/store/CheckoutSteps";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency, maskCep, maskPhone } from "@/lib/utils";

type Step = "identificacao" | "frete" | "pagamento";

const stepToNumber: Record<Step, 1 | 2 | 3> = {
  identificacao: 1,
  frete: 2,
  pagamento: 3,
};

interface Address {
  id: string;
  recipientName: string;
  phone?: string | null;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface ShippingOption {
  code: string;
  name: string;
  deliveryDays: number;
  price: number;
}

const newAddressSchema = z.object({
  recipientName: z.string().min(3, "Nome obrigatório"),
  phone: z.string().optional(),
  street: z.string().min(3, "Rua obrigatória"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().min(2, "Estado obrigatório"),
  zipCode: z.string().min(8, "CEP obrigatório"),
});

type NewAddressForm = z.infer<typeof newAddressSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();

  const [currentStep, setCurrentStep] = useState<Step>("identificacao");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [customerNotes, setCustomerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null>(null);

  const total = subtotal();
  const isEmpty = items.length === 0;

  const newAddressForm = useForm<NewAddressForm>({
    resolver: zodResolver(newAddressSchema),
    defaultValues: {
      recipientName: "",
      phone: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "SP",
      zipCode: "",
    },
  });

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await fetch("/api/addresses");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.addresses || [];
          setAddresses(list);
          const defaultAddr = list.find((a: Address) => a.isDefault);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else if (list.length > 0) setSelectedAddressId(list[0].id);
        }
      } catch {}
    }
    fetchAddresses();
  }, []);

  const handleCepSearch = useCallback(async () => {
    const zip = newAddressForm.getValues("zipCode")?.replace(/\D/g, "");
    if (!zip || zip.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
      const data = await res.json();
      if (!data.erro) {
        newAddressForm.setValue("street", data.logradouro || "");
        newAddressForm.setValue("neighborhood", data.bairro || "");
        newAddressForm.setValue("city", data.localidade || "");
        newAddressForm.setValue("state", data.uf || "SP");
      }
    } catch {} finally {
      setCepLoading(false);
    }
  }, [newAddressForm]);

  const handleSaveAddress = async (data: NewAddressForm) => {
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, zipCode: data.zipCode.replace(/\D/g, "") }),
      });
      if (res.ok) {
        const saved = await res.json();
        const newAddr = saved.address || saved;
        setAddresses((prev) => [...prev, newAddr]);
        setSelectedAddressId(newAddr.id);
        setShowNewAddress(false);
        newAddressForm.reset();
        toast.success("Endereço salvo!");
      } else {
        toast.error("Erro ao salvar endereço");
      }
    } catch {
      toast.error("Erro ao salvar endereço");
    }
  };

  const handleShippingCalculate = useCallback(async () => {
    const address = addresses.find((a) => a.id === selectedAddressId);
    if (!address) return;

    setShippingLoading(true);
    try {
      const res = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zipCode: address.zipCode,
          items: items.map((item) => ({
            weightGrams: item.product.volumeMl
              ? Math.round(item.product.volumeMl * 1.5)
              : 1000,
            quantity: item.quantity,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const options = data.shippingOptions || data.options || [];
        setShippingOptions(options);
        if (options.length > 0) setSelectedShipping(options[0].code);
      }
    } catch {} finally {
      setShippingLoading(false);
    }
  }, [addresses, selectedAddressId, items]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal: total }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.error || "Cupom inválido");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data.coupon);
        toast.success("Cupom aplicado!");
      }
    } catch {
      setCouponError("Erro ao validar cupom");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    toast.success("Cupom removido");
  };

  const handleCreateOrder = async () => {
    if (!ageConfirmed) {
      toast.error("Confirme que você tem 18 anos ou mais");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddressId: selectedAddressId,
          shippingMethod:
            shippingOptions.find((o) => o.code === selectedShipping)?.name ||
            "PAC",
          ageConfirmed: true,
          customerNotes,
          couponId: appliedCoupon?.id || null,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || "Erro ao criar pedido");
      }

      const data = await res.json();
      const order = data.order || data;

      // Criar preferência de pagamento no Mercado Pago
      const paymentRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });

      // Limpar carrinho só depois de tudo pronto
      clearCart();

      if (paymentRes.ok) {
        const paymentData = await paymentRes.json();
        if (paymentData.init_point) {
          window.location.href = paymentData.init_point;
          return;
        }
      }

      // Fallback: sem Mercado Pago, vai pro pedido
      router.push(`/meus-pedidos/${order.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar pedido");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedShippingOption = shippingOptions.find(
    (o) => o.code === selectedShipping
  );
  const shippingCost = selectedShippingOption?.price || 0;
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const finalTotal = Math.max(0, total + shippingCost - couponDiscount);

  if (isEmpty && !submitting) {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center"
        style={{ backgroundColor: "#120a04" }}
      >
        <Package className="h-20 w-20 text-amber-500/10 mb-6" />
        <h1 className="font-display text-3xl text-amber-100 mb-3">
          Carrinho vazio
        </h1>
        <p className="text-amber-100/40 mb-8">
          Adicione produtos antes de finalizar a compra.
        </p>
        <Button
          onClick={() => router.push("/produtos")}
          className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold"
        >
          Ver Produtos
        </Button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#120a04" }}>
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Steps */}
          <div className="mb-10">
            <CheckoutSteps currentStep={stepToNumber[currentStep]} />
          </div>

          {/* STEP 1: Address */}
          {currentStep === "identificacao" && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-amber-100 mb-4 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-amber-400" />
                Endereço de Entrega
              </h2>

              {addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? "border-amber-500 bg-amber-500/5"
                          : "border-amber-500/20 bg-[#1a0f07] hover:border-amber-500/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-0.5 text-amber-500 focus:ring-amber-500/50"
                      />
                      <div>
                        <p className="text-amber-100 font-medium">
                          {addr.recipientName}
                        </p>
                        <p className="text-amber-100/50 text-sm mt-0.5">
                          {addr.street}, {addr.number}
                          {addr.complement && ` - ${addr.complement}`}
                        </p>
                        <p className="text-amber-100/50 text-sm">
                          {addr.neighborhood} - {addr.city}/{addr.state}
                        </p>
                        <p className="text-amber-100/50 text-sm">
                          CEP: {addr.zipCode.replace(/(\d{5})(\d{3})/, "$1-$2")}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {!showNewAddress ? (
                <button
                  onClick={() => setShowNewAddress(true)}
                  className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar novo endereço
                </button>
              ) : (
                <form
                  onSubmit={newAddressForm.handleSubmit(handleSaveAddress)}
                  className="p-6 rounded-lg border border-amber-500/20 bg-[#1a0f07] space-y-4"
                >
                  <h3 className="font-display text-lg text-amber-100">
                    Novo Endereço
                  </h3>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label className="text-amber-100">CEP</Label>
                      <Input
                        {...newAddressForm.register("zipCode")}
                        placeholder="00000-000"
                        maxLength={9}
                        onChange={(e) => {
                          newAddressForm.setValue(
                            "zipCode",
                            maskCep(e.target.value)
                          );
                        }}
                        className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleCepSearch}
                        disabled={cepLoading}
                        variant="outline"
                        className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10 h-10"
                      >
                        {cepLoading ? "..." : "Buscar CEP"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-amber-100">Nome do Destinatário</Label>
                      <Input
                        {...newAddressForm.register("recipientName")}
                        className="bg-[#120a04] border-amber-500/30 text-amber-100"
                      />
                      {newAddressForm.formState.errors.recipientName && (
                        <p className="text-red-400 text-xs mt-1">
                          {newAddressForm.formState.errors.recipientName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-amber-100">Telefone</Label>
                      <Input
                        {...newAddressForm.register("phone")}
                        onChange={(e) =>
                          newAddressForm.setValue(
                            "phone",
                            maskPhone(e.target.value)
                          )
                        }
                        className="bg-[#120a04] border-amber-500/30 text-amber-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <Label className="text-amber-100">Rua</Label>
                      <Input
                        {...newAddressForm.register("street")}
                        className="bg-[#120a04] border-amber-500/30 text-amber-100"
                      />
                    </div>
                    <div>
                      <Label className="text-amber-100">Número</Label>
                      <Input
                        {...newAddressForm.register("number")}
                        className="bg-[#120a04] border-amber-500/30 text-amber-100"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-amber-100">Complemento</Label>
                    <Input
                      {...newAddressForm.register("complement")}
                      className="bg-[#120a04] border-amber-500/30 text-amber-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-amber-100">Bairro</Label>
                      <Input
                        {...newAddressForm.register("neighborhood")}
                        className="bg-[#120a04] border-amber-500/30 text-amber-100"
                      />
                    </div>
                    <div>
                      <Label className="text-amber-100">Cidade</Label>
                      <Input
                        {...newAddressForm.register("city")}
                        className="bg-[#120a04] border-amber-500/30 text-amber-100"
                      />
                    </div>
                    <div>
                      <Label className="text-amber-100">Estado</Label>
                      <Input
                        {...newAddressForm.register("state")}
                        maxLength={2}
                        className="bg-[#120a04] border-amber-500/30 text-amber-100"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowNewAddress(false)}
                      className="text-amber-100/60 hover:text-amber-100"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold"
                    >
                      Salvar Endereço
                    </Button>
                  </div>
                </form>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => {
                    if (!selectedAddressId) {
                      toast.error("Selecione um endereço de entrega");
                      return;
                    }
                    setCurrentStep("frete");
                    handleShippingCalculate();
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12 px-8"
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping */}
          {currentStep === "frete" && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-amber-100 mb-4 flex items-center gap-2">
                <Truck className="h-6 w-6 text-amber-400" />
                Método de Envio
              </h2>

              {shippingLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-16 rounded-lg bg-amber-500/5 animate-pulse"
                    />
                  ))}
                </div>
              ) : shippingOptions.length > 0 ? (
                <div className="space-y-3">
                  {shippingOptions.map((opt) => (
                    <label
                      key={opt.code}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedShipping === opt.code
                          ? "border-amber-500 bg-amber-500/5"
                          : "border-amber-500/20 bg-[#1a0f07] hover:border-amber-500/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={selectedShipping === opt.code}
                          onChange={() => setSelectedShipping(opt.code)}
                          className="text-amber-500 focus:ring-amber-500/50"
                        />
                        <div>
                          <p className="text-amber-100 font-medium">
                            {opt.name}
                          </p>
                          <p className="text-amber-100/40 text-xs mt-0.5">
                            Prazo de até {opt.deliveryDays} dias úteis
                          </p>
                        </div>
                      </div>
                      <span className="text-amber-400 font-semibold">
                        {opt.price === 0 ? "Grátis" : formatCurrency(opt.price)}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-amber-100/40 text-center py-8">
                  Nenhuma opção de frete disponível para o CEP informado.
                </p>
              )}

              {/* Coupon Input */}
              <div
                className="p-4 rounded-lg border border-amber-500/20"
                style={{ backgroundColor: "#1a0f07" }}
              >
                <h4 className="text-amber-100/70 text-sm font-medium mb-3 flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-amber-400" />
                  Cupom de Desconto
                </h4>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-3">
                    <div>
                      <span className="text-emerald-400 font-semibold text-sm">{appliedCoupon.code}</span>
                      <span className="text-emerald-300/70 text-xs ml-2">
                        -{formatCurrency(appliedCoupon.discountAmount)}
                      </span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-amber-100/40 hover:text-red-400 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código do cupom"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                      className="bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 flex-1"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      variant="outline"
                      className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10"
                    >
                      {couponLoading ? "..." : "Aplicar"}
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="text-red-400 text-xs mt-2">{couponError}</p>
                )}
              </div>

              {/* Order Summary */}
              <div
                className="p-6 rounded-lg border border-amber-500/20"
                style={{ backgroundColor: "#1a0f07" }}
              >
                <h3 className="font-display text-lg text-amber-100 mb-4">
                  Resumo do Pedido
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-amber-100/60">
                        {item.product.name}{" "}
                        <span className="text-amber-100/30">
                          x{item.quantity}
                        </span>
                      </span>
                      <span className="text-amber-100">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="bg-amber-500/10 my-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-amber-100/60">Subtotal</span>
                  <span className="text-amber-100">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-amber-100/60">Frete</span>
                  <span className="text-amber-100">
                    {shippingCost === 0 ? "Grátis" : formatCurrency(shippingCost)}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-emerald-400/80">Desconto</span>
                      <span className="text-emerald-400">
                        -{formatCurrency(couponDiscount)}
                      </span>
                    </div>
                  </>
                )}
                <Separator className="bg-amber-500/10 my-3" />
                <div className="flex justify-between">
                  <span className="font-display text-amber-100">Total</span>
                  <span className="font-display text-xl text-amber-400 font-semibold">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep("identificacao")}
                  className="text-amber-100/60 hover:text-amber-100"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={() => {
                    if (!selectedShipping) {
                      toast.error("Selecione um método de envio");
                      return;
                    }
                    setCurrentStep("pagamento");
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-[#1a0f07] font-semibold h-12 px-8"
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {currentStep === "pagamento" && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-amber-100 mb-4 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-amber-400" />
                Pagamento
              </h2>

              <div
                className="p-6 rounded-lg border border-amber-500/20"
                style={{ backgroundColor: "#1a0f07" }}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="ageConfirm"
                    checked={ageConfirmed}
                    onChange={(e) => setAgeConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-amber-500/30 bg-[#120a04] text-amber-500 focus:ring-amber-500/50"
                  />
                  <label
                    htmlFor="ageConfirm"
                    className="text-amber-100/80 text-sm leading-relaxed cursor-pointer"
                  >
                    Confirmo que tenho 18 anos ou mais e estou ciente de que a
                    venda de bebidas alcoólicas é proibida para menores de
                    idade, conforme Lei 9.294/1996.
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-amber-100 mb-2 block">
                  Observações (opcional)
                </Label>
                <Textarea
                  placeholder="Instruções adicionais para o pedido..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={3}
                  className="bg-[#1a0f07] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500 resize-none"
                />
              </div>

              {/* Summary Recap */}
              <div
                className="p-6 rounded-lg border border-amber-500/20"
                style={{ backgroundColor: "#1a0f07" }}
              >
                <h3 className="font-display text-lg text-amber-100 mb-4">
                  Resumo Final
                </h3>
                <div className="space-y-2 text-sm">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between"
                    >
                      <span className="text-amber-100/50">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span className="text-amber-100/60">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator className="bg-amber-500/10 my-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-amber-100/60">Frete ({selectedShippingOption?.name})</span>
                  <span className="text-amber-100">
                    {shippingCost === 0 ? "Grátis" : formatCurrency(shippingCost)}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-emerald-400/80">Desconto ({appliedCoupon?.code})</span>
                      <span className="text-emerald-400">
                        -{formatCurrency(couponDiscount)}
                      </span>
                    </div>
                  </>
                )}
                <Separator className="bg-amber-500/10 my-3" />
                <div className="flex justify-between">
                  <span className="font-display text-lg text-amber-100">Total</span>
                  <span className="font-display text-2xl text-amber-400 font-semibold">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep("frete")}
                  className="text-amber-100/60 hover:text-amber-100"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  disabled={submitting || !selectedShipping}
                  className="bg-green-600 hover:bg-green-500 text-white font-semibold h-14 px-10 text-lg"
                >
                  {submitting ? (
                    "Processando..."
                  ) : (
                    <>
                      Pagar com Mercado Pago
                      <CreditCard className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
