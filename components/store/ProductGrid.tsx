import { ProductCard } from "@/components/store/ProductCard";
import { ProductSkeleton } from "@/components/store/ProductSkeleton";

interface ProductImage {
  imageUrl: string;
  isPrimary: boolean;
}

interface ProductGridProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string | null;
  images?: ProductImage[];
  volumeMl?: number | null;
  alcoholPercentage?: number | null;
  stock: number;
  isFeatured?: boolean;
}

interface ProductGridProps {
  products: ProductGridProduct[];
  loading?: boolean;
  loadingCount?: number;
}

export function ProductGrid({ products, loading, loadingCount = 6 }: ProductGridProps) {
  if (loading) {
    return (
      <ProductSkeleton count={loadingCount} className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" />
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-amber-100/40 text-lg font-light">
          Nenhum produto encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => {
        const primaryImage =
          product.imageUrl ||
          product.images?.find((img) => img.isPrimary)?.imageUrl ||
          product.images?.[0]?.imageUrl ||
          null;

        return (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            imageUrl={primaryImage}
            volumeMl={product.volumeMl ?? null}
            alcoholPercentage={product.alcoholPercentage ?? null}
            stock={product.stock}
            isFeatured={product.isFeatured}
          />
        );
      })}
    </div>
  );
}
