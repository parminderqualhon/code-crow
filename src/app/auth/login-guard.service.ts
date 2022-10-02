import { UserService } from './../services/user.service'
import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { AuthService } from './auth.service'
import { TokenStorage } from './token.storage'

@Injectable()
export class LoginGuard implements CanActivate {
    constructor(
        public router: Router,
        private userService: UserService,
        private authService: AuthService,
        private tokenStorage: TokenStorage
    ) {}

    async canActivate() {
        const user = this.tokenStorage.getAuthenticatedStatus()
        if (!user) return true

        // logged in so redirect to home page with the return url
        this.router.navigate(['/'])
        return false
    }
}
