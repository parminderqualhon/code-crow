import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { UserService } from '../../../services/user.service'
import { FriendService } from '../../../services/friend.service'
import { GroupchatService } from '../../../services/groupchat.service'
import { ChannelService } from '../../../services/channel.service'
import { ChatService } from '../../../services/chat.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Util } from '../../../util/util'
import { AuthService } from '../../../auth/auth.service'
import { SharedService } from '../../../services/shared.service'
@Component({
    selector: 'app-edit-group',
    templateUrl: './edit-group.component.html',
    styleUrls: ['../create-group/create-group.component.scss'],
    animations: Util.inOutAnimation
})
export class EditGroupComponent implements OnInit {
    @Input() friendGroup: any
    @Output() editGroupEvent = new EventEmitter<boolean>()
    @Output() closeGroupEvent = new EventEmitter<boolean>()

    groupName: string
    selectedMembers = []
    friendList = []
    groupTitle: string = ''
    searchTitle: string = ''
    friends: any = []
    friendsDropdownVisible: boolean = false
    error: any = {}
    isHost: boolean = false
    currentUser: any = null
    clickedOutsideCount: any = 0

    constructor(
        public friendService: FriendService,
        public userService: UserService,
        public groupChatService: GroupchatService,
        public channelService: ChannelService,
        public chatService: ChatService,
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private sharedService: SharedService
    ) {}

    async ngOnInit() {
        this.friendGroup = this.channelService.isEditGroupEnabled
        await this.friendService.getFriendList()
        this.friends = this.friendService.friendsList.map((friend) => ({
            _id: friend.user._id,
            avatar: friend.user.avatar,
            customUsername: friend.user.customUsername
        }))
        this.currentUser = this.friendGroup.members.find(
            (member) => this.authService.currentUser._id === member._id
        )
        this.selectedMembers = this.friendGroup.members.filter(
            (member) => this.authService.currentUser._id !== member._id
        )
        this.friends = this.friends.filter(
            (friend) => !this.selectedMembers.find((e) => e._id === friend._id)
        )
        this.groupTitle = this.friendGroup.groupName
        this.isHost = this.authService.currentUser._id === this.friendGroup.host._id
        if (!this.isHost) this.selectedMembers.push(this.friendGroup.host)
    }

    incrementClickOutsideCount() {
        ++this.clickedOutsideCount
        if (this.clickedOutsideCount > 0) {
            this.onNoClick()
            this.clickedOutsideCount = 0
        }
    }

    onNoClick() {
        this.closeGroupEvent.emit(false)
        this.channelService.isEditGroupEnabled = false
    }

    search() {
        if (!this.isHost) {
            if (!this.searchTitle.length) {
                return (this.selectedMembers = [
                    this.friendGroup.host,
                    ...this.friendGroup.members
                ].filter((member) => this.authService.currentUser._id !== member._id))
            }
            return (this.selectedMembers = [
                this.friendGroup.host,
                ...this.friendGroup.members
            ].filter(
                (member) =>
                    member.customUsername.toLowerCase().indexOf(this.searchTitle.toLowerCase()) >=
                        0 && this.authService.currentUser._id !== member._id
            ))
        } else {
            if (!this.searchTitle.length) {
                this.friends = this.friendService.friendsList
                    .map((friend) => ({
                        _id: friend.user._id,
                        avatar: friend.user.avatar,
                        customUsername: friend.user.customUsername
                    }))
                    .filter((friend) => !this.selectedMembers.find((e) => e._id === friend._id))
                return
            }
            return (this.friends = this.friendService.friendsList
                .map((friend) => ({
                    _id: friend.user._id,
                    avatar: friend.user.avatar,
                    customUsername: friend.user.customUsername
                }))
                .filter(
                    (friend) =>
                        friend.customUsername
                            .toLowerCase()
                            .indexOf(this.searchTitle.toLowerCase()) >= 0 &&
                        !this.selectedMembers.find((e) => e._id === friend._id)
                ))
        }
    }

    addMember(item: any, event) {
        if (!this.isHost) return
        event.preventDefault()
        event.stopPropagation()
        this.selectedMembers.push(item)
        let index = this.friends.indexOf(item)
        this.friends.splice(index, 1)
    }

    removeMember(item) {
        if (!this.isHost) return
        let index = this.selectedMembers.indexOf(item)
        this.selectedMembers.splice(index, 1)
        this.friends.push(item)
    }

    async updateGroup() {
        if (!this.groupTitle.length) this.error.groupTitle = 'Please enter group title'
        else this.error.groupTitle = false
        if (!this.selectedMembers.length) this.error.members = 'Please select members'
        else this.error.members = false
        if (!this.groupTitle.length || !this.selectedMembers.length) return
        let members = this.selectedMembers.map((m) => m._id)
        if (this.currentUser) members.push(this.currentUser._id)
        let group = await this.groupChatService.updateGroup(
            this.friendGroup.groupId,
            members,
            this.groupTitle
        )
        if (group) {
            // let channel = await this.channelService.updateChannelTitle(this.groupTitle, this.friendGroup.channelId)
            // if (channel) {
            this.chatService.activeTabs.forEach((item) => {
                if (item.groupId === this.friendGroup.groupId) {
                    item.groupName = this.groupTitle
                    item.members = group['members']
                    item.host = group['host']
                    item.avatarList = [group['host'], ...group['members']].map((m) => m.avatar)
                }
            })
            this.sharedService.refreshGroupListEvent.emit()
            // setTimeout(async () => await this.channelService.getInitialChannels(), 100)
            this.snackBar.open('Group updated successfully', null, {
                duration: 2000
            })
        }
        this.closeGroupEvent.emit(false)
    }
}
