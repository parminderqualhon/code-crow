import { Component, SecurityContext, ViewChild, ElementRef } from '@angular/core'
// import { AdminService } from '../../../services/admin.service'
// import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-privacy-policy',
    templateUrl: './privacy-policy.component.html',
    styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {
    // public docUrl: string
    // @ViewChild('iframe') iframe: ElementRef

    constructor() {} // public adminService: AdminService

    //   ngOnInit() {
    // this.adminService.legalDocsUrlListEmitter.subscribe(async data => {
    //   this.docUrl = data.forEach(doc => {
    //     if (doc.includes('privacy')) {
    //       this.iframe.nativeElement.setAttribute('src', doc);
    //     }
    //   })
    // })
    //   }
}
