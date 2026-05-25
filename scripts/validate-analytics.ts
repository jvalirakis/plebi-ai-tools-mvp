import path from "node:path";
import { pathToFileURL } from "node:url";

type AnalyticsEventsModule = {
  analyticsEventNames: readonly string[];
  isAnalyticsEventName: (value: string) => boolean;
  sanitizeAnalyticsPayload: (payload: Record<string, unknown>) => Record<string, unknown>;
};

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const analyticsModule = (await import(pathToFileURL(path.join(process.cwd(), "src", "lib", "analytics", "events.ts")).href)) as AnalyticsEventsModule;
const sanitized = analyticsModule.sanitizeAnalyticsPayload({
  tool_slug: "Google-Gemini-Image",
  category_slug: "image-generation",
  issue_slug: "ai-tool-starter-stack",
  route: "https://example.com/tools/google-gemini-image?email=test@example.com",
  source_route: "/tools?query=sensitive",
  result_count: 2.4,
  email: "person@example.com",
  user_agent: "hidden",
  filter_name: "category",
  filter_value: "image-generation"
});

assert(analyticsModule.analyticsEventNames.includes("tool_card_clicked"), "Expected tool_card_clicked to be an allowed event.");
assert(analyticsModule.analyticsEventNames.includes("newsletter_issue_viewed"), "Expected newsletter_issue_viewed to be an allowed event.");
assert(analyticsModule.isAnalyticsEventName("tool_card_clicked"), "Expected tool_card_clicked to pass event-name validation.");
assert(!analyticsModule.isAnalyticsEventName("email_collected"), "Unexpected event name should not pass validation.");
assert(sanitized.tool_slug === "google-gemini-image", "Tool slug should be normalized.");
assert(sanitized.category_slug === "image-generation", "Category slug should be retained.");
assert(sanitized.issue_slug === "ai-tool-starter-stack", "Issue slug should be retained.");
assert(sanitized.route === "/tools/google-gemini-image", "Route should strip host and query params.");
assert(sanitized.source_route === "/tools", "Source route should strip query params.");
assert(sanitized.result_count === 2, "Result count should be rounded.");
assert(!("email" in sanitized), "Forbidden email key should be removed.");
assert(!("user_agent" in sanitized), "Forbidden user agent key should be removed.");

console.log("Analytics validation passed");
