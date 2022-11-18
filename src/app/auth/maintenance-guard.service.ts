import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { TokenStorage } from './token.storage'
import { AdminService } from '../services/admin.service'
import { AuthService } from './auth.service'
import { FirebaseService } from '../services/firebase.service'

@Injectable()
export class MaintenanceGuard implements CanActivate {
    constructor(
        public router: Router,
        public tokenStorage: TokenStorage,
        public adminService: AdminService,
        private authService: AuthService,
        private firebaseService: FirebaseService
    ) {}

    async canActivate() {
        const isAuthenticated = await this.tokenStorage.getAuthenticatedStatus()
        if (isAuthenticated) {
            try {
                if (this.firebaseService.isMaintenanceModeEnabled) {
                    const user = this.authService.currentUser
                    if (!user.isAdmin) {
                        this.router.navigate(['/maintenance'])
                        return false
                    } else {
                        return true
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }
        return true
    }
}
