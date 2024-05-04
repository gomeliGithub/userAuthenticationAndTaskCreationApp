import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppService } from '../../app.service';
import { SignService } from '../../services/sign.service';

@Component({
    selector: 'app-sign',
    standalone: true,
    imports: [ CommonModule, RouterModule, ReactiveFormsModule, NgbModule ],
    templateUrl: './sign.component.html',
    styleUrl: './sign.component.css'
})
export class SignComponent {
    signForm: FormGroup<{
        clientLogin?: FormControl<string | null>
        clientEmail: FormControl<string | null>
        clientPassword: FormControl<string | null>
    }>;

    public signOperation: 'in' | 'up';

    constructor (
        private readonly _activateRoute: ActivatedRoute,

        private readonly _appService: AppService,
        private readonly _signService: SignService
    ) {
        this._activateRoute.url.subscribe(url => {
            this.signOperation = url.join(' ') as 'in' | 'up';

            const formControls: {
                clientLogin?: FormControl<string | null>
                clientEmail: FormControl<string | null>
                clientPassword: FormControl<string | null>
            } = {
                'clientEmail': new FormControl('', [
                    Validators.required, 
                    Validators.email
                ]),
                'clientPassword': new FormControl('', Validators.required)
            };

            if ( this.signOperation === 'up' ) {
                formControls['clientLogin'] = new FormControl('', [ 
                    Validators.required, 
                    Validators.pattern(/^[a-zA-Z](.[a-zA-Z0-9_-]*)$/) 
                ]);

                formControls['clientPassword'].addValidators(Validators.pattern(/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}/g));
            } else if ( this.signOperation === 'in' ) {
                delete formControls['clientLogin'];

                formControls['clientPassword'].removeValidators(Validators.pattern(/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}/g));
            }

            this.signForm = new FormGroup(formControls);
        });
    }

    public signFormSubmit (): void {
        const clientSignData = this.signForm.value;

        this._signService.sign(this.signOperation, clientSignData);
    }
}