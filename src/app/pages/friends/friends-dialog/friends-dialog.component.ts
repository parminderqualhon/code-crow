import { FriendService } from '../../../services/friend.service'
import { ChatService } from '../../../services/chat.service'
import { Component, EventEmitter, Output } from '@angular/core'
import { Util } from '../../../util/util'

@Component({
    selector: 'app-friends-dialog',
    templateUrl: './friends-dialog.component.html',
    styleUrls: ['./friends-dialog.component.scss'],
    animations: Util.reverseInOutAnimation
})
export class FriendsDialogComponent {
    @Output() closeDialog = new EventEmitter()
    clickedOutsideCount: any = 0

    constructor(public chatService: ChatService, public friendService: FriendService) {}

    incrementClickOutsideCount() {
        ++this.clickedOutsideCount
        if (this.clickedOutsideCount > 0) {
            this.onNoClick()
            this.clickedOutsideCount = 0
        }
    }

    onNoClick() {
        this.closeDialog.emit()
        this.chatService.isChatsEnabled = false
    }

    async onScrollUsers(e) {
        var { scrollHeight, scrollTop, clientHeight } = e.srcElement
        if (scrollHeight - clientHeight <= scrollTop) {
            await this.friendService.getAllUsers(false)
            scrollTop = e.srcElement.scrollHeight
        }
    }
}
