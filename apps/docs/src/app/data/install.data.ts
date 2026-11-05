import { CodeLanguage } from '../doc-ui/code-block/code-block.types';

export const INSTALL_STEPS: { title: string; code: string; language: CodeLanguage }[] = [
  {
    title: 'Install',
    language: 'bash',
    code: 'npm install @tectra/ui @tectra/core @tectra/themes @tectra/tokens @tectra/icons @angular/cdk',
  },
  {
    title: 'Provide a theme in app.config.ts',
    language: 'typescript',
    code: `import { provideTectra } from '@tectra/core/config';
import { createInkPreset } from '@tectra/themes';

export const appConfig: ApplicationConfig = {
  providers: [provideTectra({ preset: createInkPreset('blue'), ripple: true })],
};`,
  },
  {
    title: 'Use a component',
    language: 'typescript',
    code: `import { TxSelect } from '@tectra/ui/select';

@Component({
  imports: [TxSelect, ReactiveFormsModule],
  template: \`<tx-select [options]="cities" [formControl]="city" />\`,
})`,
  },
];
