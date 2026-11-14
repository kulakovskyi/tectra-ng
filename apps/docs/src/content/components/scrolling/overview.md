---
category: Utilities
source: packages/utils/scrolling
package: @tectra-ng/utils/scrolling
import: provideTxScrolling
examples: list-page
---
# Scrolling

Router scrolling for list pages: Back and Forward restore the saved position, a new path starts at the top, and paging, sorting or filters that only change the query string leave the page where it is. Set it up once with `provideTxScrolling()` next to `provideRouter`, and keep the router's `scrollPositionRestoration` at `'disabled'`.

Part of `@tectra-ng/utils` (`npm install @tectra-ng/utils`, also included in `tectra-ng`).
