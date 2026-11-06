import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatTile, TxStatTiles } from '@tectra-ng/ui/stat-tiles';

@Component({
  selector: 'stat-tiles-links-example',
  imports: [TxStatTiles, TxStatTile],
  template: `
    <tx-stat-tiles ariaLabel="Components">
      <tx-stat-tile
        label="Table"
        icon="table"
        value="Data"
        textValue
        meta="Opens the table page"
        link="/components/table"
      />
      <tx-stat-tile
        label="Paginator"
        icon="list"
        value="Data"
        textValue
        meta="Opens the paginator page"
        [link]="['/components', 'paginator']"
        [queryParams]="{ tab: 'api' }"
      />
      <tx-stat-tile
        label="Example site"
        icon="external-link"
        value="example.com"
        textValue
        meta="Opens in a new tab"
        href="https://example.com"
        target="_blank"
      />
    </tx-stat-tiles>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatTilesLinksExample {}
