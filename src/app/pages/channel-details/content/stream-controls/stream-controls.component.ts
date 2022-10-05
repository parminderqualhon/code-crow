import { Util } from './../../../../util/util'
import { ChannelService } from './../../../../services/channel.service'
import { UserService } from './../../../../services/user.service'
import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Socket } from '../../../../services/socket.service'
import { StreamingService } from '../../../../services/streaming.service'
import { DialogService } from '../../../../services/dialog.service'
import { DialogData } from '../../../../shared/dialog-data'
import { environment } from '../../../../../environments/environment'
import { BnNgIdleService } from 'bn-ng-idle'
import { HintService } from '../../../../services/hint.service'
import { ChannelSettingsComponent } from '../../channel/channel-settings/channel-settings.component'
import { TokenControlsComponent } from './stream-token-control/stream-token-controls.component'

@Component({
    selector: 'app-stream-controls',
    templateUrl: './stream-controls.component.html',
    styleUrls: ['./stream-controls.component.scss']
})
export class StreamControlsComponent implements OnInit, OnDestroy {
    @Output() toggleMobileChat = new EventEmitter()
    private duration: number = 1
    public isUserList: boolean = false
    public host: any

    constructor(
        public channelService: ChannelService,
        public streamingService: StreamingService,
        public dialogChannelSettings: MatDialog,
        private socket: Socket,
        public userService: UserService,
        private dialogService: DialogService,
        private bnIdle: BnNgIdleService,
        public hintService: HintService
    ) {}

    async ngOnInit() {
        await this.streamingService.initRoomMembers()
        await this.streamingService.connect()
        this.host = await this.userService.getUserById(this.channelService.currentChannel.user)

        if (this.host._id === this.streamingService.userData.id) {
            this.socket.listenToChannelAccessRequest({ channelId: this.channelService.currentChannel })
                .subscribe(async (data) => {
                    const dialogData: DialogData = {
                        title: 'Access Request',
                        message: `${data.user.username} wants to join your channel. Do you want to let them in?`,
                        okText: 'Yes',
                        cancelText: 'No'
                    }

                    const dialogRef = this.dialogService.openDialog(dialogData, {
                        disableClose: true
                    })

                    dialogRef.afterClosed().subscribe(async (result) => {
                        try {
                            if (result) {
                                this.socket.emitChannelAccessResponse({
                                    channelId: this.channelService.currentChannel._id,
                                    userId: data.user.id,
                                    isGrantedAccess: result
                                })
                            }
                        } catch (err) {
                            this.userService.showError()
                        }
                    })
                })
        }

        // setInterval(async () => {
        //     if (
        //         this.streamingService?.streamOptions.isRecording ||
        //         this.streamingService?.userData?.screenStream != null ||
        //         this.streamingService?.userData?.webcamStream != null ||
        //         this.streamingService?.userData?.audioStream != null
        //     ) {
        //         this.duration++
        //         if (this.duration % 60 == 0) {
        //             this.channelService.sendToken({
        //                 channelId: this.channelService.currentChannel._id
        //             })
        //         }
        //     } else {
        //         this.duration = 1
        //     }
        // }, 1000)

        window.addEventListener('beforeunload', () => {
            this.streamingService.leaveRoom()
        })

        // this.bnIdle.startWatching(900).subscribe((isTimedOut: boolean) => {
        //     if (isTimedOut && !this.streamingService.hasActiveTracks) {
        //         this.streamingService.streamOptions.isTimedOut = isTimedOut
        //         this.streamingService.leaveRoom()
        //     }
        // })

        // this.bnIdle.startWatching(900).subscribe((isTimedOut: boolean) => {
        //     if (isTimedOut) { // && !this.streamingService.hasActiveTracks) {
        //         this.streamingService.streamOptions.isMaxLimitReached = isTimedOut
        //         this.streamingService.leaveRoom()
        //     }
        // })
    }

    async ngOnDestroy() {
        // this.bnIdle.stopTimer()
        await this.streamingService.leaveRoom()
    }

    showSilenceUserDialog(user) {
        const dialogData: DialogData = {
            title: user.userType === 'listener' ? 'Unsilence User' : 'Silence User',
            message:
                user.userType === 'listener'
                    ? 'Are you sure you want to unsilence this user?'
                    : 'Are you sure you want to silence this user?',
            okText: 'Yes',
            cancelText: 'Cancel'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe(async (result) => {
            try {
                if (result) {
                    this.streamingService.toggleUserType(user, false)
                }
            } catch (err) {
                this.userService.showError()
            }
        })
    }

    showRemoveUserDialog(user) {
        const dialogData: DialogData = {
            title: 'Remove User',
            message: 'Are you sure you want to remove this user?',
            okText: 'Yes',
            cancelText: 'Cancel',
            showCheckbox: true,
            isChecked: false,
            checkboxText: 'Block user from channel'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe(async (result) => {
            try {
                if (result) {
                    if (dialogData.isChecked) {
                        await this.channelService.blockUserFromChannel({
                            channelId: this.channelService.currentChannel._id,
                            userId: user.id
                        })
                        await this.channelService.removeChannelNotificationSubscriber({
                            channelId: this.channelService.currentChannel._id,
                            userId: user.id
                        })
                        await this.channelService.removeChannelFromUser({
                            channelId: this.channelService.currentChannel._id,
                            userId: user.id
                        })
                    }
                    this.socket.emitRemovedUser(this.channelService.currentChannel._id, user.id)
                    this.socket.emitRoomMemberUpdate({
                        channelId: this.channelService.currentChannel._id,
                        userData: { id: user.id },
                        isNewUser: false
                    })
                }
            } catch (err) {
                console.log('err', err)
                this.userService.showError()
            }
        })
    }

    tweetLiveStream() {
        const text = "I'm live-streaming on Code Crow! Click below to join me. 🖥"
        const url = `${environment.hostUrl}/channel/${this.channelService.currentChannel._id}`
        Util.tweet({ url, text })
    }

    noOp() {}

    showRecordingDialog() {
        if (this.streamingService.streamOptions.isRecording) {
            this.streamingService.toggleMediaRecorder()
        } else {
            const dialogData: DialogData = {
                title: 'Start Recording',
                message:
                    'Are you sure you want to start recording?<br/>The recording will include only your screen, your webcam, your audio, and the audio of all users that are participating.' +
                    ' The recording will <strong>NOT</strong> include the screens or webcams of other users. <br/>NOTE: Video processing may take a while depending on the length, please come back later to see the progress.',
                okText: 'Yes',
                cancelText: 'Cancel'
            }

            const dialogRef = this.dialogService.openDialog(dialogData, {
                disableClose: true
            })

            dialogRef.afterClosed().subscribe(async (result) => {
                try {
                    if (result) {
                        this.streamingService.toggleMediaRecorder()
                    }
                } catch (e) {
                    this.userService.showError()
                }
            })
        }
    }

    showTokenDialog() {
        this.dialogChannelSettings.open(TokenControlsComponent, {
            width: '450px'
        })
    }

    async showChannelSettingsDialog() {
        this.dialogChannelSettings.open(ChannelSettingsComponent, {
            width: '850px'
        })
    }
}
