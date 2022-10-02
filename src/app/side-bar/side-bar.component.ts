import { ChannelService } from '../services/channel.service'
import { Component, OnInit, OnDestroy, Input } from '@angular/core'
import { FriendService } from '../services/friend.service'
import { Subscription } from 'rxjs'
import * as _ from 'lodash'
import { AnimationOptions } from 'ngx-lottie'
import { AuthService } from '../auth/auth.service'
import { UserService } from '../services/user.service'
import { ThemeService } from '../services/theme.service'
import { DialogService } from '../services/dialog.service'
import { DialogData } from '../shared/dialog-data'
const { version: appVersion } = require('../../../package.json')
import { environment } from '../../environments/environment'
import { ChatService } from '../services/chat.service'
import { SharedService } from '../services/shared.service'

export interface Option {
    backgroundColor: string
    buttonColor: string
    headingColor: string
    label: string
    value: string
}

@Component({
    selector: 'app-side-bar',
    templateUrl: './side-bar.component.html',
    styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit, OnDestroy {
    @Input() isCompact: boolean = false
    public isDarkTheme: boolean = false
    public showUsers: boolean = false
    public version: string = appVersion
    public versionAndEnv: string

    public animationOpts: AnimationOptions = null
    private animationOptsSubscription: Subscription

    constructor(
        public authService: AuthService,
        public userService: UserService,
        public themeService: ThemeService,
        private dialogService: DialogService,
        public channelService: ChannelService,
        public friendService: FriendService,
        public chatService: ChatService,
        public sharedService: SharedService
    ) {}

    async ngOnInit() {
        this.getVersion()
        this.isDarkTheme = await this.themeService.isDarkTheme()
        this.animationOptsSubscription = this.themeService.logoAnimationOpts.subscribe(
            async (opts) => {
                if (opts) {
                    this.animationOpts = opts
                }
            }
        )
        this.themeService.updateAnimation()
    }

    ngOnDestroy() {
        if (this.animationOptsSubscription) this.animationOptsSubscription.unsubscribe()
    }

    onModeChange() {
        this.isDarkTheme = !this.isDarkTheme
        const themeToSet = this.isDarkTheme ? 'theme-dark' : 'theme-light'
        this.themeService.setTheme(themeToSet)
    }

    async showLogoutDialog() {
        // this.onSidenavClose()
        const dialogData: DialogData = {
            title: 'Logout',
            message: 'Are you sure you want to logout?',
            okText: 'Yes',
            cancelText: 'Cancel'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                this.sharedService.isLoginPage = true
                await this.authService.logout()
            }
        })
    }

    showUsersDialog() {
        this.userService.isUsersEnabled = true
    }

    showChatsDialog() {
        this.chatService.isChatsEnabled = true
    }

    hideUsersPanel() {
        this.showUsers = false
    }

    getVersion() {
        // var envName = environment.production ? "" : ' [' + environment.name + ']'
        return (this.versionAndEnv = 'v' + this.version + ' [' + environment.name + ']')
    }
}
