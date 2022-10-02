import { FriendService } from '../../services/friend.service'
import { ChannelService } from '../../services/channel.service'
import { Component, EventEmitter, Output } from '@angular/core'
import { Util } from '../../util/util'
import { UserService } from '../../services/user.service'

@Component({
    selector: 'app-community-dialog',
    templateUrl: './community-dialog.component.html',
    styleUrls: ['./community-dialog.component.scss'],
    animations: Util.reverseInOutAnimation
})
export class CommunityDialogComponent {
    @Output() closeDialog = new EventEmitter()
    clickedOutsideCount: any = 0

    constructor(
        public channelService: ChannelService,
        public friendService: FriendService,
        public userService: UserService
    ) {}

    incrementClickOutsideCount() {
        ++this.clickedOutsideCount
        if (this.clickedOutsideCount > 0) {
            this.onNoClick()
            this.clickedOutsideCount = 0
        }
    }

    onNoClick() {
        this.closeDialog.emit()
        this.userService.isUsersEnabled = false
    }

    async onScrollUsers(e) {
        var { scrollHeight, scrollTop, clientHeight } = e.srcElement
        if (scrollHeight - clientHeight <= scrollTop) {
            await this.friendService.getAllUsers(false)
            scrollTop = e.srcElement.scrollHeight
        }
    }
}
