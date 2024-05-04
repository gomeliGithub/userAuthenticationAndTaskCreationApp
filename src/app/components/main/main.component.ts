import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppService } from '../../app.service';
import { ClientService } from '../../services/client.service';

import { IActiveClientData } from 'types/global';

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [ CommonModule, ReactiveFormsModule ],
    templateUrl: './main.component.html',
    styleUrl: './main.component.css'
})
export class MainComponent {
    public changePasswordForm: FormGroup<{
        newPassword: FormControl<string>;
    }>;

    public activeClientData: IActiveClientData | null;

    public changePasswordFormIsVisiable: boolean;
    
    constructor (
        private readonly _appService: AppService,
        private readonly _clientService: ClientService
    ) { 
        this.changePasswordForm = new FormGroup({
            'newPassword': ( new FormControl("", [ Validators.required, Validators.pattern(/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}/g) ]) ) as FormControl<string>,
        });

        this.activeClientData = this._appService.activeClientData;
    }

    public changePasswordSubmit (): void {
        const changePasswordFormValue: Partial<{
            newPassword: string;
        }> = this.changePasswordForm.value;

        if ( this.activeClientData && changePasswordFormValue.newPassword ) this._clientService.changePasswordSubmit(this.activeClientData.login, changePasswordFormValue.newPassword);
    }
}