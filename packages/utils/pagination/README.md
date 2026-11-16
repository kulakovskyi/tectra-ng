# Pagination

Page math for paginated lists and requests without the paginator component: convert between a zero-based page and the index of its first row, count pages, pick the page links around the current page. `TxPaginationParams` is the shape of a paginated request or response (`page` is 1-based, `limit` is the page size, `total` the number of records). `@tectra-ng/ui/paginator` exports the same functions.

## Functions
| Name | Description |
|---|---|
| firstToPage(first, rows) | Zero-based page of the row at index `first`; `0` when `rows` is `0` |
| pageToFirst(page, rows) | Index of the first row of a zero-based page |
| pageCountOf(totalRecords, rows) | Number of pages; `0` without records, `1` when `rows` is `0` |
| pageLinksOf(page, pageCount, linkSize) | Zero-based pages to show as links, the current one centred |
