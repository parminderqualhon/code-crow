import { VideoService } from './../../../services/video.service'
import { StreamingService } from './../../../services/streaming.service'
import { SfxService, SoundEffect } from './../../../services/sfx.service'
import { ChannelService } from '../../../services/channel.service'
import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
    Input,
    AfterViewChecked
} from '@angular/core'
import { Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { ChatService } from '../../../services/chat.service'
import { ChannelSettingsComponent } from '../channel/channel-settings/channel-settings.component'
import { UserService } from '../../../services/user.service'
import { DialogService } from '../../../services/dialog.service'
import { DialogData } from '../../../shared/dialog-data'
import { Socket } from '../../../services/socket.service'
import { Subscription } from 'rxjs'
import { AuthService } from '../../../auth/auth.service'
import { SharedService } from '../../../services/shared.service'
import { MatMenu } from '@angular/material/menu'

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
    @ViewChild('chatDisplay', { static: false }) chatDisplay: ElementRef
    @ViewChild('reactionUserMenu', { static: false }) reactionUserMenu: MatMenu
    @ViewChild('emojiMenu', { static: false }) emojiMenu: MatMenu

    @Input() isTyping: boolean = false
    @Input() typingUser: any

    public userId: string
    public currentUser: any
    public notificationObject: any
    private hasScrolledBottom = false
    public hasInitialMessages: boolean = false
    public isShowingChannelDetails: boolean = false
    public attachments: string[]
    public videoCompositions: any = []
    public host: any

    throttle = 300
    scrollDistance = 1
    scrollUpDistance = 3
    subscription: Subscription

    public isNotificationsEnabled: boolean = true

    constructor(
        private router: Router,
        public chatService: ChatService,
        public channelService: ChannelService,
        public dialogChannelSettings: MatDialog,
        public dialogDonate: MatDialog,
        private dialogService: DialogService,
        private userService: UserService,
        private socket: Socket,
        private sfxService: SfxService,
        public streamingService: StreamingService,
        public videoService: VideoService,
        private authService: AuthService,
        private sharedService: SharedService,
    ) {}

    async ngOnInit() {
        this.currentUser = this.authService.currentUser
        const { _id, displayName, notificationObject } = this.authService.currentUser
        this.userId = _id
        this.host = await this.userService.getUserById(this.channelService.currentChannel.user)
        this.notificationObject = notificationObject
        this.attachments = this.channelService.currentChannel.attachments
        this.chatService.messages = []
        this.chatService.isGettingMessages = true

        this.isNotificationsEnabled =
            this.channelService.currentChannel?.notificationSubscribers?.includes(this.userId) || true
        console.log(this.channelService.currentChannel._id)
        this.subscription = this.socket
            .listenToChannelMessage(this.channelService.currentChannel._id)
            .subscribe((data) => {
                if (data) {
                    this.chatService.isGettingMessages = false
                    if (data.isMessageHistory) {
                        this.chatService.messages = data.data.concat(this.chatService.messages)
                        if (!this.hasInitialMessages) {
                            this.hasScrolledBottom = false
                            this.hasInitialMessages = true
                            this.chatService.sendChannelMessage(this.channelService.currentChannel, {
                                text: `${displayName} has entered the channel`
                            })
                        }
                        if (this.chatService.messages.length == 0) {
                            this.hasScrolledBottom = false
                        }
                    } else if (data.isMessageDeleted) {
                        this.chatService.messages = this.chatService.messages.filter(
                            (item) => item.state.timestamp !== data.data.state.timestamp
                        )
                    } else if (data.emojiReacted) {
                        console.log(data.messageObject)
                        let messageIndex = this.chatService.messages.findIndex(
                            (msgEl: any) =>
                                msgEl.timestamp == data.messageObject.timestamp &&
                                msgEl.userData.id == data.messageObject.userData.id
                        )

                        if (messageIndex > -1) {
                            this.chatService.messages[messageIndex] = data.messageObject
                            console.log(this.chatService.messages[messageIndex])
                        }
                        // this.chatService.messages = this.chatService.messages.filter((msgEl: any) => {
                        //     if (
                        //         msgEl.state.timestamp == data.data.state.timestamp &&
                        //         msgEl.attributes.userId == data.data.attributes.userId
                        //     ) {
                        //         return data.data;
                        //     } else {
                        //         return msgEl;
                        //     }
                        // })
                    } else {
                        console.log(data)
                        //TODO: this.sfxService.playAudio should be fixed 
                        //if (data.userData.id != _id && !data.message.includes('has entered the channel'))
                          //  this.sfxService.playAudio(SoundEffect.ReceivedMessage)
                        this.chatService.messages.push(data)
                        this.hasScrolledBottom = false
                    }
                }
            })
        // this.videoCompositions = await this.streamingService.getCompositions({ channelId: this.channelService.currentChannel._id })
        // this.socket.listenToVideoRecordingStarted({ channelId: this.channelService.currentChannel._id })
        //     .subscribe(composition => {
        //         this.streamingService.streamOptions.isRecording = true
        //     })
        // this.socket.listenToCompositionStatusUpdate({ channelId: this.channelService.currentChannel._id })
        //     .subscribe(updatedComposition => {
        //         if (updatedComposition.sessionCounter) this.channelService.currentChannel.sessionCounter = updatedComposition.sessionCounter
        //         if (this.videoCompositions && this.videoCompositions.length) {
        //             var composition = this.videoCompositions.find(composition => composition.sid == updatedComposition.sid)
        //             if (composition) {
        //                 Object.assign(composition, updatedComposition)
        //             } else {
        //                 this.videoCompositions.unshift(updatedComposition)
        //             }
        //         } else {
        //             this.videoCompositions.push(updatedComposition)
        //         }
        //     })
        // this.socket.listenToCompositionDeleted({ channelId: this.channelService.currentChannel._id })
        //     .subscribe(deletedComposition => {
        //         this.videoCompositions = this.videoCompositions.filter(composition => composition.sid != deletedComposition.sid)
        //     })
    }

    async toggleNotifications() {
        this.channelService.currentChannel = await this.channelService.getChannel({
            channelId: this.channelService.currentChannel._id
        })
        // if (!this.notificationObject) {
        //     try {
        //         const sub = await this.swPush.requestSubscription({
        //             serverPublicKey: environment.vapidKey
        //         })
        //         await this.userService.updateWebNotificationSubscription({
        //             sub,
        //             userId: this.userId
        //         })
        //     } catch (ex) {}
        // }
        await this.channelService.toggleNotifications({
            channel: this.channelService.currentChannel,
            userId: this.userId
        })
        this.isNotificationsEnabled = !this.isNotificationsEnabled
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe()
            this.chatService.resetSkipLimit()
        }
    }

    ngAfterViewChecked() {
        setTimeout(() => {
            if (this.chatDisplay && !this.hasScrolledBottom) {
                const el = this.chatDisplay.nativeElement
                el.scrollTop = el.scrollHeight
                this.hasScrolledBottom = true
            }
        }, 1000)
    }

    async showChannelSettingsDialog() {
        this.dialogChannelSettings.open(ChannelSettingsComponent, {
            width: '850px'
        })
    }

    async leaveChannel() {
        const { title } = this.channelService.currentChannel
        if (this.channelService.currentChannel.user == this.userId) {
            this.showOwnerExitDialog(title)
        } else {
            await this.channelService.leaveChannel(this.userId, true)
            this.chatService.messages = []
            this.router.navigate(['/'])
        }
    }

    showTipDialog() {
        // const user: any = this.userService.getUserById(this.channelService.currentChannel.user)
        // this.dialogDonate.open(TipDialogComponent, {
        //     width: '400px',
        //     data: {
        //         recipientAccountId: user?.stripe?.accountId,
        //         recipientAccountName: user.username
        //     }
        // })
    }

    async onScrollUp(ev) {
        const channel = { channelId: this.channelService.currentChannel._id }
        this.chatService.getMessages(channel, 'channelChat')
    }

    showOwnerExitDialog(title: string) {
        const dialogData: DialogData = {
            title: 'Exit Channel',
            message:
                "You're the host of <strong>" +
                title +
                '</strong> channel, leaving the channel will delete the channel and all the messages in it. Are you sure you want to continue?',
            okText: 'Yes',
            cancelText: 'Cancel'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe(async (result) => {
            try {
                if (result) {
                    this.sharedService.wasHomePressed = true
                    await this.chatService.deleteAllMessages(this.channelService.currentChannel._id)
                    //TODO: delete all channel videos
                    // await this.streamingService.deleteAllCompositions({
                    //     roomSid: this.streamingService.videoRoom.sid,
                    //     channelId: this.channelService.currentChannel._id
                    // })
                    await this.channelService.leaveChannel(this.userId, true)
                    this.router.navigate(['/'])
                }
            } catch (e) {
                this.userService.showError()
            }
        })
    }

    toggleRecordedVideos() {
        this.streamingService.isShowingRecordedVideos =
            !this.streamingService.isShowingRecordedVideos
    }

    toggleChannelDetails() {
        this.isShowingChannelDetails = !this.isShowingChannelDetails
    }

    async showDeleteRecordedVideoDialog(videoComposition) {
        const dialogData: DialogData = {
            title: 'Delete recorded video',
            message:
                'Are you sure you want to delete the recorded video?<br/>This action cannot be undone.',
            okText: 'Yes',
            cancelText: 'Cancel'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe(async (result) => {
            try {
                if (result) {
                    this.socket.emitCompositionDeleted({
                        channelId: this.channelService.currentChannel._id,
                        compositionSid: videoComposition.sid
                    })
                    this.videoCompositions = this.videoCompositions.filter(
                        (composition) => composition.sid != videoComposition.sid
                    )
                }
            } catch (e) {
                console.log('ERROR: showDeleteRecordedVideoDialog', e)
                this.userService.showError()
            }
        })
    }

    async onReactToMessage(event: any, Message: any, When: any, SenderId: any) {
        try {
            let channel = this.channelService.currentChannel
            const reaction = event.emoji.native
            if (channel) {
                
                this.socket.emitReactToMessage(channel._id, {Message, When, SenderId}, this.currentUser, reaction)
                // console.log(this.Message, channel._id, reaction, this.CurrentUser);
            }
        } catch (e) {
            console.log(e)
        }
    }

    stopPropagation = (event: any) => {
        event.stopPropagation()
    }
}
