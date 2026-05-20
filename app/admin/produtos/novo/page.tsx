"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";

const productFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug obrigatório"),
  sku: z.string().min(1, "SKU obrigatório"),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  price: z.coerce.number().positive("Preço deve ser positivo"),
  costPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0, "Estoque não pode ser negativo"),
  reorderLevel: z.coerce.number().int().min(0).default(10),
  ncm: z.string().default("2208.90.00"),
  cfop: z.string().default("5102"),
  volumeMl: z.coerce.number().int().positive().optional().or(z.literal("")),
  alcoholPercentage: z.coerce.number().positive().optional().or(z.literal("")),
  madeira: z.string().optional(),
  weightGrams: z.coerce.number().int().positive().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface Category {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      categoryId: "",
      description: "",
      longDescription: "",
      price: 0,
      costPrice: undefined,
      stock: 0,
      reorderLevel: 10,
      ncm: "2208.90.00",
      cfop: "5102",
      volumeMl: "",
      alcoholPercentage: "",
      madeira: "",
      weightGrams: "",
      isActive: true,
      isFeatured: false,
    },
  });

  const nameValue = watch("name");
  const isActive = watch("isActive");
  const isFeatured = watch("isFeatured");

  useEffect(() => {
    if (nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, setValue]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);

    const previews = newImages.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p));
      return previews;
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of images) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          urls.push(data.url);
        }
      } catch {
        toast.error(`Erro ao fazer upload de ${file.name}`);
      }
    }
    return urls;
  };

  const onSubmit = async (data: ProductFormData) => {
    setSubmitting(true);
    try {
      const imageUrls = await uploadImages();

      const productData: any = { ...data };
      if (productData.volumeMl === "") delete productData.volumeMl;
      if (productData.alcoholPercentage === "") delete productData.alcoholPercentage;
      if (productData.madeira === "") productData.madeira = null;
      if (productData.weightGrams === "") delete productData.weightGrams;
      if (!productData.costPrice) delete productData.costPrice;

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao criar produto");
      }

      const created = await res.json();

      if (imageUrls.length > 0 && created.product?.id) {
        for (let i = 0; i < imageUrls.length; i++) {
          await fetch("/api/admin/products", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: created.product.id,
              images: {
                create: {
                  imageUrl: imageUrls[i],
                  displayOrder: i,
                  isPrimary: i === 0,
                },
              },
            }),
          });
        }
      }

      toast.success("Produto criado com sucesso!");
      router.push("/admin/produtos");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar produto");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-amber-100/60 hover:text-amber-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-amber-100">
            Novo Produto
          </h1>
          <p className="text-amber-100/40 text-sm mt-1">
            Preencha os dados para cadastrar um novo produto
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="bg-[#120a04] border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-100 text-lg">
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="categoryId" className="text-amber-100/70">
                Categoria <span className="text-red-400">*</span>
              </Label>
              <Select
                value={watch("categoryId")}
                onValueChange={(v) => setValue("categoryId", v)}
              >
                <SelectTrigger className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="image-upload" className="text-amber-100/70">
                Imagens do Produto
              </Label>
              <div className="mt-1.5 flex flex-wrap gap-3">
                {imagePreviews.map((preview, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-amber-500/20"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-500/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-amber-500/80 text-black text-[9px] text-center font-semibold">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-24 h-24 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-colors">
                    <ImagePlus className="h-6 w-6 text-amber-100/30" />
                    <span className="text-[10px] text-amber-100/30">2MB max</span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-amber-100/30 text-xs mt-1">
                Até 5 imagens. JPG, PNG, WebP ou AVIF.
              </p>
            </div>

            <div>
              <Label htmlFor="name" className="text-amber-100/70">
                Nome <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Nome do produto"
                className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="slug" className="text-amber-100/70">
                Slug <span className="text-red-400">*</span>
              </Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="slug-do-produto"
                className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100 font-mono text-sm"
              />
              <p className="text-amber-100/30 text-xs mt-1">
                Gerado automaticamente a partir do nome
              </p>
              {errors.slug && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sku" className="text-amber-100/70">
                  SKU <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="sku"
                  {...register("sku")}
                  placeholder="Ex: STL-001"
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
                {errors.sku && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.sku.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="volumeMl" className="text-amber-100/70">
                  Volume (ml)
                </Label>
                <Input
                  id="volumeMl"
                  {...register("volumeMl")}
                  type="number"
                  placeholder="700"
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
              </div>
              <div>
                <Label htmlFor="alcoholPercentage" className="text-amber-100/70">
                  Teor Alcoólico (%)
                </Label>
                <Input
                  id="alcoholPercentage"
                  {...register("alcoholPercentage")}
                  type="number"
                  step="0.1"
                  placeholder="42.0"
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
              </div>
            </div>

              <div>
                <Label htmlFor="madeira" className="text-amber-100/70">
                  Madeira
                </Label>
                <Select
                  value={watch("madeira") || ""}
                  onValueChange={(v) => setValue("madeira", v)}
                >
                  <SelectTrigger className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100">
                    <SelectValue placeholder="Selecione o tipo de madeira" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma (Prata/Branca)</SelectItem>
                    <SelectItem value="Carvalho Europeu">Carvalho Europeu</SelectItem>
                    <SelectItem value="Carvalho Americano (Ex-Bourbon)">Carvalho Americano (Ex-Bourbon)</SelectItem>
                    <SelectItem value="Carvalho Europeu + Amburana">Carvalho Europeu + Amburana</SelectItem>
                    <SelectItem value="Amburana">Amburana</SelectItem>
                    <SelectItem value="Jequitibá Rosa">Jequitibá Rosa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-amber-100/70">
                Descrição Curta
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Breve descrição do produto"
                rows={2}
                className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100 resize-none"
              />
            </div>

            <div>
              <Label htmlFor="longDescription" className="text-amber-100/70">
                Descrição Longa
              </Label>
              <Textarea
                id="longDescription"
                {...register("longDescription")}
                placeholder="Descrição detalhada com notas de degustação e informações completas"
                rows={4}
                className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#120a04] border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-100 text-lg">
              Preço e Estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-amber-100/70">
                  Preço (R$) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="price"
                  {...register("price")}
                  type="number"
                  step="0.01"
                  placeholder="149.90"
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
                {errors.price && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="costPrice" className="text-amber-100/70">
                  Preço de Custo (R$)
                </Label>
                <Input
                  id="costPrice"
                  {...register("costPrice")}
                  type="number"
                  step="0.01"
                  placeholder="89.90"
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock" className="text-amber-100/70">
                  Estoque <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="stock"
                  {...register("stock")}
                  type="number"
                  placeholder="100"
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
                {errors.stock && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.stock.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="reorderLevel" className="text-amber-100/70">
                  Estoque Mínimo
                </Label>
                <Input
                  id="reorderLevel"
                  {...register("reorderLevel")}
                  type="number"
                  placeholder="10"
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="weightGrams" className="text-amber-100/70">
                Peso (gramas)
              </Label>
              <Input
                id="weightGrams"
                {...register("weightGrams")}
                type="number"
                placeholder="1200"
                className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100 max-w-xs"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#120a04] border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-100 text-lg">
              Dados Fiscais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ncm" className="text-amber-100/70">
                  NCM
                </Label>
                <Input
                  id="ncm"
                  {...register("ncm")}
                  disabled
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100/50"
                />
              </div>
              <div>
                <Label htmlFor="cfop" className="text-amber-100/70">
                  CFOP
                </Label>
                <Input
                  id="cfop"
                  {...register("cfop")}
                  disabled
                  className="mt-1.5 bg-[#1a0f05] border-amber-500/20 text-amber-100/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#120a04] border-amber-500/20">
          <CardHeader>
            <CardTitle className="text-amber-100 text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setValue("isActive", e.target.checked)}
                  className="w-4 h-4 rounded border-amber-500/30 bg-[#1a0f05] text-amber-500 focus:ring-amber-500/30"
                />
                <span className="text-amber-100/70 text-sm">Produto Ativo</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setValue("isFeatured", e.target.checked)}
                  className="w-4 h-4 rounded border-amber-500/30 bg-[#1a0f05] text-amber-500 focus:ring-amber-500/30"
                />
                <span className="text-amber-100/70 text-sm">
                  Produto em Destaque
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 pb-8">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-amber-500 hover:bg-amber-600 text-black font-medium gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {submitting ? "Salvando..." : "Salvar Produto"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="text-amber-100/60 hover:text-amber-300"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
