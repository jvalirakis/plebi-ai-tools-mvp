import type { JsonLdObject } from "@/lib/seo/structured-data";

type JsonLdProps = {
  data: JsonLdObject | JsonLdObject[];
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c")
      }}
    />
  );
}
