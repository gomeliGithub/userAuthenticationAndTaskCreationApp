import { Routes } from '@angular/router';

import { MainComponent } from './components/main/main.component';
import { SignComponent } from './components/sign/sign.component';

export const routes: Routes = [
    { path: 'main', component: MainComponent},
    { path: '', redirectTo: '/main', pathMatch: 'full' },
    {
        path: 'sign',
        children: [
            { path: 'in', component: SignComponent },
            { path: 'up', component: SignComponent },
        ]
    }
];