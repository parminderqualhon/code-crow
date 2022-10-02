import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { TokenStorage } from '../../auth/token.storage'

@Component({
    selector: 'app-login-wrapper',
    templateUrl: './login-wrapper.component.html',
    styleUrls: ['./login-wrapper.component.scss']
})
export class LoginWrapperComponent implements OnInit {
    public isAuthenticated: boolean = false

    constructor(private tokenStorage: TokenStorage, private router: Router) {}

    async ngOnInit() {
        this.isAuthenticated = await this.tokenStorage.getAuthenticatedStatus()
        if (this.isAuthenticated) {
            this.router.navigate(['/'])
        }
    }
}
