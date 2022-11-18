import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { AuthService } from '../../../../auth/auth.service'
import { ChannelService } from '../../../../services/channel.service'
import { LoadingDialogComponent } from '../../../../controls/loading-dialog/loading-dialog.component'
import { WaitingRoomDialogComponent } from '../../../channel-details/channel/waiting-room-dialog/waiting-room-dialog.component'

@Component({
    selector: 'app-carousel-card',
    templateUrl: './carousel-card.component.html',
    styleUrls: ['./carousel-card.component.scss']
})
export class CarouselCardComponent implements OnInit {
    @Input() channelData: any
    @Input() index: number
    @Output() prev = new EventEmitter()
    @Output() next = new EventEmitter()
    @Input() activeChannel: boolean = false
    user: any = {}
    private dialogRefLoading: MatDialogRef<LoadingDialogComponent>

    constructor(
        public dialog: MatDialog,
        private router: Router,
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private channelService: ChannelService
    ) {}

    ngOnInit() {
        this.user = this.authService.currentUser
    }

    getImagePath(techName) {
        return this.channelService.techList
            .filter((x) => x.item_text === techName)
            .map((x) => x.item_image)
            .toString()
    }

    async showDialogOrJoin() {
        const channel = await this.channelService.getChannel({
            channelId: this.channelData._id
        }) // get updated channel data
        this.channelData = channel
        if (channel) {
            const isUserBlocked = await channel.blockedUsers?.some(
                (blockedUser) => blockedUser === this.user._id
            )
            if (!this.user.isAdmin && isUserBlocked) {
                this.snackBar.open('The owner of this channel has blocked you', null, {
                    duration: 5000
                })
            } else {
                if (
                    channel.isPrivate &&
                    channel.user != this.user._id &&
                    !channel?.notificationSubscribers?.includes(this.user._id)
                ) {
                    this.showWaitingRoomDialog()
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

    showWaitingRoomDialog() {
        this.dialog.open(WaitingRoomDialogComponent, {
            width: '400px',
            data: {
                channel: this.channelData
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
