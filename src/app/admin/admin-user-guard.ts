import { Injectable } from '@angular/core'
import { CanActivate, Router } from '@angular/router'
import { AdminService } from '../services/admin.service'

@Injectable()
export class OnlyAdminUsersGuard implements CanActivate {
    constructor(private router: Router, private adminService: AdminService) {}

    async canActivate() {
        const userRole = await this.adminService.getUserRole()
        if (userRole) return true

        // not admin so redirect to 404 page with the return url
        this.router.navigate(['/404'])
        return false
    }
}
