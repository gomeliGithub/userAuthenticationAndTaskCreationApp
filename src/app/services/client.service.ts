import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    public changePasswordFormIsVisiable: boolean = false;
    
    constructor (
        private readonly _http: HttpClient
    ) { }

    public changePasswordSubmit (existingUserLogin: string, newPassword: string): Observable<void> {
        return this._http.put<void>('/api/client/changeUserPassword', {
            client: {
                userLogin: existingUserLogin,
                userPassword: newPassword
            }
        });
    }
}