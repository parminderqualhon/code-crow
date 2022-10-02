import { ChannelService } from '../../../../services/channel.service'
import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog'
import { ChatService } from '../../../../services/chat.service'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { LoadingDialogComponent } from '../../../../controls/loading-dialog/loading-dialog.component'

@Component({
    selector: 'app-password-dialog',
    templateUrl: './password-dialog.component.html',
    styleUrls: ['./password-dialog.component.scss']
})
export class PasswordDialogComponent implements OnInit {
    public error: any = {}
    public passwordDialogForm: FormGroup

    @ViewChild('passwordInput') passwordInput: ElementRef

    constructor(
        private dialogRefPassword: MatDialogRef<PasswordDialogComponent>,
        private dialogRefLoading: MatDialogRef<LoadingDialogComponent>,
        public chatService: ChatService,
        public channelService: ChannelService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        public dialog: MatDialog,
        private router: Router
    ) {}

    async ngOnInit() {
        this.passwordDialogForm = this.fb.group({
            password: [null, Validators.required]
        })

        setTimeout(() => {
            this.passwordInput.nativeElement.focus()
        }, 0)
    }

    onNoClick() {
        this.dialogRefPassword.close()
    }

    async enterPassword() {
        if (this.passwordDialogForm.valid) {
            try {
                const canAllowAccess = this.channelService.confirmPassword(
                    this.data.channel,
                    this.passwordDialogForm.value.password
                )
                if (canAllowAccess) {
                    await this.joinChannel(this.data.channel._id)
                    this.onNoClick()
                } else {
                    this.error = {
                        message: 'Incorrect password.'
                    }
                }
            } catch (err) {
                console.log(err)
                this.error = {
                    message: 'An unexpected error ocurred. Please try again.'
                }
            }
        } else {
            this.error = {
                message: 'Please fill in all required fields.'
            }
        }
    }

    async joinChannel(id) {
        try {
            this.showLoadingDialog()
            this.router.navigate(['/channel', id])
            this.closeLoadingDialog()
        } catch (e) {
            this.closeLoadingDialog()
        }
    }

    showLoadingDialog() {
        this.dialogRefLoading = this.dialog.open(LoadingDialogComponent, {
            width: '300px',
            data: {
                message: 'Joining channel...'
            }
        })
    }

    closeLoadingDialog() {
        this.dialogRefLoading.close()
    }
}
