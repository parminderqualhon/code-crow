import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { routes } from './creator-space.routing'
import { SharedModule } from '../../shared/shared.module'
import { CreatorSpaceComponent } from './creator-space.component'
import { CreatorVideosComponent } from './creator-videos/creator-videos.component'
import { CreatorSidenavComponent } from './creator-sidenav/creator-sidenav.component'
import { CreatorLiveStreamingComponent } from './creator-live-streaming/creator-live-streaming.component'
import { CreatorVideosInsightsComponent } from './creator-videos/creator-videos-insights/creator-videos-insights.component'
import { CreatorVideosStatisticsComponent } from './creator-videos/creator-videos-statistics/creator-videos-statistics.component'
import { CreatorVideosTableComponent } from './creator-videos/creator-videos-table/creator-videos-table.component'
import { CreatorVideosViewersComponent } from './creator-videos/creator-videos-viewers/creator-videos-viewers.component'

@NgModule({
    declarations: [
        CreatorSpaceComponent,
        CreatorVideosComponent,
        CreatorSidenavComponent,
        CreatorLiveStreamingComponent,
        CreatorVideosInsightsComponent,
        CreatorVideosStatisticsComponent,
        CreatorVideosTableComponent,
        CreatorVideosViewersComponent
    ],
    imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
    bootstrap: [CreatorSpaceComponent]
})
export class CreatorSpaceModule {}
