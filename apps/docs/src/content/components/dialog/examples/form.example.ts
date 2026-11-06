import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TxAutocomplete, TxAutocompleteCompleteEvent } from '@tectra-ng/ui/autocomplete';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCascadeSelect } from '@tectra-ng/ui/cascade-select';
import { TxChipsInput } from '@tectra-ng/ui/chips-input';
import { TxCountrySelect } from '@tectra-ng/ui/country-select';
import { TxDialog, TxDialogFooter } from '@tectra-ng/ui/dialog';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxTextarea } from '@tectra-ng/ui/textarea';
import { TxTreeNode, TxTreeSelect } from '@tectra-ng/ui/tree-select';

const CITIES = [
  'Amsterdam',
  'Athens',
  'Barcelona',
  'Belgrade',
  'Berlin',
  'Bratislava',
  'Brussels',
  'Bucharest',
  'Budapest',
  'Copenhagen',
  'Dublin',
  'Edinburgh',
  'Florence',
  'Geneva',
  'Hamburg',
  'Helsinki',
  'Istanbul',
  'Kraków',
  'Kyiv',
  'Lisbon',
  'Ljubljana',
  'London',
  'Lviv',
  'Lyon',
  'Madrid',
  'Milan',
  'Munich',
  'Naples',
  'Odesa',
  'Oslo',
  'Paris',
  'Porto',
  'Prague',
  'Riga',
  'Rome',
  'Sofia',
  'Stockholm',
  'Tallinn',
  'Valencia',
  'Vienna',
  'Vilnius',
  'Warsaw',
  'Zagreb',
  'Zurich',
];

const TOPICS = [
  'Accessibility',
  'Animation',
  'Architecture',
  'Design systems',
  'Forms',
  'Performance',
  'Security',
  'Server rendering',
  'State management',
  'Testing',
  'Tooling',
  'Typography',
];

const ROOMS = ['Main hall', 'Workshop room A', 'Workshop room B', 'Library', 'Rooftop', 'Studio'];

interface EventForm {
  title: FormControl<string>;
  format: FormControl<string | null>;
  city: FormControl<string | null>;
  topics: FormControl<string[]>;
  room: FormControl<string | null>;
  team: FormControl<string | null>;
  office: FormControl<string | null>;
  country: FormControl<string | null>;
  description: FormControl<string>;
  tags: FormControl<string[]>;
  backupCity: FormControl<string | null>;
  reviewers: FormControl<string[]>;
}

