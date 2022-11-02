import { ChannelService } from '../../../../services/channel.service'
import { Component, OnInit } from '@angular/core'
import { MatDialogRef } from '@angular/material/dialog'
import { UserService } from '../../../../services/user.service'
import { AuthService } from '../../../../auth/auth.service'
import { StreamingService } from '../../../../services/streaming.service'
import { FollowService } from '../../../../services/follow.service'

@Component({
    selector: 'app-channel-settings',
    templateUrl: './channel-settings.component.html',
    styleUrls: ['./channel-settings.component.scss']
})
export class ChannelSettingsComponent implements OnInit {
    public searchTitle: string
    public members: any = []
    public blockedMembers: any = []
    public isLoadingMembers: boolean = true
    public isLoadingBlockedMembers: boolean = true
    public user: any
    public follow: any
    public isBlocked: boolean
    private skip: any
    private limit: any

    constructor(
        private dialogRef: MatDialogRef<ChannelSettingsComponent>,
        public channelService: ChannelService,
        private userService: UserService,
        private authService: AuthService,
        private streamingService: StreamingService,
        private followService: FollowService
    ) {}

    async ngOnInit() {
        try {
            this.resetSkipLimit()
            this.user = this.authService.currentUser
            this.channelService.currentChannel = await this.channelService.getChannel({
                channelId: this.channelService.currentChannel._id
            })
            this.members = await this.streamingService.getMembers({
                channelId: this.channelService.currentChannel._id,
                isParticipant: false,
                skip: this.skip,
                limit: this.limit
            })
            if (this.channelService.currentChannel.blockedUsers.length) {
                this.blockedMembers = await this.userService.getUsersByIds(
                    this.channelService.currentChannel.blockedUsers
                )
            }

            this.isLoadingMembers = false
            this.isLoadingBlockedMembers = false
        } catch (err) {
            console.log(err)
            this.dialogRef.close()
        }
    }

    resetSkipLimit() {
        this.skip = 0
        this.limit = 100
    }

    async moreMenuOpened(memberId) {
        this.follow = await this.followService.getFollowRelationship({
            source: memberId
        })
        this.isBlocked = this.channelService.isUserBlockedFromChannel(memberId)
    }

    async onScroll(e) {
        var { scrollHeight, scrollTop, clientHeight } = e.srcElement
        if (scrollHeight - clientHeight <= scrollTop) {
            const members = await this.streamingService.getMembers({
                channelId: this.channelService.currentChannel._id,
                isParticipant: false,
                skip: this.skip,
                limit: this.limit
            })
            if (members.length) {
                this.skip += this.limit
                this.members.push(...members)
            }
            scrollTop = e.srcElement.scrollHeight
        }
    }
}
