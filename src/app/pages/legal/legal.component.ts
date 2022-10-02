import {
    AfterViewInit,
    Component,
    ElementRef,
    Inject,
    OnInit,
    PLATFORM_ID,
    ViewChild
} from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { isPlatformServer } from '@angular/common'
import { SharedService } from '../../services/shared.service'

@Component({
    selector: 'app-legal',
    templateUrl: './legal.component.html',
    styleUrls: ['./legal.component.scss']
})
export class LegalComponent implements OnInit, AfterViewInit {
    isServer = isPlatformServer(this.platformId)
    @ViewChild('.ng2-pdf-viewer-container') divView: ElementRef
    public navLinks: any

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private sharedService: SharedService,
        private elRef: ElementRef,
        router: Router
    ) {
        router.events.forEach((event) => {
            if (event instanceof NavigationEnd) {
                this.elRef.nativeElement
                    .querySelector('.ng2-pdf-viewer-container')
                    ?.setAttribute('style', 'height: auto')
            }
        })
    }

    async ngOnInit() {
        this.sharedService.isLoginPage = false
        this.navLinks = [
            {
                label: 'Privacy Policy',
                path: 'privacy-policy'
            },
            {
                label: 'Cookie Policy',
                path: 'cookie-policy'
            },
            {
                label: 'Copyright Policy',
                path: 'copyright-policy'
            },
            {
                label: 'GDPR Policy',
                path: 'gdpr-policy'
            },
            {
                label: 'Terms of Service',
                path: 'terms-of-service'
            }
        ]
    }

    ngAfterViewInit() {
        const pdfContainer = this.elRef.nativeElement.querySelector('.ng2-pdf-viewer-container')
        if (pdfContainer) pdfContainer.setAttribute('style', 'height: auto')
    }
}
