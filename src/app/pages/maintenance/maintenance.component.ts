import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-maintenance',
    templateUrl: './maintenance.component.html',
    styleUrls: ['./maintenance.component.scss']
})
export class MaintenanceComponent implements OnInit {
    public maintenanceMessage: string

    constructor() {}

    async ngOnInit() {
        this.maintenanceMessage = 'We are performing maintenance on the app. We will be back up shortly. We appreciate your patience!'
    }
}
