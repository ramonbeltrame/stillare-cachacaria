"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Package,
  Edit,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { formatCurrency, cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock: number;
  reorderLevel: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  category: Category;
  images: { id: string; imageUrl: string; isPrimary: boolean }[];
  createdAt: string;
}

interface ProductsResponse {
  products: Product[];
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Erro ao carregar");
      const data: ProductsResponse = await res.json();
      setProducts(data.products);
    } catch {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const toggleProductStatus = async (product: Product) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, isActive: !product.isActive }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar");
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isActive: !p.isActive } : p
        )
      );
      toast.success(
        product.isActive ? "Produto desativado" : "Produto ativado"
      );
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || p.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-amber-500/5 rounded" />
        <div className="flex gap-4">
          <div className="h-10 flex-1 bg-amber-500/5 rounded" />
          <div className="h-10 w-40 bg-amber-500/5 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-amber-500/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-amber-100">
            Produtos
          </h1>
          <p className="text-amber-100/40 text-sm mt-1">
            {products.length} produto{products.length !== 1 ? "s" : ""}{" "}
            cadastrado{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/produtos/novo">
          <Button className="bg-amber-500 hover:bg-amber-600 text-black font-medium gap-2">
            <Plus className="h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
          <Input
            placeholder="Buscar por nome ou SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 bg-[#120a04] border-amber-500/20 text-amber-100 placeholder:text-amber-100/30"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48 bg-[#120a04] border-amber-500/20 text-amber-100">
            <SelectValue placeholder="Todas categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {paginatedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package className="h-12 w-12 text-amber-500/20 mb-4" />
          <h2 className="text-xl font-semibold text-amber-100 mb-2">
            Nenhum produto encontrado
          </h2>
          <p className="text-amber-100/40 mb-6">
            {search || categoryFilter !== "all"
              ? "Tente ajustar os filtros de busca."
              : "Comece cadastrando seu primeiro produto."}
          </p>
          {!search && categoryFilter === "all" && (
            <Link href="/admin/produtos/novo">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-medium gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-[#120a04] border border-amber-500/20 rounded-xl overflow-hidden hover:border-amber-500/40 transition-colors"
              >
                <div className="aspect-video bg-zinc-800 relative flex items-center justify-center">
                  {product.images?.[0]?.imageUrl ? (
                    <img
                      src={product.images[0].imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-amber-500/20" />
                  )}
                  {!product.isActive && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge className="bg-red-500/90 text-white border-0 text-xs">
                        Inativo
                      </Badge>
                    </div>
                  )}
                  {product.isFeatured && product.isActive && (
                    <Badge className="absolute top-2 right-2 bg-amber-500 text-black border-0 text-[10px] font-semibold">
                      Destaque
                    </Badge>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-amber-100 font-semibold truncate">
                        {product.name}
                      </h3>
                      <p className="text-amber-100/40 text-xs mt-0.5">
                        {product.category?.name || "—"} · {product.sku}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "border-0 text-[10px] font-medium shrink-0",
                        product.isActive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      )}
                    >
                      {product.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-amber-400">
                      {formatCurrency(Number(product.price) || 0)}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        product.stock <= 0
                          ? "text-red-400"
                          : product.stock <= (product.reorderLevel || 10)
                          ? "text-yellow-400"
                          : "text-amber-100/60"
                      )}
                    >
                      {product.stock} em estoque
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-amber-500/10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/admin/produtos/${product.id}`)
                      }
                      className="flex-1 text-amber-300 hover:text-amber-100 hover:bg-amber-500/10 gap-1.5"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleProductStatus(product)}
                      className={cn(
                        "flex-1 gap-1.5",
                        product.isActive
                          ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                      )}
                    >
                      {product.isActive ? (
                        <>
                          <ToggleRight className="h-3.5 w-3.5" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-3.5 w-3.5" />
                          Ativar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-amber-500/20 text-amber-100/60 hover:text-amber-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-amber-100/60 px-4">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-amber-500/20 text-amber-100/60 hover:text-amber-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
