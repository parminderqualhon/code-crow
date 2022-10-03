import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core'
import { FriendService } from '../../../services/friend.service'
import { FriendItemComponent } from '../friend-item/friend-item.component'
import { ChatService } from '../../../services/chat.service'
import { ChannelService } from '../../../services/channel.service'
import { GroupchatService } from '../../../services/groupchat.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Util } from '../../../util/util'
import { AuthService } from '../../../auth/auth.service'
import { SharedService } from '../../../services/shared.service'

@Component({
    selector: 'app-create-group',
    templateUrl: './create-group.component.html',
    styleUrls: ['./create-group.component.scss'],
    animations: Util.inOutAnimation
})
export class CreateGroupComponent implements OnInit {
    @Output() closeGroupEvent = new EventEmitter<boolean>()
    @Output() groupDetails = new EventEmitter<any>()

    @ViewChild(FriendItemComponent, { static: true })
    child: FriendItemComponent
    searchTerm
    friends: any = []
    friendsDropdownVisible: boolean = false
    groupTitle: string = ''
    selectedMembers = []
    error: any = {}
    clickedOutsideCount: any = 0

    constructor(
        public friendService: FriendService,
        public chatService: ChatService,
        public channelService: ChannelService,
        private groupChatService: GroupchatService,
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private sharedService: SharedService
    ) {}

    async ngOnInit() {
        await this.friendService.getFriendList()
        this.friends = [...this.friendService.friendsList]
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
        this.channelService.isCreateGroupEnabled = false
    }

    async createGroup() {
        if (!this.groupTitle.length) this.error.groupTitle = 'Please enter group title'
        else this.error.groupTitle = false
        if (!this.selectedMembers.length) this.error.members = 'Please select members'
        else this.error.members = false
        if (!this.groupTitle.length || !this.selectedMembers.length) return
        const user = this.authService.currentUser
        let members = this.selectedMembers.map((m) => m._id)
        try {
            const channel = await this.channelService.createChannel(
                this.groupTitle,
                'This is group chat channel',
                null,
                [],
                [],
                true,
                user,
                true
            )

            if (channel) {
                try {
                    const myGroup = await this.groupChatService.createGroup(
                        user,
                        members,
                        this.groupTitle,
                        channel._id
                    )
                    if (myGroup) {
                        myGroup['avatarList'] = [myGroup['host'], ...myGroup['members']].map(
                            (m) => m.avatar
                        )
                        this.chatService.activateGroupTab(myGroup)
                        this.groupDetails.emit(myGroup)
                        this.closeGroupEvent.emit(false)
                        this.sharedService.refreshGroupList()
                        setTimeout(async () => await this.channelService.getInitialChannels(), 100)
                        this.snackBar.open('Group and Channel Created Successfully', null, {
                            duration: 2000
                        })
                        this.onNoClick()
                    }
                } catch (err) {
                    this.snackBar.open('Error occured', null, {
                        duration: 2000
                    })
                }
            }
        } catch (err) {
            this.snackBar.open('Error occured', null, {
                duration: 2000
            })
            console.log('create channel error', err)
        }
    }

    search() {
        if (!this.searchTerm.length) {
            return (this.friends = [...this.friendService.friendsList])
        }
        return (this.friends = this.friendService.friendsList.filter((friend) => {
            return (
                friend.user.customUsername.toLowerCase().indexOf(this.searchTerm.toLowerCase()) >=
                    0 && !this.selectedMembers.find((e) => e._id === friend.user._id)
            )
        }))
    }

    addMember(item: any, event) {
        event.preventDefault()
        event.stopPropagation()
        this.friendsDropdownVisible = false
        if (this.selectedMembers.find((e) => e._id === item.user._id)) return false
        this.selectedMembers.push({
            _id: item.user._id,
            customUsername: item.user.customUsername,
            avatar: item.user.avatar
        })
        this.friends.splice(this.friends.indexOf(item), 1)
    }

    removeMember(item) {
        let index = this.selectedMembers.indexOf(item)
        this.selectedMembers.splice(index, 1)
        let friend = this.friendService.friendsList.find((fr) => fr.user._id === item._id)
        if (friend) this.friends.push(friend)
    }
}
