import { DialogService } from '../../../services/dialog.service'
import { Component, Inject } from '@angular/core'
import { HintService } from '../../../services/hint.service'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { DialogData } from '../../../shared/dialog-data'

@Component({
    selector: 'app-add-hint',
    templateUrl: './add-hint.component.html',
    styleUrls: ['./add-hint.component.scss']
})
export class AddHintComponent {
    public text: string
    constructor(
        private hintService: HintService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<AddHintComponent>,
        private dialogService: DialogService
    ) {}

    createHint(text: string) {
        const dialogData: DialogData = {
            title: 'Confirm adding hint',
            message: `Are you sure you want to add the following hint: ${text}`,
            okText: 'CONFIRM',
            cancelText: 'CLOSE'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    await this.hintService.createHint({ funFactText: text })
                    this.dialogRef.close()
                } catch (e) {
                    console.log(e)
                }
            }
        })
    }
}
