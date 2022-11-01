import { ChatService } from '../../../services/chat.service'
import { UserService } from '../../../services/user.service'
import { AuthService } from '../../../auth/auth.service'
import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core'
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
    public userId: string = this.authService.currentUser._id
    constructor(
        public friendService: FriendService,
        public userService: UserService,
        public chatService: ChatService,
        public authService: AuthService

    ) {}

    async ngOnInit() {
        await this.friendService.getAllUsers(true)
        this.friendService.isShowingSearchResults = false
    }
}
