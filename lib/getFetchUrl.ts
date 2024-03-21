export function getFetchUrl(route: string) {
  return `${
    process.env.NODE_ENV === "production" ? process.env.VERCEL_URL! : "http://localhost:3000"}/${route}`;
}
