import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideTectra } from '@tectra/core/config';
import { InkPreset } from '@tectra/themes';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection(), provideTectra({ preset: InkPreset })],
}).catch((error) => console.error(error));
