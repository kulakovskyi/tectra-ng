import { InjectionToken } from '@angular/core';
import { TectraConfig } from './tectra-config.interface';

/** Injection token with the config given to `provideTectra`. */
export const TECTRA_CONFIG = new InjectionToken<TectraConfig>('TECTRA_CONFIG');
