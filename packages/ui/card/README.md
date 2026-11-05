# Card

A box for one piece of content — media on top, a title, text and actions at the bottom.

```html
<tx-card title="Weekly report" subtitle="Nov 3 – 9">
  <img txCardHeader src="/chart.png" alt="Visitors by day" />
  Visitors grew 12% compared with last week.
  <div txCardFooter><button txButton>Open</button></div>
</tx-card>
```

## Inputs
| Name | Description |
|---|---|
| title | Title of the card (a heading) |
| subtitle | Muted line under the title |
| headingLevel | Heading level of the title, 3 by default |
| dt | Design tokens of this instance (`card`) |
| pt | Classes and styles of the parts: `root`, `header`, `body`, `title`, `subtitle`, `content`, `footer` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Slots
| Name | Description |
|---|---|
| default | The content |
| txCardHeader | Full-width media on top, e.g. an image |
| txCardTitle | Own title markup instead of `title` |
| txCardFooter | Actions at the bottom |
