import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { AppService } from '../app.service';

import { IActiveClientData } from 'types/global';

@Injectable({
    providedIn: 'root'
})
export class SignService {
    constructor (
        private readonly _http: HttpClient,

        private readonly _appService: AppService
    ) { }

    public sign (operation: string, signData: Partial<{
        clientLogin?: string | null;
        clientEmail: string | null;
        clientPassword: string | null;
    }>): void {
        this._http.post('/api/sign/process', {
            sign: {
                operation,
                clientData: {
                    login: signData.clientLogin,
                    email: signData.clientEmail, 
                    password: signData.clientPassword
                }
            }
        }, { responseType: 'text', headers: this._appService.createAuthHeaders() ?? { }, withCredentials: true }).subscribe({
            next: access_token => {
                if ( operation === 'in' ) {
                    localStorage.setItem('access_token', access_token);

                    this._appService.reloadComponent(false, '');
                } else if ( operation === 'up' ) this._appService.reloadComponent(false, '/sign/in');
            },
            error: () => this._appService.createAndAddErrorAlert()
        });
    }

    public signOut (): Observable<void> {
        return this._http.put<void>('/api/sign/out', { }, { headers: this._appService.createAuthHeaders() ?? { }, withCredentials: true });
    }

    public getActiveClient (): Observable<IActiveClientData | null> {
        return this._http.get<IActiveClientData | null>('/api/sign/getActiveClient', { headers: this._appService.createAuthHeaders() ?? { }, withCredentials: true });
    }
}