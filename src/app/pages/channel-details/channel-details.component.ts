import { Component, OnInit, HostListener, OnDestroy } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { ChatService } from '../../services/chat.service'
import { FriendService } from '../../services/friend.service'
import { Socket } from '../../services/socket.service'
import { Router, ActivatedRoute } from '@angular/router'
import { SharedService } from '../../services/shared.service'
import { LoadingDialogComponent } from './../../controls/loading-dialog/loading-dialog.component'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { UserService } from '../../services/user.service'
import { Title, Meta } from '@angular/platform-browser'
import { environment } from '../../../environments/environment'
import { PasswordDialogComponent } from './channel/password-dialog/password-dialog.component'
import { ChannelService } from '../../services/channel.service'
import { GroupchatService } from '../../services/groupchat.service'
import { AuthService } from '../../auth/auth.service'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
    selector: 'app-channel-details',
    templateUrl: './channel-details.component.html',
    styleUrls: ['./channel-details.component.scss']
})
export class ChannelDetailsComponent implements OnInit, OnDestroy {
    public dialogRef: MatDialogRef<LoadingDialogComponent>
    @HostListener('window:scroll', ['$event'])
    public isTyping: boolean = false
    public typingUser: any

    groupLists = []
    friendGroup: any
    editgroupDialog: boolean = false
    showMobileChat: boolean = false
    user: any

    constructor(
        public http: HttpClient,
        private authService: AuthService,
        public chatService: ChatService,
        public channelService: ChannelService,
        private router: Router,
        public sharedService: SharedService,
        private socket: Socket,
        public dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
        public friendsService: FriendService,
        public userService: UserService,
        private titleService: Title,
        private metaTagService: Meta,
        private groupchatService: GroupchatService,
        private snackBar: MatSnackBar
    ) {}

    async ngOnInit() {
        try {
            this.user = this.authService.currentUser
            if (this.user) {
                await this.connectToChannel(this.user)
                this.sharedService.wasHomePressed = true
            }
        } catch (err) {
            console.error('err', err)
        }
    }

    connectToChannel(user) {
        this.activatedRoute.params.subscribe(async ({ channelId }) => {
            try {
                var channel = await this.channelService.getChannel({ channelId })
                if (channel.memberCount > 49) {
                    this.router.navigate(['/'])
                    this.snackBar.open(
                        'This channel has reached its 50-user capacity. This limit will be lifted after beta',
                        null,
                        { duration: 5000 }
                    )
                    return
                } else if (
                    channel.password &&
                    channel.user != user._id &&
                    !channel.notificationSubscribers.includes(user._id) &&
                    !this.channelService.hasAccess
                ) {
                    this.router.navigate(['/'])
                    this.showPasswordDialog(channel)
                } else {
                    channel = await this.channelService.enterChannel(channel)
                    this.updateMetaTags(channel)
                    this.socket.emitChannelSubscribeByUser(channelId, user._id)
                    this.channelService.hasAccess = false
                }

                this.socket.listenToRemovedUser(channel._id).subscribe((request) => {
                    if (!user.isAdmin && request.userId == user._id) {
                        this.channelService.leaveChannel(user._id)
                        this.router.navigate(['/'])
                    }
                })

                this.socket.listenToChannelTyping(channel._id).subscribe((data) => {
                    if (data.user && data.user._id != user._id) {
                        this.typingUser = data.user
                        this.isTyping = data.user.isTyping
                    }
                })
            } catch (err) {
                this.router.navigate(['/404'])
            }
        })
    }

    showPasswordDialog(channel) {
        this.dialog.open(PasswordDialogComponent, {
            width: '400px',
            data: {
                channel: channel
            },
            autoFocus: false
        })
    }

    async ngOnDestroy() {
        const { _id } = this.authService.currentUser
        if (this.channelService.currentChannel && this.channelService.currentChannel.user != _id) {
            this.chatService.messages = []
        }
        this.chatService.activeTabs = []
        if (
            this.channelService.currentChannel &&
            this.channelService.currentChannel.user != _id &&
            !this.channelService.currentChannel.notificationSubscribers.includes(_id)
        ) {
            await this.channelService.leaveChannel(_id, true)
        }
    }

    private updateMetaTags(channel) {
        this.titleService.setTitle(channel.title)
        this.metaTagService.updateTag({
            property: 'og:title',
            content: channel.title
        })
        this.metaTagService.updateTag({
            property: 'twitter:title',
            content: channel.title
        })
        this.metaTagService.updateTag({
            name: 'apple-mobile-web-app-title',
            content: channel.title
        })
        this.metaTagService.updateTag({
            property: 'og:url',
            content: `${environment.hostUrl}/channel/${channel._id}`
        })
        if (channel.description) {
            this.metaTagService.updateTag({
                name: 'description',
                content: channel.description
            })
            this.metaTagService.updateTag({
                property: 'og:description',
                content: channel.description
            })
            this.metaTagService.updateTag({
                property: 'twitter:description',
                content: channel.description
            })
        }
        this.metaTagService.addTag({
            name: 'date',
            content: channel.createdAt,
            scheme: 'YYYY-MM-DD'
        })
    }

    toggleMobileChat() {
        this.showMobileChat = !this.showMobileChat
    }

    async groupList() {
        const obj = await this.groupchatService.getGroupList()
        this.groupLists = Object.entries(obj).map(([type, value]) => ({
            type,
            value
        }))
    }

    removeGroup(value) {
        if (value) {
            this.groupList()
        }
    }

    editDialog(group) {
        this.editgroupDialog = true
        this.friendGroup = group
    }
}
