import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { routes } from './admin-routing'
import { AdminComponent } from './admin.component'
import { OnlyAdminUsersGuard } from './admin-user-guard'
import { SidebarComponent } from './sidebar/sidebar.component'
import { SharedModule } from '../shared/shared.module'
import { UsersComponent } from './users/users.component'
import { ChannelsComponent } from './channels/channels.component'
import { LiveStreamingComponent } from './live-streaming/live-streaming.component'
import { VideosComponent } from './videos/videos.component'
import { AdminVideoInsightsComponent } from './videos/admin-video-insights/admin-video-insights.component'
import { AdminVideoStatisticsComponent } from './videos/admin-video-statistics/admin-video-statistics.component'
import { AdminVideoTableComponent } from './videos/admin-video-table/admin-video-table.component'
import { SiteSettingsComponent } from './site-settings/site-settings.component'
import { MaintenanceSettingsComponent } from './site-settings/maintenance-settings/maintenance-settings.component'
import { AdminsComponent } from './admins/admins.component'
import { AddAdminComponent } from './admins/add-admin/add-admin.component'
import { PoliciesComponent } from './policies/policies.component'
import { DragDropDirective } from '../directives/drag-drop.directive'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { HintsComponent } from './hints/hints.component'
import { AddHintComponent } from './hints/add-hint/add-hint.component'

@NgModule({
    declarations: [
        AdminComponent,
        SidebarComponent,
        UsersComponent,
        ChannelsComponent,
        LiveStreamingComponent,
        HintsComponent,
        AddHintComponent,
        VideosComponent,
        AdminVideoInsightsComponent,
        AdminVideoStatisticsComponent,
        AdminVideoTableComponent,
        SiteSettingsComponent,
        MaintenanceSettingsComponent,
        AdminsComponent,
        AddAdminComponent,
        PoliciesComponent,
        DragDropDirective
    ],
    imports: [CommonModule, RouterModule.forChild(routes), SharedModule, MatSnackBarModule],
    providers: [OnlyAdminUsersGuard],
    bootstrap: [AdminComponent]
})
export class AdminModule {}
