import { Component, Input, EventEmitter, Output } from '@angular/core'
import { DialogService } from '../../../../../services/dialog.service'
import { DialogData } from '../../../../../shared/dialog-data'

@Component({
    selector: 'app-attachment',
    templateUrl: './attachment.component.html',
    styleUrls: ['./attachment.component.scss']
})
export class AttachmentComponent {
    @Input() item: string
    @Output() removeAttachment = new EventEmitter<string>()
    @Input() AttachmentList: boolean | undefined
    public showRemove: boolean = false

    constructor(private dialogService: DialogService) {}

    async showDeleteMessageDialog() {
        const dialogData: DialogData = {
            title: 'Delete Attachment',
            message: 'Are you sure you want to delete this attachment?',
            okText: 'Yes',
            cancelText: 'Cancel'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.onRemoveAttachment(this.item)
            }
        })
    }

    onRemoveAttachment(removeUrl) {
        this.removeAttachment.emit(removeUrl)
    }
}
