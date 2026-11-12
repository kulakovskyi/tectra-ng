import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideTectra } from '@tectra-ng/core/config';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';
import { Tectra } from '@tectra-ng/themes';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [provideZonelessChangeDetection(), provideTectra({ preset: Tectra }), provideTxIcons(TX_ICONS)],
}).catch((error) => console.error(error));
