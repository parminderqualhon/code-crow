import { AfterViewInit, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { SharedService } from '../../services/shared.service'
import { LoginContentComponent } from './login-content/login-content.component'
import { ThemeService } from '../../services/theme.service'
import { isPlatformServer } from '@angular/common'
import { TokenStorage } from '../token.storage'
import { Router } from '@angular/router'

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    isServer = isPlatformServer(this.platformId)
    isAuthenticated: boolean = false

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        public sharedService: SharedService,
        private dialog: MatDialog,
        private themeService: ThemeService
    ) {
        this.isServer = isPlatformServer(this.platformId)
    }

    ngOnInit() {
        setTimeout(() => {
            this.themeService.setTheme('theme-dark')
            this.sharedService.isLoginPage = true
        })
    }

    ngOnDestroy() {
        this.sharedService.isLoginPage = false
    }

    showLoginDialog() {
        this.dialog.open(LoginContentComponent, {
            width: '500px'
        })
    }
}
