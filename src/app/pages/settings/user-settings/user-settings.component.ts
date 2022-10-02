import { AfterViewInit, Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
// import { SwPush } from '@angular/service-worker';
// import { environment } from '../../../../environments/environment';
import { UserService } from '../../../services/user.service'
import { SfxService, SoundEffect } from '../../../services/sfx.service'
import { AuthService } from '../../../auth/auth.service'

@Component({
    selector: 'app-user-settings',
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements AfterViewInit {
    public settingsForm: FormGroup
    public notificationForm: FormGroup
    // public isEmailNotificationsEnabled: boolean = false
    // public isWebNotificationsEnabled: boolean = false
    public isDoNotDisturbEnabled: boolean = false
    public isMessageGuardEnabled: boolean = false
    public email: string = ''
    public isMutedAll: boolean = false
    public isMutedAskedToSpeak: boolean = false
    public isMutedChannelUpdates: boolean = false
    public isMutedFriendRequestReceived: boolean = false
    public isMutedMicMutedAndUnmuted: boolean = false
    public isMutedSentAndReceivedMessage: boolean = false
    public isMutedStartedAndStoppedSharingScreen: boolean = false
    public isMutedUserJoinedAndLeftChannel: boolean = false

    constructor(
        private formbuilder: FormBuilder,
        private userService: UserService,
        private fb: FormBuilder,
        // private swPush: SwPush,
        private sfxService: SfxService,
        private authService: AuthService
    ) {
        this.notificationForm = this.formbuilder.group({
            // isEmailNotificationsEnabled: [false],
            // isWebNotificationsEnabled: [false],
            isDoNotDisturbEnabled: [false],
            isMessageGuardEnabled: [false],
            isMutedAll: [false],
            isMutedAskedToSpeak: [false],
            isMutedChannelUpdates: [false],
            isMutedFriendRequestReceived: [false],
            isMutedMicMutedAndUnmuted: [false],
            isMutedSentAndReceivedMessage: [false],
            isMutedStartedAndStoppedSharingScreen: [false],
            isMutedUserJoinedAndLeftChannel: [false]
        })
        this.settingsForm = this.fb.group({
            email: [null, Validators.compose([Validators.email])]
        })
    }

    async ngAfterViewInit() {
        const user = this.authService.currentUser
        // this.isEmailNotificationsEnabled = user.isEmailNotificationsEnabled
        // this.isWebNotificationsEnabled = user.isWebNotificationsEnabled
        this.isDoNotDisturbEnabled = user.isDoNotDisturbEnabled
        this.isMessageGuardEnabled = user.isMessageGuardEnabled
        this.email = user.email
        this.settingsForm.get('email').setValue(this.email)
        await this.sfxService.getAllSavedMutedSfx()
        this.isMutedAll = this.sfxService.sfxList.find((sfx) => sfx.key == SoundEffect.All).isMuted
    }

    // async onChangeEmail() {
    //   await this.userService.updateIsEmailNotificationsEnabled(this.notificationForm.value.isEmailNotificationsEnabled)
    //   this.isEmailNotificationsEnabled = this.notificationForm.value.isEmailNotificationsEnabled
    // }

    // async onChangeWeb() {
    //   if (this.notificationForm.value.isWebNotificationsEnabled) {
    //     const sub = await this.swPush.requestSubscription({ serverPublicKey: environment.vapidKey })
    //     console.log("web-sub", sub)
    //     await this.userService.updateWebNotificationSubscription(sub)
    //   }
    //   await this.userService.updateIsWebNotificationsEnabled(this.notificationForm.value.isWebNotificationsEnabled)
    //   this.isWebNotificationsEnabled = this.notificationForm.value.isWebNotificationsEnabled
    // }

    async onChangeDoNotDisturb() {
        await this.userService.updateIsDoNotDisturbEnabled(
            this.notificationForm.value.isDoNotDisturbEnabled
        )
        this.isDoNotDisturbEnabled = this.notificationForm.value.isDoNotDisturbEnabled
    }

    async onChangeMessageGuard() {
        await this.userService.updateIsMessageGuardEnabled(
            this.notificationForm.value.isMessageGuardEnabled
        )
        this.isMessageGuardEnabled = this.notificationForm.value.isMessageGuardEnabled
    }

    async saveEmail() {
        if (this.settingsForm.valid) {
            this.email = this.settingsForm.value.email
            await this.userService.updateEmail(this.email)
            this.userService.showSnackBar('Email saved', 3000)
            // if (!this.settingsForm.value.email) {
            //   this.notificationForm.value.isEmailNotificationsEnabled = false
            //   this.onChangeEmail()
            // }
        }
    }

    async onChangeIsMutedAll() {
        this.sfxService.saveIsMuted(SoundEffect.All, this.notificationForm.value.isMutedAll)
        this.isMutedAll = this.notificationForm.value.isMutedAll
    }

    async onChangeIsMutedAskedToSpeak() {
        this.sfxService.saveIsMuted(
            SoundEffect.AskedToSpeak,
            this.notificationForm.value.isMutedAskedToSpeak
        )
        this.isMutedAskedToSpeak = this.notificationForm.value.isMutedAskedToSpeak
    }

    async onChangeIsMutedChannelUpdates() {
        this.sfxService.saveIsMuted(
            SoundEffect.ChannelUpdates,
            this.notificationForm.value.isMutedChannelUpdates
        )
        this.isMutedChannelUpdates = this.notificationForm.value.isMutedChannelUpdates
    }

    async onChangeIsMutedFriendRequestReceived() {
        this.sfxService.saveIsMuted(
            SoundEffect.FriendRequestReceived,
            this.notificationForm.value.isMutedFriendRequestReceived
        )
        this.isMutedFriendRequestReceived = this.notificationForm.value.isMutedFriendRequestReceived
    }

    async onChangeIsMutedMicMutedAndUnmuted() {
        this.sfxService.saveIsMuted(SoundEffect.MutedMic, this.notificationForm.value.isMutedAll)
        this.isMutedAll = this.notificationForm.value.isMutedAll
    }

    async onChangeIsMutedSentAndReceivedMessage() {
        this.sfxService.saveIsMuted(SoundEffect.SentMessage, this.notificationForm.value.isMutedAll)
        this.isMutedAll = this.notificationForm.value.isMutedAll
    }

    async onChangeIsMutedStartedAndStoppedSharingScreen() {
        this.sfxService.saveIsMuted(
            SoundEffect.StartedSharingScreen,
            this.notificationForm.value.isMutedStartedAndStoppedSharingScreen
        )
        this.isMutedStartedAndStoppedSharingScreen =
            this.notificationForm.value.isMutedStartedAndStoppedSharingScreen
    }

    async onChangeIsMutedUserJoinedAndLeftChannel() {
        this.sfxService.saveIsMuted(
            SoundEffect.UserJoinedChannel,
            this.notificationForm.value.isMutedUserJoinedAndLeftChannel
        )
        this.isMutedUserJoinedAndLeftChannel =
            this.notificationForm.value.isMutedUserJoinedAndLeftChannel
    }
}
