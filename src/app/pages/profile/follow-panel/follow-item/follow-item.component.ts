import { FollowService } from '../../../../services/follow.service'
import { Component, Input, OnInit } from '@angular/core'
import { AuthService } from '../../../../auth/auth.service'
import { Router } from '@angular/router'
import { ChatService } from '../../../../services/chat.service'

@Component({
    selector: 'app-follow-item',
    templateUrl: './follow-item.component.html',
    styleUrls: ['./follow-item.component.scss']
})
export class FollowItemComponent implements OnInit {
    @Input() follow: any
    public isCurrentUser: boolean = false

    constructor(
        private followService: FollowService,
        public authService: AuthService,
        public chatService: ChatService,
        private router: Router
    ) {}

    ngOnInit() {
        this.isCurrentUser = this.follow._id == this.authService.currentUser._id
        this.router.routeReuseStrategy.shouldReuseRoute = () => false
    }

    async openChat() {
        await this.chatService.createChat({
            source1: this.authService.currentUser._id,
            source2: this.follow._id,
            user: this.follow
        })
    }
}
