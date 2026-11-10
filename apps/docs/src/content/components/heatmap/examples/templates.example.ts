import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  TxHeatmap,
  TxHeatmapColumnGroup,
  TxHeatmapLegendItem,
  TxHeatmapRow,
  TxHeatmapRowHeader,
  TxHeatmapRowValue,
} from '@tectra-ng/charts/heatmap';
import { TxCard } from '@tectra-ng/ui/card';
import { TxAvatar } from '@tectra-ng/ui/avatar';
import { TxPill } from '@tectra-ng/ui/pill';

interface Person {
  name: string;
  team: string;
  rate: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

@Component({
  selector: 'heatmap-templates-example',
  imports: [TxCard, TxHeatmap, TxHeatmapRowHeader, TxHeatmapRowValue, TxAvatar, TxPill],
  template: `
    <tx-card title="Deadlines">
      <tx-heatmap
        [groups]="groups"
        [rows]="rows"
        [legend]="legend"
        [labels]="{ rowHeader: 'Person', valueHeader: 'On time', empty: 'No deadline' }"
      >
        <ng-template txHeatmapRowHeader let-row>
          <span class="person">
            <tx-avatar [name]="person(row).name" size="small" shape="circle" />
            <span class="text">
              <span class="name">{{ person(row).name }}</span>
              <span class="team">{{ person(row).team }}</span>
            </span>
          </span>
        </ng-template>
        <ng-template txHeatmapRowValue let-row>
          <tx-pill size="small" [tone]="tone(person(row).rate)">{{ person(row).rate }}%</tx-pill>
        </ng-template>
      </tx-heatmap>
    </tx-card>
  `,
  styles: `
    .person {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .text {
      display: grid;
      min-width: 0;
    }
    .name,
    .team {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .team {
      font-size: 12px;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HeatmapTemplatesExample {
  readonly people: Person[] = [
    { name: 'Maya Lopez', team: 'Design', rate: 96 },
    { name: 'Owen Clarke', team: 'Platform', rate: 81 },
    { name: 'Priya Natarajan', team: 'Data', rate: 64 },
    { name: 'Leo Hoffmann', team: 'Mobile', rate: 88 },
  ];
  readonly groups: TxHeatmapColumnGroup[] = MONTHS.map((month) => ({
    key: month,
    label: month,
    columns: [1, 2, 3, 4].map((week) => ({ key: `${month}-${week}`, label: String(week) })),
  }));
  readonly rows: TxHeatmapRow[] = this.people.map((person, index) => ({
    key: person.name,
    data: person,
    cells: Array.from({ length: 24 }, (_, cell) => {
      const seed = (index * 5 + cell * 7) % 13;
      if (seed > 10) {
        return null;
      }
      const late = seed * 10 > person.rate - 20;
      return {
        tone: late ? 'danger' : 'success',
        tooltip: `Week ${(cell % 4) + 1}: ${late ? 'late' : 'on time'}`,
      };
    }),
  }));
  readonly legend: TxHeatmapLegendItem[] = [
    { tone: 'success', label: 'On time' },
    { tone: 'danger', label: 'Late' },
  ];

  person(row: TxHeatmapRow): Person {
    return row.data as Person;
  }

  tone(rate: number): 'success' | 'warn' | 'danger' {
    return rate >= 85 ? 'success' : rate >= 70 ? 'warn' : 'danger';
  }
}
