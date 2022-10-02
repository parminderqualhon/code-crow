import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MaintenanceRoutingModule } from './maintenance-routing.module'
import { MatIconModule } from '@angular/material/icon'
import { MaintenanceComponent } from './maintenance.component'

@NgModule({
    declarations: [MaintenanceComponent],
    imports: [CommonModule, MaintenanceRoutingModule, MatIconModule]
})
export class MaintenanceModule {}
