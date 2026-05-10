"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useAgeStore } from "@/store/ageStore";

function StoreHydrator() {
  useEffect(() => {
    useCartStore.getState().hydrate();
    useAgeStore.getState().hydrate();
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <StoreHydrator />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
