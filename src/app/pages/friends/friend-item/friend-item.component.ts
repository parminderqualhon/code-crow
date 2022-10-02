import { Component, Input, OnInit, Output } from '@angular/core'
import { EventEmitter } from '@angular/core'
import { UserService } from '../../../services/user.service'
import { AuthService } from '../../../auth/auth.service'
import { ChatService } from '../../../services/chat.service'

@Component({
    selector: 'app-friend-item',
    templateUrl: './friend-item.component.html',
    styleUrls: ['./friend-item.component.scss']
})
export class FriendItemComponent implements OnInit {
    @Input() chat: any
    @Input() friendGroup: any
    @Input() isGroupItem: boolean
    @Input() isHost: boolean
    @Input() isChat: boolean
    @Output() leaveGroup = new EventEmitter<any>()
    public isMessageable: boolean

    constructor(public chatService: ChatService, public authService: AuthService, public userService: UserService) {}

    ngOnInit() {
        this.isMessageable = this.chat.isMessageGuardEnabled ? this.chat.isFollower : true
    }

    leave(deleteGroup: any) {
        this.leaveGroup.emit(deleteGroup)
    }

    noOp() {}
}
