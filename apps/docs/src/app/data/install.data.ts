export const INSTALL_STEPS = [
  {
    title: 'Install',
    code: 'npm install @tectra/ui @tectra/core @tectra/themes @tectra/tokens @tectra/icons @angular/cdk',
  },
  {
    title: 'Provide a theme in app.config.ts',
    code: `import { provideTectra } from '@tectra/core/config';
import { createInkPreset } from '@tectra/themes';

export const appConfig: ApplicationConfig = {
  providers: [provideTectra({ preset: createInkPreset('blue'), ripple: true })],
};`,
  },
  {
    title: 'Add the overlay styles in angular.json',
    code: `"styles": ["node_modules/@angular/cdk/overlay-prebuilt.css", "src/styles.scss"]`,
  },
  {
    title: 'Use a component',
    code: `import { TxSelect } from '@tectra/ui/select';

@Component({
  imports: [TxSelect, ReactiveFormsModule],
  template: \`<tx-select [options]="cities" [formControl]="city" />\`,
})`,
  },
];
