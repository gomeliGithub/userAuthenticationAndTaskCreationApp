import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';

import { Alert } from 'types/global';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    constructor (
        private readonly _router: Router
    ) { }

    public alertsAddChange: EventEmitter<Alert> = new EventEmitter();
    public alertsCloseChange: EventEmitter<Alert> = new EventEmitter();

    public createAndAddSuccessAlert (message: string, closeTimeout: number = 3000): void {
        this.addAlert({ type: 'success', message, closeTimeout });
    }

    public createAndAddWarningAlert (message: string, closeTimeout: number = 3000): void {
        this.addAlert({ type: 'warning', message, closeTimeout });
    }

    public createAndAddErrorAlert (message?: string, closeTimeout: number = 3000): void {
        this.addAlert({ type: 'danger', message: message ?? 'Что-то пошло не так. Попробуйте ещё раз', closeTimeout });
    }

    public addAlert (value: Alert): void {
        this.alertsAddChange.emit(value);
    }

    public closeAlert (value: Alert): void {
        this.alertsCloseChange.emit(value);
    }

    public async reloadComponent (self: boolean, urlToNavigateTo?: string, reloadPage = true): Promise<void> {
        const url: string | undefined = self ? this._router.url : urlToNavigateTo;

        return this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this._router.navigate([ url ]).then(() => {
                if ( reloadPage ) window.location.reload();
            });
        })
    }

    public createAuthHeaders (): HttpHeaders | null {
        const token: string | null = localStorage.getItem('access_token');

        const headers = new HttpHeaders().set('Authorization', token ? `Bearer ${ token }` : "");

        return token ? headers : null;
    }
}