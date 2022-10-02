import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-settings-side-nav',
    templateUrl: './side-nav.component.html',
    styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {
    navLinks: any = []
    constructor() {}

    ngOnInit() {
        this.navLinks = [
            {
                label: 'User Settings',
                iconClass: 'user-settings',
                path: '/settings/user'
            },
            {
                label: 'Payment Methods',
                iconClass: 'payments-method',
                path: '/settings/payment-methods'
            }
        ]
    }
}
