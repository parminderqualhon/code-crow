import { ChatService } from './../../services/chat.service'
import { UserService } from './../../services/user.service'
import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core'
import { GroupchatService } from '../../services/groupchat.service'
import { ChannelService } from '../../services/channel.service'
import { Util } from '../../util/util'
import { FriendService } from '../../services/friend.service'

@Component({
    selector: 'app-friends',
    templateUrl: './friends.component.html',
    styleUrls: ['./friends.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: Util.cardAnimation
})
export class FriendsComponent implements OnInit {
    @Output() groups = new EventEmitter<any>()
    @Output() createGroupEvent = new EventEmitter<boolean>()
    public groupChats: any = []

    constructor(
        public friendService: FriendService,
        public userService: UserService,
        private groupChatService: GroupchatService,
        private channelService: ChannelService,
        public chatService: ChatService
    ) {}

    async ngOnInit() {
        await this.chatService.getChats(true)
        this.friendService.isShowingSearchResults = false
        // this.groupList()
        // if (this.sharedService.subsVar == undefined) {
        //     this.sharedService.subsVar =
        //         this.sharedService.refreshGroupListEvent.subscribe(
        //             (name: string) => {
        //                 this.groupList()
        //             }
        //         )
        // }
    }

    removeGroup(group) {
        this.groupList()
    }

    showCreateGroupDialog() {
        this.channelService.isCreateGroupEnabled = true
    }

    async groupList() {
        this.groupChats = await this.groupChatService.getGroupList()
        this.groupChats.forEach((group) => {
            group.avatarList = [group.host, ...group.members].map((m) => m.avatar)
        })
    }
}
