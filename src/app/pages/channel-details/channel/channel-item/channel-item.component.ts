import { PasswordDialogComponent } from '../password-dialog/password-dialog.component'
import { Component, OnInit, Input, ViewChild } from '@angular/core'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { LoadingDialogComponent } from '../../../../controls/loading-dialog/loading-dialog.component'
import { Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ChannelService } from '../../../../services/channel.service'
import { Util } from '../../../../util/util'
import { AuthService } from '../../../../auth/auth.service'

@Component({
    selector: 'app-channel-item',
    templateUrl: './channel-item.component.html',
    styleUrls: ['./channel-item.component.scss']
})
export class ChannelItemComponent implements OnInit {
    @Input() channel: any
    @Input() isGridView: boolean
    public isCurrentChannel: boolean
    public isHostChannel: boolean
    public isParticipantChannel: boolean
    private dialogRefLoading: MatDialogRef<LoadingDialogComponent>
    private user: any
    private techStackUrls: string[] = []

    constructor(
        public dialog: MatDialog,
        private channelService: ChannelService,
        private router: Router,
        private snackBar: MatSnackBar,
        private authService: AuthService
    ) {}

    async ngOnInit() {
        this.user = this.authService.currentUser
        if (this.user)
            this.isHostChannel =
                this.user.hostChannelIds && this.user.hostChannelIds.includes(this.channel._id)
        if (this.user)
            this.isParticipantChannel =
                this.user.channelIds && this.user.channelIds.includes(this.channel._id)
        // this.techStackUrls = this.channelService.techList.filter(item => this.channel.techStack.includes(item.item_text)).map(item => item.item_image)
        this.channel.techStack.forEach((techName) => {
            const tech = this.channelService.techList.find((item) => item.item_text === techName)
            if (tech) this.techStackUrls.push(tech.item_image)
        })
    }

    async showDialogOrJoin() {
        const channel = await this.channelService.getChannel({
            channelId: this.channel._id
        }) // get updated channel data
        this.channel = channel
        if (channel) {
            const isUserBlocked = await channel.blockedUsers.some(
                (blockedUser) => blockedUser === this.user._id
            )
            if (!this.user.isAdmin && isUserBlocked) {
                this.snackBar.open('The owner of this channel has blocked you', null, {
                    duration: 5000
                })
            } else {
                if (
                    channel.password &&
                    channel.user != this.user._id &&
                    !channel?.notificationSubscribers?.includes(this.user._id)
                ) {
                    this.showPasswordDialog()
                } else {
                    this.showLoadingDialog()
                    this.router.navigate(['/channel', channel._id])
                    this.closeLoadingDialog()
                }
            }
        } else {
            this.snackBar.open("This channel doesn't exist anymore", null, {
                duration: 5000
            })
        }
    }

    showPasswordDialog() {
        this.dialog.open(PasswordDialogComponent, {
            width: '400px',
            data: {
                channel: this.channel
            },
            autoFocus: false
        })
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
