import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SharedModule } from '../../shared/shared.module'
import { LegalRoutingModule } from './legal-routing.module'
import { LegalComponent } from './legal.component'
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component'
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component'
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component'
import { CopyrightPolicyComponent } from './copyright-policy/copyright-policy.component'
import { GdprPolicyComponent } from './gdpr-policy/gdpr-policy.component'
import { PdfViewerModule } from 'ng2-pdf-viewer'

@NgModule({
    imports: [CommonModule, SharedModule, LegalRoutingModule, PdfViewerModule],
    declarations: [
        LegalComponent,
        PrivacyPolicyComponent,
        CookiePolicyComponent,
        TermsOfServiceComponent,
        CopyrightPolicyComponent,
        GdprPolicyComponent
    ],
    providers: []
})
export class LegalModule {}
