import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    ViewChild,
    ElementRef,
    AfterViewChecked
} from '@angular/core'
import { EventEmitter } from '@angular/core'
import { Router } from '@angular/router'
import { TokenStorage } from '../../../auth/token.storage'
import { Socket } from '../../../services/socket.service'
import { ChatService } from '../../../services/chat.service'
import { UserService } from '../../../services/user.service'
import { Subscription } from 'rxjs'
import { ChannelService } from '../../../services/channel.service'
import { AuthService } from '../../../auth/auth.service'
import { DialogService } from '../../../services/dialog.service'
import { DialogData } from '../../../shared/dialog-data'
import { MatSnackBar } from '@angular/material/snack-bar'
import { GroupchatService } from '../../../services/groupchat.service'
import { FriendService } from '../../../services/friend.service'
import { SharedService } from '../../../services/shared.service'
import { environment } from '../../../../environments/environment'

@Component({
    selector: 'app-friend-chat',
    templateUrl: './friend-chat.component.html',
    styleUrls: ['./friend-chat.component.scss']
})
export class FriendChatComponent implements OnInit, AfterViewChecked, OnDestroy {
    @ViewChild('chatDisplay', { static: false }) chatDisplay: ElementRef

    isMinimized: boolean
    @Input() chat: any
    @Input() friendGroup: any
    @Input() isGroupChat: boolean = false
    @Output() leaveGroupEvent = new EventEmitter<any>()
    @Output() editGroupEvent = new EventEmitter<any>()
    @Output() leaveMemberEvent = new EventEmitter<any>()

    public user: any
    public userId: string
    public givenEmoji: any
    public appInputRefresh: boolean = false
    public givenGifImage: any
    public attributes: any
    public hasPrevPage: boolean = false
    public isLoading: boolean = false
    private hasScrolledBottom = false
    public isTyping: boolean = false
    public typingUser: any
    isExpanded: boolean = false
    public isHost: any = false

    throttle = 300
    scrollDistance = 1
    scrollUpDistance = 3
    subscription: Subscription

    public channel: any
    public isNotificationsEnabled: boolean = true

    constructor(
        private socket: Socket,
        public chatService: ChatService,
        public tokenStorage: TokenStorage,
        public userService: UserService,
        public channelService: ChannelService,
        private authService: AuthService,
        public dialogService: DialogService,
        public groupChatService: GroupchatService,
        public friendService: FriendService,
        public sharedService: SharedService,
        private router: Router,
        private snackBar: MatSnackBar,
    ) {}

    async ngOnInit() {
        this.chat.messages = []
        this.chat.skip = 0
        this.chat.limit = 100
        this.isLoading = true
        this.user = this.authService.currentUser
        if (this.isGroupChat) {
            this.chat = this.friendGroup
        }

        this.channel = await this.channelService.getChannel({
            channelId: this.chat.chat.channel
        })
        this.isNotificationsEnabled =
            this.user && this.channel.notificationSubscribers.includes(this.user._id)
        this.isHost = this.user && this.user._id == this.channel.user

        this.subscription = this.socket
            .listenToChannelMessage(this.chat.chat.channel)
            .subscribe((data) => {
                this.isLoading = false
                if (data) {
                    if (data.isMessageHistory) {
                        if (data.data.length == 100) {
                            this.hasPrevPage = true
                        } else {
                            this.hasPrevPage = false
                        }
                        if (this.chat.messages.length == 0) {
                            this.hasScrolledBottom = false
                        }
                        this.chat.messages = data.data.concat(this.chat.messages)
                    } else if (data.isMessageDeleted) {
                        this.chat.messages = this.chat.messages.filter(
                            (item) => item.state.timestamp !== data.data.state.timestamp
                        )
                    } else {
                        this.chat.messages.push(data)
                        this.hasScrolledBottom = false
                    }
                }
            })

        this.socket.listenToChannelTyping(this.chat.chat.channel).subscribe((data) => {
            if (data.user && this.user && data.user._id != this.user._id) {
                this.typingUser = data.user
                this.isTyping = data.user.isTyping
            }
        })
    }

    async toggleNotifications() {
        this.channel = await this.channelService.getChannel({
            channelId: this.chat.chat.channel
        })
        // if (!this.user.notificationObject) {
        //     const sub = await this.swPush.requestSubscription({
        //         serverPublicKey: environment.vapidKey
        //     })
        //     await this.userService.updateWebNotificationSubscription({
        //         sub,
        //         userId: this.user._id
        //     })
        // }
        await this.channelService.toggleNotifications({
            channel: this.channel,
            userId: this.user._id
        })
        this.isNotificationsEnabled = !this.isNotificationsEnabled
    }

