import { ProfileComponent } from './pages/profile/profile.component'
import { MaintenanceGuard } from './auth/maintenance-guard.service'
import { ContactComponent } from './pages/contact/contact.component'
import { LegalComponent } from './pages/legal/legal.component'
// import { VideosComponent } from './../pages/videos/videos.component'
import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'
import { AuthGuard } from './auth/auth-guard.service'
import { ChannelDetailsComponent } from './pages/channel-details/channel-details.component'
// import { PricingComponent } from '../pages/pricing/pricing.component'
// import { CheckoutComponent } from '../pages/checkout/checkout.component'
// import { PurchaseComponent } from '../pages/purchase/purchase.component'
import { UserSettingsComponent } from './pages/settings/user-settings/user-settings.component'
// import { PaymentMethodsComponent } from '../pages/settings/payment-methods/payment-methods.component'
// import { VideoPlayerComponent } from '../pages/videos/video-player/video-player.component'
import { MaintenanceComponent } from './pages/maintenance/maintenance.component'
import { NotFoundComponent } from './pages/not-found/not-found.component'
import { PremiumComponent } from './pages/premium/premium.component'
import { PremiumModule } from './pages/premium/premium.module'

// import { HomeComponent } from '../pages/home/home.component'
// import { MainComponent } from '../main/main.component'
// import { AuthenticateComponent } from '../auth/authenticate/authenticate.component'
import { LoginGuard } from './auth/login-guard.service'

const routes: Routes = [
    // todo:=> Added Lazy loading for Main module (includes component specific lazy loading too)
    {
        path: '',
        // component: MainComponent,
        loadChildren: () => import('./main/main.module').then((m) => m.MainModule),
        canActivate: [MaintenanceGuard]
    },
    // ! Incomplete
    {
        path: 'channel/:channelId',
        component: ChannelDetailsComponent,
        canActivate: [AuthGuard, MaintenanceGuard]
    },
    // todo :=> Implemented Lazy Loading
    {
        path: 'authenticate',
        // component: AuthenticateComponent,
        loadChildren: () =>
            import('./auth/authenticate/authenticate.module').then((m) => m.AuthenticateModule),
        canActivate: [LoginGuard]
    },
    // todo :=> Implemented Lazy Loading
    {
        path: '404',
        // component: NotFoundComponent
        loadChildren: () =>
            import('./pages/not-found/not-found.module').then((m) => m.NotFoundModule)
    },
    // todo :=> Implemented Lazy Loading
    {
        path: 'maintenance',
        // component: MaintenanceComponent
        loadChildren: () =>
            import('./pages/maintenance/maintenance.module').then((m) => m.MaintenanceModule)
    },
    // {
    //     path: 'auth',
    //     loadChildren: () => import('../auth/auth.module').then(m => m.AuthModule),
    // },
    // todo :=> Implemented Lazy Loading
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
        canActivate: [AuthGuard]
    },
    // {
    //   path: 'creator-space',
    //   loadChildren: () => import('../pages/creator-space/creator-space.module').then(m => m.CreatorSpaceModule),
    //   canActivate: [AuthGuard, MaintenanceGuard]
    // },
    // todo :=> Implemented Lazy Loading
    {
        path: 'legal',
        loadChildren: () => import('./pages/legal/legal.module').then((m) => m.LegalModule)
    },
    // {
    //   path: 'pricing',
    //   component: PricingComponent,
    //   canActivate: [MaintenanceGuard]
    // },
    // {
    //   path: 'videos',
    //   component: VideosComponent,
    //   canActivate: [AuthGuard, MaintenanceGuard]
    // },
    // ! No need for that already using lazy loading
    // {
    //     path: 'legal',
    //     component: LegalComponent
    // },
    // todo :=> Implemented Lazy Loading
    {
        path: 'contact',
        // component: ContactComponent
        loadChildren: () => import('./pages/contact/contact.module').then((m) => m.ContactModule)
    },
    // {
    //     path: 'partners',
    //     component: PaymentMethodsComponent,
    //     canActivate: [AuthGuard, MaintenanceGuard]
    // },
    // todo :=> Implemented Lazy Loading
    {
        path: 'settings',
        // component: UserSettingsComponent,
        loadChildren: () =>
            import('./pages/settings/user-settings/user-settings.module').then(
                (m) => m.UserSettingsModule
            ),
        canActivate: [AuthGuard, MaintenanceGuard]
    },
    {
        path: 'premium',
        // component: NFTComponent,
        loadChildren: () => import('./pages/premium/premium.module').then((m) => m.PremiumModule),
        canActivate: [AuthGuard, MaintenanceGuard]

    },
    {
        path: 'profile/:customUsername',
        component: ProfileComponent,
        canActivate: [AuthGuard, MaintenanceGuard]
    },
    // {
    //   path: 'checkout/:priceId',
    //   component: CheckoutComponent
    // },
    // {
    //   path: 'purchase/:skuId',
    //   component: PurchaseComponent
    // },
    // {
    //     path: 'video/:id',
    //     component: VideoPlayerComponent,
    //     canActivate: [AuthGuard, MaintenanceGuard]
    // },
    {
        path: '**',
        redirectTo: '404'
    }
]

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            preloadingStrategy: PreloadAllModules,
            onSameUrlNavigation: 'reload'
        })
    ],
    exports: [RouterModule],
    providers: [],
    declarations: []
})
export class AppRoutingModule {}
