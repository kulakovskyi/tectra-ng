export interface StackblitzSetup {
  kitVersion: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  styles: string;
}

export interface StackblitzTheme {
  style: string;
  primary: string;
  surface: string;
  mode: 'light' | 'dark';
  ripple: boolean;
}

export interface StackblitzExample {
  id: string;
  title: string;
  page: string;
  source: string;
}

export interface StackblitzProject {
  title: string;
  description: string;
  template: 'node';
  openFile: string;
  files: Record<string, string>;
}
