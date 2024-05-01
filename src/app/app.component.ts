import { Inject, PLATFORM_ID, Component, OnInit } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

import { Subscription } from 'rxjs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppService } from './app.service';
import { SignService } from './services/sign.service';

import { IActiveClientData, IAlert } from 'types/global';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [ CommonModule, RouterOutlet, RouterModule, NgbModule ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
    private _isBrowser: boolean;

    constructor (
        @Inject(PLATFORM_ID) platformId: number,

        private readonly _appService: AppService,
        private readonly _signService: SignService
    ) {
        this._isBrowser = isPlatformBrowser(platformId);

        this._appService.alertsAddChange.subscribe(value => this.addAlert(value));
        this._appService.alertsCloseChange.subscribe(value => this.closeAlert(value));
    }

    public isMenuCollapsed: boolean = true;

    public activeClientData: IActiveClientData | null;

    public alerts: IAlert[] = [];

    ngOnInit (): void {
        if ( this._isBrowser ) {
            this._signService.getActiveClient().subscribe({
                next: clientData => {
                    this.activeClientData = clientData;

                    this._appService.setActiveClientData(clientData);
                },
                error: () => this._appService.createAndAddErrorAlert()
            });
        }
    }

    public addAlert (alert: IAlert): void {
        this.alerts.push(alert);

        setTimeout(() => this.closeAlert(alert), alert.closeTimeout);
    }

    public closeAlert (alert: IAlert): void {
		this.alerts.splice(this.alerts.indexOf(alert), 1);
	}

    public signOut (): Subscription {
        return this._signService.signOut().subscribe({
            next: () => this._appService.reloadComponent(false, '/'),
            error: () => this._appService.createAndAddErrorAlert()
        });
    }
}