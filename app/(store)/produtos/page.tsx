"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  volumeMl?: number | null;
  alcoholPercentage?: number | null;
  stock: number;
  isFeatured?: boolean;
}

const sortOptions = [
  { value: "relevance", label: "Relevância" },
  { value: "price_asc", label: "Menor Preço" },
  { value: "price_desc", label: "Maior Preço" },
  { value: "name_asc", label: "A-Z" },
];

const volumeOptions = [
  { value: "500", label: "500ml" },
  { value: "700", label: "700ml" },
  { value: "750", label: "750ml" },
];

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#120a04" }}>
        <div className="font-display text-2xl text-amber-400">Carregando catálogo...</div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("busca") || ""
  );
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categoria") ? [searchParams.get("categoria")!] : []
  );
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const perPage = 12;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : data.categories || []);
        }
      } catch {}
    }
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedTerm) params.set("busca", debouncedTerm);
      selectedCategories.forEach((c) => params.append("categoria", c));
      selectedVolumes.forEach((v) => params.append("volume", v));
      if (minPrice) params.set("precoMin", minPrice);
      if (maxPrice) params.set("precoMax", maxPrice);
      params.set("ordenar", sortBy);
      params.set("pagina", String(currentPage));
      params.set("limite", String(perPage));

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.products || data.data || [];
        setProducts(list);
        setTotalCount(data.total || data.totalCount || list.length);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedTerm, selectedCategories, selectedVolumes, minPrice, maxPrice, sortBy, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
    setCurrentPage(1);
  };

  const toggleVolume = (vol: string) => {
    setSelectedVolumes((prev) =>
      prev.includes(vol) ? prev.filter((v) => v !== vol) : [...prev, vol]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedVolumes([]);
    setMinPrice("");
    setMaxPrice("");
    setSearchTerm("");
    setSortBy("relevance");
    setCurrentPage(1);
  };

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedVolumes.length > 0 ||
    minPrice ||
    maxPrice ||
    debouncedTerm;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#120a04" }}>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-amber-100 mb-2">
            Nossos Produtos
          </h1>
          <p className="text-amber-100/40 font-light">
            {loading
              ? "Carregando..."
              : `${totalCount} resultado${totalCount !== 1 ? "s" : ""}${
                  debouncedTerm ? ` para '${debouncedTerm}'` : ""
                }`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-100/30" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-11 bg-[#1a0f07] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500 w-full"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-100/30 hover:text-amber-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 rounded-md border border-amber-500/30 bg-[#1a0f07] text-amber-100 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="border-amber-500/30 text-amber-100 hover:bg-amber-500/10 lg:hidden h-11"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          <aside
            className={`${
              mobileFiltersOpen ? "block" : "hidden"
            } lg:block w-full lg:w-60 shrink-0`}
          >
            <div
              className="p-5 rounded-lg border border-amber-500/20 sticky top-24"
              style={{ backgroundColor: "#1a0f07" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-sm uppercase tracking-wider text-amber-300">
                  Filtros
                </h3>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-amber-400 hover:text-amber-300"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div className="mb-6">
                <Label className="text-amber-100 text-sm mb-3 block">
                  Categoria
                </Label>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.slug)}
                        onChange={() => toggleCategory(cat.slug)}
                        className="rounded border-amber-500/30 bg-[#120a04] text-amber-500 focus:ring-amber-500/50"
                      />
                      <span className="text-sm text-amber-100/60 group-hover:text-amber-100 transition-colors">
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-amber-100 text-sm mb-3 block">
                  Faixa de Preço
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-9 bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500 text-sm"
                  />
                  <span className="text-amber-100/30 text-xs">até</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-9 bg-[#120a04] border-amber-500/30 text-amber-100 placeholder:text-amber-100/30 focus-visible:ring-amber-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-amber-100 text-sm mb-3 block">
                  Volume
                </Label>
                <div className="space-y-2">
                  {volumeOptions.map((vol) => (
                    <label
                      key={vol.value}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVolumes.includes(vol.value)}
                        onChange={() => toggleVolume(vol.value)}
                        className="rounded border-amber-500/30 bg-[#120a04] text-amber-500 focus:ring-amber-500/50"
                      />
                      <span className="text-sm text-amber-100/60 group-hover:text-amber-100 transition-colors">
                        {vol.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <ProductGrid products={[]} loading={true} loadingCount={6} />
            ) : (
              <>
                <ProductGrid products={products} />

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                            page === currentPage
                              ? "bg-amber-500 text-[#1a0f07]"
                              : "text-amber-100/60 hover:text-amber-100 hover:bg-amber-500/10 border border-amber-500/20"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
