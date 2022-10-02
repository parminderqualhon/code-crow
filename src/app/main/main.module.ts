import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MainRoutingModule } from './main-routing.module'
import { MainComponent } from './main.component'
import { LoginComponent } from '../auth/login/login.component'
import { FooterComponent } from '../footer/footer.component'
import { SharedModule } from '../shared/shared.module'
import { LoginContentComponent } from '../auth/login/login-content/login-content.component'
import { LoginWrapperComponent } from './login-wrapper/login-wrapper.component'

@NgModule({
    declarations: [
        MainComponent,
        LoginComponent,
        LoginContentComponent,
        FooterComponent,
        LoginWrapperComponent
    ],
    imports: [CommonModule, MainRoutingModule, SharedModule],
    providers: []
})
export class MainModule {}
