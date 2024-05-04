import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminDashboardComponent } from '../components/admin-dashboard/admin-dashboard.component';
import { AdminDashboardService } from '../services/admin-dashboard.service';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        AdminDashboardComponent
    ],
    providers: [AdminDashboardService]
})
export class AdminDashboardModule { }