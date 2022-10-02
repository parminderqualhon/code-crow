import { Component, Input, OnInit } from '@angular/core'
import { FollowService } from '../../../services/follow.service'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
    selector: 'app-follow-panel',
    templateUrl: './follow-panel.component.html',
    styleUrls: ['./follow-panel.component.scss']
})
export class FollowPanelComponent implements OnInit {
    @Input() user: any
    @Input() isFollower: any
    public searchQuery: string = ''
    public followCount: number = 0
    public follows: any = []
    public skip: number
    public limit: number

    constructor(public followService: FollowService, private snackBar: MatSnackBar) {}

    async ngOnInit() {
        this.follows = []
        await this.getFollows(true)
        this.followCount = await this.followService.getFollowCount({
            source: this.user._id,
            sourceType: this.isFollower ? 'source1' : 'source2'
        })
    }

    async getFollows(isRefresh = false) {
        if (isRefresh) {
            this.resetSkipLimit()
        }
        const follows = await this.followService.getFollows({
            source: this.user._id,
            sourceType: this.isFollower ? 'source1' : 'source2',
            searchQuery: this.searchQuery,
            skip: this.skip,
            limit: this.limit
        })
        if (follows.length) {
            // let sourceIds = this.isFollower ? follows.map(follow => follow.source2) : follows.map(follow => follow.source1)
            // const users = await this.userService.getUsersByIds(sourceIds)
            this.skip += this.limit
            this.follows.push(...follows)
        } else {
            if (this.searchQuery && !this.skip)
                this.snackBar.open('No results with the search criteria', null, {
                    duration: 2000
                })
        }
    }

    async searchFollows() {
        this.follows = []
        await this.getFollows(true)
    }

    resetSkipLimit() {
        this.skip = 0
        this.limit = 50
    }

    async onScroll(e) {
        var { scrollHeight, scrollTop, clientHeight } = e.srcElement
        if (scrollHeight - clientHeight <= scrollTop) {
            await this.getFollows()
            scrollTop = e.srcElement.scrollHeight
        }
    }
}
