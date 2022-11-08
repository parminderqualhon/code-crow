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
import { WaitingRoomDialogComponent } from './channel/waiting-room-dialog/waiting-room-dialog.component'
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
                this.connectToChannel()
                this.sharedService.wasHomePressed = true
            }
        } catch (err) {
            console.error('err', err)
        }
    }

    connectToChannel() {
        this.activatedRoute.params.subscribe(async ({ channelId }) => {
            try {
                var channel = await this.channelService.getChannel({ channelId })
                if (
                    channel.isPrivate &&
                    channel.user != this.user._id &&
                    !channel?.notificationSubscribers?.includes(this.user._id)
                ) {
                    this.router.navigate(['/'])
                    this.showWaitingRoomDialog(channel)
                } else {
                    const channelsocket = await this.socket.setupChannelSocketConnection(channelId)
                    await this.socket.setupWebsocketConnection(channelsocket, true)
                    if(this.socket.channelSocket.readyState===1){
                        console.log('ready state')
                    }
                    this.socket.emitChannelSubscribeByUser(channelId, this.user._id)
                    channel = await this.channelService.enterChannel(channel)
                    this.updateMetaTags(channel)
                }

                this.socket.listenToRemovedUser(channelId).subscribe((request) => {
                    if (!this.user.isAdmin && request.userId == this.user._id) {
                        this.channelService.leaveChannel(this.user._id)
                        this.router.navigate(['/'])
                    }
                })

                this.socket.listenToChannelTyping().subscribe((data) => {
                    if (data.userData && data.userData.id != this.user._id) {
                        console.log("typing")
                        this.typingUser = data.userData
                        this.isTyping = data.isTyping
                    }
                })
            } catch (err) {
                console.log(err)
                this.router.navigate(['/404'])
            }
        })
    }

    showWaitingRoomDialog(channel) {
        this.dialog.open(WaitingRoomDialogComponent, {
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
            !this.channelService.currentChannel?.notificationSubscribers?.includes(_id)
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
