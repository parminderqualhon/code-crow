import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
// import { BrowserModule } from '@angular/platform-browser'
import { PremiumRoutingModule } from './premium-routing.module'
import { PremiumComponent } from './premium.component'

@NgModule({
    declarations: [PremiumComponent],
    imports: [CommonModule, PremiumRoutingModule],

})
export class PremiumModule {}
