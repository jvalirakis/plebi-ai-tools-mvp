# Analytics Events

Plebi uses a lightweight, provider-agnostic analytics abstraction for product interaction events.

## Philosophy

- Privacy-first
- No personal data
- No cookies
- No fingerprinting
- No auth user IDs
- No required external provider
- Safe no-op behavior when no adapter is configured

The default behavior does not send events anywhere. When `NEXT_PUBLIC_ANALYTICS_DEBUG=true`, events are logged to the browser console after payload sanitization.

## Event Names

- `tool_card_clicked`
- `tool_detail_viewed`
- `tool_official_site_clicked`
- `tool_filter_changed`
- `tool_search_submitted`
- `tool_sort_changed`
- `category_opened`
- `category_tool_clicked`
- `compare_opened`
- `compare_cta_clicked`
- `breadcrumb_clicked`
- `nav_link_clicked`
- `empty_state_action_clicked`
- `external_link_clicked`

## Allowed Payload Fields

- `tool_slug`
- `category_slug`
- `route`
- `filter_name`
- `filter_value`
- `sort_key`
- `cta_name`
- `link_type`
- `destination_type`
- `result_count`
- `source_route`

Payloads are sanitized before logging or forwarding to an adapter. Routes are stripped to path-only values, slugs must match URL-safe slug format, and arbitrary keys are dropped.

## Forbidden Payload Fields

Do not add:

- email
- user name
- IP address
- user agent
- auth user ID
- full URL with query params
- raw referrer
- raw free-form search query
- personal data

Search instrumentation records controlled metadata such as `query_present` and result count. It does not record raw search text.

## Instrumented Areas

- Primary navigation and breadcrumbs
- Homepage CTAs, directory search, category cards, and market leader tool links
- `/tools` filters, sort, search submit, clear filters, tool clicks, compare CTAs, and empty-state actions
- Category page open events, category CTAs, category ranking filters, sort, search submit, table/card tool clicks, and empty-state actions
- Tool detail view events, official website clicks, compare CTAs, category links, external trust links, and alternative tool links
- Compare page open events, compare search submit, add-tool actions, selected tool links, and empty-state actions

## Debug Logging

Set the optional environment variable:

```bash
NEXT_PUBLIC_ANALYTICS_DEBUG=true
```

Then run the app locally and interact with the UI. Sanitized events will appear in the browser console as `[Plebi analytics]`.

## Future Provider Integration

The wrapper can later forward sanitized events to Vercel Analytics, Plausible, Umami, PostHog, or a custom endpoint by assigning a client adapter:

```ts
window.plebiAnalytics = {
  track(eventName, payload) {
    // Forward sanitized eventName and payload to a provider.
  }
};
```

Do not connect a provider directly in components. Keep provider-specific logic behind the wrapper or a tiny adapter.

## Intentionally Not Tracked

- Email addresses
- Auth identities
- Raw search queries
- Raw referrers
- Full URLs with query strings
- User agents
- IP addresses
- Device fingerprints
- Cookie identifiers
