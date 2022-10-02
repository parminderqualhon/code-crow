import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-creator-sidenav',
    templateUrl: './creator-sidenav.component.html',
    styleUrls: ['./creator-sidenav.component.scss']
})
export class CreatorSidenavComponent implements OnInit {
    navLinks: any = []
    constructor() {}

    ngOnInit() {
        this.navLinks = [
            {
                label: 'Videos',
                iconClass: 'creator-videos',
                path: '/creator-space/videos'
            },
            {
                label: 'Live Streaming',
                iconClass: 'live-streaming',
                path: '/creator-space/live-streaming'
            }
        ]
    }
}
