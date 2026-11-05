export const INSTALL_STEPS = [
  {
    title: '1. Install',
    code: 'npm install @tectra/ui @tectra/core @tectra/themes @tectra/tokens @tectra/icons @angular/cdk',
  },
  {
    title: '2. Provide a theme in app.config.ts',
    code: `import { provideTectra } from '@tectra/core/config';
import { createInkPreset } from '@tectra/themes';

export const appConfig: ApplicationConfig = {
  providers: [provideTectra({ preset: createInkPreset('blue'), mode: 'light' })],
};`,
  },
  {
    title: '3. Add the overlay styles in angular.json',
    code: `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", "src/styles.scss"]`,
  },
  {
    title: '4. Use a component',
    code: `import { TxSelect } from '@tectra/ui/select';

@Component({
  imports: [TxSelect, ReactiveFormsModule],
  template: \`<tx-select [options]="cities" [formControl]="city" />\`,
})`,
  },
];
