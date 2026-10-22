import { LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt);
export default [provideZoneChangeDetection(), { provide: LOCALE_ID, useValue: 'pt-BR' }];
