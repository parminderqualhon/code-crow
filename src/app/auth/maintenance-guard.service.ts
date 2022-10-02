import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { TokenStorage } from './token.storage'
import { AdminService } from '../services/admin.service'
import { AuthService } from './auth.service'

@Injectable()
export class MaintenanceGuard implements CanActivate {
    public isMaintenanceModeEnabled = false

    constructor(
        public router: Router,
        public tokenStorage: TokenStorage,
        public adminService: AdminService,
        private authService: AuthService
    ) {}

    async canActivate() {
        const isAuthenticated = await this.tokenStorage.getAuthenticatedStatus()
        if (isAuthenticated) {
            try {
                const maintenance = await this.adminService.getMaintenanceMode()
                if (maintenance && maintenance.isEnabled) {
                    const user = this.authService.currentUser
                    if (!user.isAdmin) {
                        this.router.navigate(['/maintenance'])
                        return false
                    } else {
                        this.isMaintenanceModeEnabled = true
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
