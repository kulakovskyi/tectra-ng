import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DOC_COMPONENTS } from '../../../generated/registry';
import { CATALOG } from '../landing.data';
import { LandingGlyph } from '../parts/glyph';

@Component({
  selector: 'docs-landing-catalog',
  imports: [RouterLink, LandingGlyph],
  template: `
    <section class="catalog" aria-labelledby="catalog-title">
      <div class="catalog__frame">
        <h2 class="catalog__title" id="catalog-title">One kit for<br /><span>every screen</span></h2>
        @for (row of rows; track row.label) {
          <div class="catalog__row">
            <div class="catalog__intro">
              <span class="catalog__label">{{ row.label }}</span>
              <h3 class="catalog__row-title">{{ row.title }}</h3>
            </div>
            <div class="catalog__tiles">
              @for (tile of row.tiles; track tile.title) {
                <a class="tile" [attr.data-tone]="tile.tone" [routerLink]="tile.link">
                  <span class="tile__title">{{ tile.title }}</span>
                  <span class="tile__note">{{ tile.count }} · {{ tile.note }}</span>
                  <docs-landing-glyph class="tile__glyph" [kind]="tile.glyph" />
                </a>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styleUrl: './catalog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingCatalog {
  readonly rows = CATALOG.map((row) => ({
    ...row,
    tiles: row.tiles.map((tile) => ({
      ...tile,
      count: DOC_COMPONENTS.filter((component) => tile.categories.includes(component.category)).length,
    })),
  }));
}
