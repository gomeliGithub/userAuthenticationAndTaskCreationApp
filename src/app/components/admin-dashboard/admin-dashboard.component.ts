import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Observable } from 'rxjs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NgbdSortableHeader } from '../../directives/users-table-sortable.directive';

import { AppService } from '../../app.service';
import { AdminDashboardService } from '../../services/admin-dashboard.service';

import { IActiveClientData, SortEvent } from 'types/global';
import { IUser } from 'types/models';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [ CommonModule, DecimalPipe, FormsModule, AsyncPipe, NgbdSortableHeader, NgbModule ],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.css',
    providers: [ AdminDashboardService, DecimalPipe ],
    host: { ngSkipHydration: 'true' }
})
export class AdminDashboardComponent implements OnInit {
    constructor (
        private readonly _appService: AppService,
        public adminDashboardService: AdminDashboardService
    ) {
        this.users = adminDashboardService.users;
		this.total = adminDashboardService.total;
    }

    public activeClientData: IActiveClientData | null;

    public users: Observable<IUser[]>;
	public total: Observable<number>;

    ngOnInit (): void {
        this.activeClientData = this._appService.activeClientData;
    }

	@ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

	public onSort ({ column, direction }: SortEvent) {
		
		this.headers.forEach(header => {
			if ( header.sortable !== column ) {
				header.direction = '';
			}
		});

		this.adminDashboardService.sortColumn = column;
		this.adminDashboardService.sortDirection = direction;
	}
}