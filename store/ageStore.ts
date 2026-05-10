import { create } from "zustand";

interface AgeState {
  isVerified: boolean;
  verifiedAt: Date | null;
  hydrate: () => void;
  verify: () => void;
  reset: () => void;
}

export const useAgeStore = create<AgeState>()((set) => ({
  isVerified: false,
  verifiedAt: null,
  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("stillare-age-verified");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.isVerified) {
          set({ isVerified: true, verifiedAt: new Date(parsed.verifiedAt || Date.now()) });
        }
      }
    } catch {}
  },
  verify: () => set({ isVerified: true, verifiedAt: new Date() }),
  reset: () => set({ isVerified: false, verifiedAt: null }),
}));

if (typeof window !== "undefined") {
  useAgeStore.subscribe((state) => {
    localStorage.setItem("stillare-age-verified", JSON.stringify({
      isVerified: state.isVerified,
      verifiedAt: state.verifiedAt,
    }));
  });
}
