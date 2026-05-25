type SmokeRoute = {
  path: string;
  expectedText: string;
};

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3001";

const routes: SmokeRoute[] = [
  { path: "/", expectedText: "AI tool rankings" },
  { path: "/tools", expectedText: "AI Tools" },
  { path: "/categories/image-generation", expectedText: "Image Generation" },
  { path: "/compare", expectedText: "Compare AI Tools" },
  { path: "/tools/google-gemini-image", expectedText: "Google Gemini Image" },
  { path: "/newsletter", expectedText: "Plebi AI Brief" },
  { path: "/newsletter/ai-tool-starter-stack", expectedText: "AI Tool Starter Stack" },
  { path: "/sitemap.xml", expectedText: "/newsletter" },
  { path: "/robots.txt", expectedText: "Sitemap:" }
];

function createUrl(path: string) {
  return new URL(path, baseUrl).toString();
}

for (const route of routes) {
  const response = await fetch(createUrl(route.path));
  const body = await response.text();

  if (response.status !== 200) {
    throw new Error(`${route.path} returned HTTP ${response.status}.`);
  }

  if (!body.includes(route.expectedText)) {
    throw new Error(`${route.path} did not include expected text: ${route.expectedText}`);
  }

  if (body.includes("Record not found") || body.includes("The requested Plebi record is not available in the tracked directory.")) {
    throw new Error(`${route.path} contains the old record-level not-found copy.`);
  }

  console.log(`${route.path} 200`);
}

console.log(`Route smoke checks passed against ${baseUrl}.`);

export {};
