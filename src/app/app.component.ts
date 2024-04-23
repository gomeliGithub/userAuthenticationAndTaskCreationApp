import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppService } from './app.service';

import { IAlert } from 'types/global';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [ CommonModule, RouterOutlet, RouterModule, NgbModule ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    constructor (
        private readonly _appService: AppService
    ) { 
        this._appService.alertsAddChange.subscribe(value => this.addAlert(value));
        this._appService.alertsCloseChange.subscribe(value => this.closeAlert(value));
    }

    public isMenuCollapsed: boolean = true;

    public alerts: IAlert[] = [];

    public addAlert (alert: IAlert): void {
        this.alerts.push(alert);

        setTimeout(() => this.closeAlert(alert), alert.closeTimeout);
    }

    public closeAlert (alert: IAlert): void {
		this.alerts.splice(this.alerts.indexOf(alert), 1);
	}
}