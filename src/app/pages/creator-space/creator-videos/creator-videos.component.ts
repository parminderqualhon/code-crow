import { Component, OnDestroy, OnInit } from '@angular/core'
import { CreatorSpaceService } from '../creator-space.service'
import { SharedService } from '../../../services/shared.service'
import { UserService } from '../../../services/user.service'
import { AuthService } from '../../../auth/auth.service'
import { Subscription } from 'rxjs'

@Component({
    selector: 'app-creator-videos',
    templateUrl: './creator-videos.component.html',
    styleUrls: ['./creator-videos.component.scss']
})
export class CreatorVideosComponent implements OnInit, OnDestroy {
    lazyLoadTableComponentSubscription = new Subscription()

    constructor(
        private api: CreatorSpaceService,
        public sharedService: SharedService,
        public userService: UserService,
        private authService: AuthService
    ) {}

    public videos: any

    async ngOnInit() {
        try {
            const user: any = this.authService.currentUser
            const { _id } = user
            this.videos = await this.api.getUserVideos(_id)
        } catch (e) {
            console.log(e)
        }
    }

    ngOnDestroy(): void {
        this.lazyLoadTableComponentSubscription.unsubscribe()
    }
}
