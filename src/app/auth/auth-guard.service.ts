import { TokenStorage } from './token.storage'
import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { AuthService } from './auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        public router: Router,
        private authService: AuthService,
        private tokenStorage: TokenStorage
    ) {}

    async canActivate() {
        const user = this.tokenStorage.getAuthenticatedStatus()
        if (user) {
            await this.authService.me()
            return true
        }

        console.log("not logged in so redirect to login page with the return url")

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/'])
        return false
    }
}
