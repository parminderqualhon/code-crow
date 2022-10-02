import { ChatService } from '../../../services/chat.service'
import { UserService } from '../../../services/user.service'
import { Component, OnInit, ViewEncapsulation } from '@angular/core'
import { Util } from '../../../util/util'
import { FriendService } from '../../../services/friend.service'

@Component({
    selector: 'app-community',
    templateUrl: './community.component.html',
    styleUrls: ['./community.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: Util.cardAnimation
})
export class CommunityComponent implements OnInit {
    constructor(
        public friendService: FriendService,
        public userService: UserService,
        public chatService: ChatService
    ) {}

    async ngOnInit() {
        await this.friendService.getAllUsers(true)
        this.friendService.isShowingSearchResults = false
    }
}
