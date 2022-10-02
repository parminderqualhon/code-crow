import { Component, Inject, PLATFORM_ID } from '@angular/core'
import { TokenStorage } from '../auth/token.storage'
import { AuthService } from '../auth/auth.service'
import { Router } from '@angular/router'
import { isPlatformBrowser } from '@angular/common'

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent {
    public isAuthenticated: boolean = false

    constructor(
        public authService: AuthService,
        private tokenStorage: TokenStorage,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId
    ) {
        if (isPlatformBrowser(this.platformId)) {
            if (!this.tokenStorage.getAuthenticatedStatus()) {
                this.router.navigateByUrl('/login')
            }
        }
    }

    // async ngOnInit() {
    // this.isAuthenticated = await this.tokenStorage.getAuthenticatedStatus();
    // }
}
