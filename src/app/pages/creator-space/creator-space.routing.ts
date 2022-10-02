import { Routes } from '@angular/router'
import { AuthGuard } from '../../auth/auth-guard.service'
import { CreatorVideosComponent } from './creator-videos/creator-videos.component'
import { CreatorLiveStreamingComponent } from './creator-live-streaming/creator-live-streaming.component'

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: CreatorVideosComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'videos',
                component: CreatorVideosComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'live-streaming',
                component: CreatorLiveStreamingComponent,
                canActivate: [AuthGuard]
            }
        ]
    }
]
