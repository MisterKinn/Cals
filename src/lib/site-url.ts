export function getSiteUrl() {
  const deploymentUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (!deploymentUrl) return new URL("http://localhost:3000");

  const absoluteUrl = /^https?:\/\//.test(deploymentUrl)
    ? deploymentUrl
    : `https://${deploymentUrl}`;
  return new URL(absoluteUrl);
}