    ngAfterViewChecked() {
        if (this.chatDisplay && (!this.hasScrolledBottom || this.chat.isUserRequestingToOpenChat)) {
            const el = this.chatDisplay.nativeElement
            el.scrollTop = el.scrollHeight
            this.hasScrolledBottom = true
            if (this.chat.messages.length > 2) {
                this.chat.isUserRequestingToOpenChat = false
            }
        }
    }

    closeChat() {
        let index = this.chatService.activeTabs.indexOf(this.chat)
        this.chatService.activeTabs.splice(index, 1)
    }

    editGroup(friendGroup) {
        this.editGroupEvent.emit(friendGroup)
    }

    goToChannel() {
        const dialogData: DialogData = {
            title: 'Go to Channel',
            message: 'Are you sure you want to go to the channel?',
            okText: 'OK',
            cancelText: 'CANCEL'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe(async (result) => {
            try {
                this.chatService.isChatsEnabled = false
                if (result) {
                    this.router.navigate(['/channel', this.friendGroup.channelId])
                }
            } catch (e) {
                this.snackBar.open('An error has occured, please try again later', null, {
                    duration: 2000
                })
            }
        })
    }

    async leaveGroup() {
        const dialogData: DialogData = {
            title: 'Leave Group',
            message: 'Are you sure want to leave the group?',
            okText: 'Ok',
            cancelText: 'Cancel'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe(async (result) => {
            try {
                if (result) {
                    this.userId = this.authService.currentUser._id
                    if (this.userId === this.friendGroup.host._id) {
                        let members = this.friendGroup.members.map((m) => m._id)
                        if (members.length > 0) {
                            let newHost = members[0]
                            members.splice(0, 1)
                            try {
                                console.log(members, newHost)
                                await this.groupChatService.updateHostMemberGroup(
                                    this.friendGroup.groupId,
                                    members,
                                    newHost
                                )
                                this.snackBar.open('You have left the group', null, {
                                    duration: 2000
                                })
                            } catch (e) {
                                this.snackBar.open(
                                    'An error has occured, please try again later',
                                    null,
                                    { duration: 2000 }
                                )
                            }
                        } else if (members.length === 0) {
                            try {
                                let deleteGroup = await this.groupChatService.deleteGroup(
                                    this.friendGroup.groupId
                                )
                                if (deleteGroup) {
                                    try {
                                        await this.channelService.deleteChannel(
                                            this.friendGroup.channelId
                                        )
                                        if (this.router.url != '/') {
                                            this.router.navigate(['/'])
                                        }
                                        setTimeout(
                                            async () =>
                                                await this.channelService.getInitialChannels(),
                                            100
                                        )
                                        this.snackBar.open('You have left the group', null, {
                                            duration: 2000
                                        })
                                    } catch (e) {
                                        this.snackBar.open(
                                            'An errorc has occured, please try again later',
                                            null,
                                            { duration: 2000 }
                                        )
                                    }
                                }
                            } catch (e) {
                                this.snackBar.open(
                                    'An errorg has occured, please try again later',
                                    null,
                                    { duration: 2000 }
                                )
                            }
                        }
                    } else {
                        let members = this.friendGroup.members.map((m) => m._id)
                        let index = members.indexOf(this.userId)
                        if (members.length >= 1) {
                            members.splice(index, 1)
                            await this.groupChatService.updateGroup(
                                this.friendGroup.groupId,
                                members,
                                this.friendGroup.groupName
                            )
                            this.closeChat()
                            this.leaveMemberEvent.emit(this.friendGroup)
                            this.snackBar.open('You have left the group', null, {
                                duration: 2000
                            })
                        }
                    }

                    this.closeChat()
                    this.sharedService.refreshGroupList()
                    this.leaveMemberEvent.emit(true)
                }
            } catch (e) {
                this.snackBar.open('An error has occured, please try again later', null, {
                    duration: 2000
                })
            }
        })
    }

    async onScrollUp(ev) {
        if (!this.hasPrevPage) return
        if (this.isLoading) return
        this.isLoading = true
        this.chat.skip = this.chat.skip + this.chat.limit
        this.chatService.getMessages(this.chat, 'oneToOneChat')
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe()
        }
    }

    resizeChatWindow() {
        this.isExpanded = !this.isExpanded
        this.hasScrolledBottom = false
    }
}
