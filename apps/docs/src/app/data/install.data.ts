import { CodeLanguage } from '../doc-ui/code-block/code-block.types';

export const INSTALL_STEPS: { title: string; code: string; language: CodeLanguage }[] = [
  {
    title: 'Install everything',
    language: 'bash',
    code: 'npm install tectra-ng',
  },
  {
    title: 'Or only the components — core, themes, tokens and icons come with them',
    language: 'bash',
    code: 'npm install @tectra-ng/ui',
  },
  {
    title: 'Provide a theme in app.config.ts',
    language: 'typescript',
    code: `import { provideTectra } from '@tectra-ng/core/config';
import { createTectraPreset } from '@tectra-ng/themes';

export const appConfig: ApplicationConfig = {
  providers: [provideTectra({ preset: createTectraPreset({ primary: 'blue' }), ripple: true })],
};`,
  },
  {
    title: 'Use a component',
    language: 'typescript',
    code: `import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  imports: [TxSelect, ReactiveFormsModule],
  template: \`<tx-select [options]="cities" [formControl]="city" />\`,
})`,
  },
  {
    title: 'Optional: the Onest and JetBrains Mono fonts in index.html — without them the system font is used',
    language: 'xml',
    code: `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@100..900&family=JetBrains+Mono:wght@400;500&display=swap" />`,
  },
];
