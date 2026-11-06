import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideTectra } from '@tectra-ng/core/config';
import { InkPreset } from '@tectra-ng/themes';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection(), provideTectra({ preset: InkPreset })],
}).catch((error) => console.error(error));
