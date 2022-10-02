import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { InAppSnackBarComponent } from './../controls/in-app-snack-bar/in-app-snack-bar.component'

@Injectable({
    providedIn: 'root'
})
export class InAppSnackBarService {
    constructor(private snackBar: MatSnackBar) {}

    public openSnackBar(message, type, duration?, verticalPosition?, horizontalPosition?) {
        const _snackType = type !== undefined ? type : 'success'
        this.snackBar.openFromComponent(InAppSnackBarComponent, {
            duration: duration || 4000,
            horizontalPosition: horizontalPosition || 'end',
            verticalPosition: verticalPosition || 'top',
            data: {
                message: message,
                snackType: _snackType,
                snackBar: this.snackBar
            }
        })
    }
}