@Component({
  selector: 'dialog-form-example',
  imports: [
    ReactiveFormsModule,
    TxAutocomplete,
    TxButton,
    TxCascadeSelect,
    TxChipsInput,
    TxCountrySelect,
    TxDialog,
    TxDialogFooter,
    TxInput,
    TxLabel,
    TxMultiselect,
    TxSelect,
    TxTextarea,
    TxTreeSelect,
  ],
  template: `
    <div class="row">
      <button txButton icon="plus" (click)="visible.set(true)">New event</button>
      <span class="summary">{{ summary() }}</span>
    </div>
    <tx-dialog
      header="New event"
      subtitle="Every kind of select, from the top of the form to the footer"
      [(visible)]="visible"
    >
      <form class="form" id="dialog-form-event" [formGroup]="form" (ngSubmit)="create()">
        <fieldset class="group">
          <legend>Basics</legend>
          <div class="field">
            <tx-label for="dialog-form-title">Title</tx-label>
            <input txInput id="dialog-form-title" formControlName="title" />
          </div>
          <div class="field">
            <tx-label for="dialog-form-format">Format</tx-label>
            <tx-select
              inputId="dialog-form-format"
              [options]="formats"
              formControlName="format"
              placeholder="Select a format"
              [showClear]="true"
            />
          </div>
          <div class="field">
            <tx-label for="dialog-form-city">City</tx-label>
            <tx-select
              inputId="dialog-form-city"
              [options]="cities"
              formControlName="city"
              placeholder="Search a city"
              [filter]="true"
            />
          </div>
        </fieldset>

        <fieldset class="group">
          <legend>Program</legend>
          <div class="field">
            <tx-label for="dialog-form-topics">Topics</tx-label>
            <tx-multiselect
              inputId="dialog-form-topics"
              [options]="topics"
              formControlName="topics"
              placeholder="Pick topics"
              [filter]="true"
            />
          </div>
          <div class="field">
            <tx-label for="dialog-form-room">Room</tx-label>
            <tx-autocomplete
              inputId="dialog-form-room"
              [suggestions]="rooms()"
              formControlName="room"
              placeholder="Type a room"
              [dropdown]="true"
              (completed)="searchRooms($event)"
            />
          </div>
          <div class="field">
            <tx-label for="dialog-form-team">Organising team</tx-label>
            <tx-tree-select
              inputId="dialog-form-team"
              [options]="teams"
              formControlName="team"
              placeholder="Team"
              [filter]="true"
            />
          </div>
        </fieldset>

        <fieldset class="group">
          <legend>Location</legend>
          <div class="field">
            <tx-label for="dialog-form-office">Office</tx-label>
            <tx-cascade-select
              inputId="dialog-form-office"
              [options]="places"
              formControlName="office"
              optionLabel="city"
              optionValue="code"
              optionGroupLabel="name"
              [optionGroupChildren]="['regions', 'cities']"
              placeholder="Office"
            />
          </div>
          <div class="field">
            <tx-label for="dialog-form-country">Country</tx-label>
            <tx-country-select
              inputId="dialog-form-country"
              formControlName="country"
              placeholder="Country"
              [showClear]="true"
            />
          </div>
          <div class="field">
            <tx-label for="dialog-form-description">Description</tx-label>
            <textarea
              txTextarea
              id="dialog-form-description"
              rows="3"
              formControlName="description"
            ></textarea>
          </div>
        </fieldset>

        <fieldset class="group">
          <legend>Review</legend>
          <div class="field">
            <tx-label for="dialog-form-tags">Tags</tx-label>
            <tx-chips-input
              inputId="dialog-form-tags"
              formControlName="tags"
              placeholder="Add a tag"
            />
          </div>
          <div class="field">
            <tx-label for="dialog-form-backup">Backup city</tx-label>
            <tx-select
              inputId="dialog-form-backup"
              [options]="cities"
              formControlName="backupCity"
              placeholder="Select a city"
            />
          </div>
          <div class="field">
            <tx-label for="dialog-form-reviewers">Reviewers</tx-label>
            <tx-multiselect
              inputId="dialog-form-reviewers"
              [options]="reviewers"
              formControlName="reviewers"
              placeholder="Pick reviewers"
            />
          </div>
        </fieldset>
      </form>
      <tx-dialog-footer>
        <button txButton severity="secondary" type="button" (click)="visible.set(false)">
          Cancel
        </button>
        <button txButton type="submit" form="dialog-form-event">Create</button>
      </tx-dialog-footer>
    </tx-dialog>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .summary {
      color: var(--tx-text-muted);
    }
    .form {
      display: grid;
      gap: 20px;
    }
    .group {
      display: grid;
      gap: 14px;
      min-width: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }
    .group legend {
      margin-bottom: 10px;
      padding: 0;
      font-weight: var(--tx-font-weight-semibold);
    }
    .field {
      display: grid;
      gap: 6px;
    }
    .field > :not(tx-label) {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DialogFormExample {
  readonly visible = signal(false);
  readonly summary = signal('No event yet');
  readonly rooms = signal<string[]>([]);

  readonly formats = ['Talk', 'Workshop', 'Panel', 'Meetup'].map((format) => ({
    label: format,
    value: format,
  }));
  readonly cities = CITIES.map((city) => ({ label: city, value: city }));
  readonly topics = TOPICS.map((topic) => ({ label: topic, value: topic }));
  readonly reviewers = [
    'Alex Morgan',
    'Sam Lee',
    'Jordan Park',
    'Riley Chen',
    'Taylor Brooks',
    'Casey Nguyen',
    'Morgan Diaz',
    'Jamie Fox',
  ].map((name) => ({
    label: name,
    value: name,
  }));

  readonly teams: TxTreeNode[] = [
    {
      key: 'eng',
      label: 'Engineering',
      children: [
        {
          key: 'web',
          label: 'Web',
          children: [
            { key: 'web-ui', label: 'UI kit' },
            { key: 'web-app', label: 'App' },
          ],
        },
        { key: 'api', label: 'API' },
        { key: 'qa', label: 'QA' },
      ],
    },
    {
      key: 'biz',
      label: 'Business',
      children: [
        { key: 'sales', label: 'Sales' },
        { key: 'support', label: 'Support' },
      ],
    },
  ];

  readonly places = [
    {
      name: 'Ukraine',
      regions: [
        {
          name: 'Kyiv region',
          cities: [
            { city: 'Kyiv', code: 'UA-KYI' },
            { city: 'Bila Tserkva', code: 'UA-BTS' },
          ],
        },
        {
          name: 'Lviv region',
          cities: [
            { city: 'Lviv', code: 'UA-LWO' },
            { city: 'Stryi', code: 'UA-STR' },
          ],
        },
      ],
    },
    {
      name: 'Poland',
      regions: [
        {
          name: 'Masovia',
          cities: [
            { city: 'Warsaw', code: 'PL-WAW' },
            { city: 'Radom', code: 'PL-RDO' },
          ],
        },
        { name: 'Lesser Poland', cities: [{ city: 'Kraków', code: 'PL-KRK' }] },
      ],
    },
  ];

  readonly form = new FormGroup<EventForm>({
    title: new FormControl('Frontend meetup', { nonNullable: true }),
    format: new FormControl<string | null>(null),
    city: new FormControl<string | null>(null),
    topics: new FormControl<string[]>([], { nonNullable: true }),
    room: new FormControl<string | null>(null),
    team: new FormControl<string | null>(null),
    office: new FormControl<string | null>(null),
    country: new FormControl<string | null>(null),
    description: new FormControl('', { nonNullable: true }),
    tags: new FormControl<string[]>([], { nonNullable: true }),
    backupCity: new FormControl<string | null>(null),
    reviewers: new FormControl<string[]>([], { nonNullable: true }),
  });

  searchRooms(event: TxAutocompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    this.rooms.set(ROOMS.filter((room) => room.toLowerCase().includes(query)));
  }

  create(): void {
    const { title, format, city, topics } = this.form.getRawValue();
    const details = [format, city, topics.length ? `${topics.length} topics` : null]
      .filter(Boolean)
      .join(', ');
    this.summary.set(details ? `${title}: ${details}` : title);
    this.visible.set(false);
  }
}
