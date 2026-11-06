import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideTectra } from '@tectra-ng/core/config';
import { Tectra } from '@tectra-ng/themes';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection(), provideTectra({ preset: Tectra })],
}).catch((error) => console.error(error));
