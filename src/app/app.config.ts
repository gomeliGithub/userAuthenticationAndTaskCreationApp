import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
    providers: [ 
        provideRouter(routes, withRouterConfig({
            onSameUrlNavigation: 'reload'
        })),
        importProvidersFrom(HttpClientModule),
        provideHttpClient(withFetch()),
        provideClientHydration()
    ]
};