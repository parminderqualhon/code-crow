import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { UserSettingsRoutingModule } from './user-settings-routing.module'
import { SharedModule } from '../../../shared/shared.module'
import { UserSettingsComponent } from './user-settings.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@NgModule({
    declarations: [UserSettingsComponent],
    imports: [
        CommonModule,
        UserSettingsRoutingModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class UserSettingsModule {}
