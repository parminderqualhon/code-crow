import { TokenStorage } from './token.storage'
import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'

@Injectable({
    providedIn: 'root'
})
export class LoginRouteGuard implements CanActivate {
    constructor(public router: Router, private tokenStorage: TokenStorage) {}

    canActivate() {
        const user = this.tokenStorage.getAuthenticatedStatus()
        if (user) {
            console.log('return : false')
            return false
        }
        console.log('return : true')
        return true
    }
}
