import { Component, Inject } from '@angular/core'
import { DialogData } from '../../../shared/dialog-data'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { environment } from '../../../../environments/environment'

@Component({
    selector: 'app-login-content',
    templateUrl: './login-content.component.html',
    styleUrls: ['./login-content.component.scss']
})
export class LoginContentComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        public dialogRef: MatDialogRef<LoginContentComponent>,
    ) {}

    getHref(gitProvider: string): string {
        localStorage.setItem('loginDoReload', '' + true)
        return `${environment.apiUrl}/auth/${gitProvider}`
    }
}
