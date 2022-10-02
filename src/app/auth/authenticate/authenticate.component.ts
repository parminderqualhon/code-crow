import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { AuthService } from '../auth.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { PLATFORM_ID, Inject } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'

@Component({
    selector: 'app-authenticate',
    templateUrl: './authenticate.component.html',
    styleUrls: ['./authenticate.component.scss']
})
export class AuthenticateComponent implements OnInit {
    isBrowser: boolean

    constructor(
        private snackBar: MatSnackBar,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
        @Inject(PLATFORM_ID) platformId: string
    ) {
        this.isBrowser = isPlatformBrowser(platformId)
    }

    async ngOnInit() {
        if (this.isBrowser) {
            const jwtToken = this.route.snapshot.queryParamMap.get('token')
            const userId = this.route.snapshot.queryParamMap.get('userId')
            if (jwtToken) this.authService.setJWT(jwtToken)
            if (userId) this.authService.setUserId(userId)
            const user = await this.authService.me()
            if (user) {
                if (user.status == 401 || user.status == 500) {
                    await this.authService.logout()
                } else if (user.isBanned) {
                    this.snackBar.open(
                        'Your account is banned. Please contact support if you have any questions',
                        null,
                        { duration: 10000 }
                    )
                    await this.authService.logout()
                } else {
                    this.router.navigate(['/'])
                }
            } else {
                await this.router.navigate(['/'])
            }
        }
    }
}
