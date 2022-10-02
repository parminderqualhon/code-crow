import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core'
import { ChatService } from '../../../../services/chat.service'
import { ChannelService } from '../../../../services/channel.service'
import { UserService } from '../../../../services/user.service'
import { MatMenu, MatMenuTrigger } from '@angular/material/menu'
import { FollowService } from '../../../../services/follow.service'

@Component({
    selector: 'app-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
    @ViewChild('emojiMenuTrigger') emojiMenuTrigger: MatMenuTrigger
    @ViewChild('reactionUserTrigger') reactionUserTrigger: MatMenuTrigger
    @Input() Sender: string
    @Input() SenderId: string
    @Input() When: string
    @Input() Content: string
    @Input() Avatar: string
    @Input() UserId: string
    @Input() Message: any
    @Input() oneVone: boolean
    @Input() Image: string
    @Input() File: string
    @Input() MimeType: string
    @Input() FileName: string
    @Input() CurrentUser: any
    @Input() Reactions: any[] = []
    @Input() reactionUserMenu: MatMenu
    @Input() emojiMenu: MatMenu

    public isHover: boolean = false
    public showEmojiPicker: boolean = false

    public isMyMessage: boolean
    public isOwnerMessage: boolean
    public isBlocked: boolean
    public openReacted: any
    public follow: any
    public otherUser: any

    constructor(
        public chatService: ChatService,
        public channelService: ChannelService,
        private followService: FollowService,
        private userService: UserService
    ) {}

    async ngOnInit() {
        try {
            if (!this.oneVone) {
                this.isMyMessage = !!(this.UserId == this.SenderId)
                this.isOwnerMessage = !!(this.channelService.currentChannel.user == this.SenderId)
                if (!this.isMyMessage) {
                    this.isBlocked = this.channelService.isUserBlockedFromChannel(this.SenderId)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    async moreMenuOpened() {
        this.otherUser = await this.userService.getUserById(this.SenderId)
        this.follow = await this.followService.getFollowRelationship({
            source: this.SenderId
        })
    }
}
