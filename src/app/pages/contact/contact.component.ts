import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { NotificationService } from '../../services/notification.service'
import { isPlatformServer } from '@angular/common'
import { SharedService } from '../../services/shared.service'

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
    isServer = isPlatformServer(this.platformId)
    public contactForm: FormGroup
    public isSendingMessage: boolean
    public isValidationError: boolean
    public isConnectionError: boolean
    public isMessageSent: boolean

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private fb: FormBuilder,
        private notificationService: NotificationService,
        private sharedService: SharedService
    ) {
        this.contactForm = this.fb.group({
            name: [null, Validators.required],
            email: [null, Validators.compose([Validators.email, Validators.required])],
            subject: [null, Validators.required],
            message: [null, Validators.required]
        })
    }

    ngOnInit() {
        this.sharedService.isLoginPage = false
    }

    public async sendMessage() {
        this.contactForm.markAllAsTouched()
        if (this.contactForm.valid) {
            const { subject, message, name, email } = this.contactForm.value
            this.isValidationError = false
            this.isConnectionError = false
            this.isSendingMessage = true
            try {
                await this.notificationService.sendEmail(subject, message, name, email, true)
                this.isSendingMessage = false
                this.isMessageSent = true
                this.contactForm.reset()
            } catch (e) {
                this.isConnectionError = true
                this.isSendingMessage = false
            }
        } else {
            this.isValidationError = true
            this.isSendingMessage = false
        }
    }
}
