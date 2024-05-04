import { Routes } from '@angular/router';

import { MainComponent } from './components/main/main.component';
import { SignComponent } from './components/sign/sign.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

import { SignGuard } from './guards/sign.guard';

export const routes: Routes = [
    { path: 'main', component: MainComponent},
    { path: '', redirectTo: '/main', pathMatch: 'full' },
    {
        path: 'sign',
        children: [
            { path: 'in', component: SignComponent },
            { path: 'up', component: SignComponent },
        ]
    },
    { path: 'adminDashboard', component: AdminDashboardComponent, canActivate: [SignGuard] }
];