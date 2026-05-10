export function cacheHeaders(maxAge: number = 60) {
  return {
    "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
  };
}
