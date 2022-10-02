import { Component, Inject } from '@angular/core'
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar'

@Component({
    selector: 'app-in-app-snack-bar',
    templateUrl: './in-app-snack-bar.component.html',
    styleUrls: ['./in-app-snack-bar.component.scss']
})
export class InAppSnackBarComponent {
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
        console.log(data)
    }

    get getIcon() {
        switch (this.data.snackType) {
            case 'success':
                return { type: this.data.snackType, icon: 'check' }
            case 'error':
                return { type: this.data.snackType, icon: 'faults' }
            case 'warn':
                return { type: this.data.snackType, icon: 'warning_outline' }
            case 'info':
                return { type: this.data.snackType, icon: 'info' }
        }
    }

    closeSnackbar() {
        this.data.snackBar.dismiss()
    }
}
