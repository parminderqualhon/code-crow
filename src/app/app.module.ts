import { MatButtonModule } from '@angular/material/button'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { RouterModule } from '@angular/router'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { PdfViewerModule } from 'ng2-pdf-viewer'
import { CommonModule } from '@angular/common'
import { MatListModule } from '@angular/material/list'
import { MatRippleModule } from '@angular/material/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SharedModule } from './shared/shared.module'
import { AppComponent } from './app.component'
import { AuthHeaderInterceptor } from './interceptors/header.interceptor'
import { CatchErrorInterceptor } from './interceptors/http-error.interceptor'
import { CredentialsInterceptor } from './interceptors/credentials.interceptor'
import { AppRoutingModule } from './app-routing.module'
import { ChannelDetailsComponent } from './pages/channel-details/channel-details.component'
import { ContentComponent } from './pages/channel-details/content/content.component'
import { ChatComponent } from './pages/channel-details/chat/chat.component'
// import { MessageComponent } from './pages/channel-details/chat/message/message.component'
// import { InputComponent } from './pages/channel-details/chat/input/input.component'
// import { ChannelItemComponent } from './pages/channel-details/channel/channel-item/channel-item.component'
import { FilterPipe } from './filter.pipe'

// import { ContactComponent } from './pages/contact/contact.component'
// import { AddChannelComponent } from './pages/channel-details/channel/add-channel/add-channel.component'
// import { LoginComponent } from './auth/login/login.component'
// import { LoginContentComponent } from './auth/login-content/login-content.component'

import { ServiceWorkerModule } from '@angular/service-worker'
import { environment } from '../environments/environment'
import { VideoComponent } from './pages/channel-details/content/video/video.component'

// import { VideosComponent } from './pages/videos/videos.component'
// import { VideoItemComponent } from './pages/videos/video-item/video-item.component'
// import { VgCoreModule } from '@videogular/ngx-videogular/core'
// import { VgControlsModule } from '@videogular/ngx-videogular/controls'
// import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play'
// import { VgBufferingModule } from '@videogular/ngx-videogular/buffering'
// import { VideoPlayerComponent } from './pages/videos/video-player/video-player.component'

import { ChannelSettingsComponent } from './pages/channel-details/channel/channel-settings/channel-settings.component'
import { LegalModule } from './pages/legal/legal.module'
// import { CookiePolicyComponent } from './pages/legal/cookie-policy/cookie-policy.component'
// import { PrivacyPolicyComponent } from './pages/legal/privacy-policy/privacy-policy.component'
// import { TermsOfServiceComponent } from './pages/legal/terms-of-service/terms-of-service.component'
// import { CopyrightPolicyComponent } from './pages/legal/copyright-policy/copyright-policy.component'
// import { LegalComponent } from './pages/legal/legal.component'
import { DialogComponent } from './controls/dialog/dialog.component'
// import { CategoryPipe } from './shared/category.pipe'
import { DialogService } from './services/dialog.service'
import { ThemeService } from './services/theme.service'
import { MatTooltipModule } from '@angular/material/tooltip'
import { FriendChatComponent } from './pages/friends/friend-chat/friend-chat.component'
import { SideBarComponent } from './side-bar/side-bar.component'
// import { CarouselComponent } from './pages/home/carousel/carousel.component'
// import { CarouselCardComponent } from './pages/home/carousel/carousel-card/carousel-card.component'
// import { GdprPolicyComponent } from './pages/legal/gdpr-policy/gdpr-policy.component'

// import { CheckoutComponent } from './pages/paid-services/checkout/checkout.component'
// import { PricingComponent } from './pages/pricing/pricing.component'
// import { SubscriptionTiersComponent } from './pages/pricing/subscription-tiers/subscription-tiers.component'
// import { AddPaymentMethodComponent } from './pages/paid-services/checkout/add-payment-method/add-payment-method.component'
// import { SubcancelComponent } from './pages/pricing/subcancel/subcancel.component'
// import { PaymentMethodsComponent } from './pages/settings/payment-methods/payment-methods.component'
// import { AccountSubsComponent } from './pages/settings/payment-methods/account-subs/account-subs.component'
// import { AccountCardsComponent } from './pages/settings/payment-methods/account-cards/account-cards.component'
// import { SubscriptionsComponent } from './pages/pricing/subscriptions/subscriptions.component'
// import { PackagesComponent } from './pages/pricing/packages/packages.component'
// import { PackageTierComponent } from './pages/pricing/package-tier/package-tier.component'
// import { PurchaseComponent } from './pages/paid-services/purchase/purchase.component'
// import { AccountBanksComponent } from './pages/settings/payment-methods/account-banks/account-banks.component'

import { FeatureFlagDirective } from './directives/feature-flag.directive'
import { OverlayModule } from '@angular/cdk/overlay'
// import { UserSettingsComponent } from './pages/settings/user-settings/user-settings.component'
import { SideNavComponent } from './pages/settings/side-nav/side-nav.component'
import { FriendsMenuSixComponent } from './pages/friends/friends-menus/friends-menus.component'
import { StreamControlsComponent } from './pages/channel-details/content/stream-controls/stream-controls.component'
// import { MaintenanceComponent } from './pages/maintenance/maintenance.component'
// import { NotFoundComponent } from './pages/not-found/not-found.component'
import { PickerModule } from '@ctrl/ngx-emoji-mart'
import { CreateGroupComponent } from './pages/friends/create-group/create-group.component'
import { LoadingDialogComponent } from './controls/loading-dialog/loading-dialog.component'
// import { HomeComponent } from './pages/home/home.component'
import { InfiniteScrollModule } from 'ngx-infinite-scroll'
import { WaitingRoomDialogComponent } from './pages/channel-details/channel/waiting-room-dialog/waiting-room-dialog.component'
// import { FooterComponent } from './footer/footer.component'
// import { UserAvatarComponent } from './controls/user-avatar/user-avatar.component'
import { ViewChannelDetailComponent } from './pages/channel-details/chat/view-channel-detail/view-channel-detail.component'
import { AttachmentComponent } from './pages/channel-details/chat/view-channel-detail/attachment/attachment.component'
// import { FilterOptionsComponent } from './pages/channel-details/channel/filter-options/filter-options.component'
import { MatChipsModule } from '@angular/material/chips'
import { MatCheckboxModule } from '@angular/material/checkbox'
// import { MultiSelectDropdownComponent } from './controls/multi-select-dropdown/multi-select-dropdown.component'
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { EditGroupComponent } from './pages/friends/edit-group/edit-group.component'
import { LottieModule } from 'ngx-lottie'
import player from 'lottie-web'
// import { MainComponent } from './main/main.component'
// import { AuthService } from './auth/auth.service'
import { TokenStorage } from './auth/token.storage'
// import { AuthenticateComponent } from './auth/authenticate/authenticate.component'
import { MatIconModule } from '@angular/material/icon'
import { BnNgIdleService } from 'bn-ng-idle'
import { ProfileComponent } from './pages/profile/profile.component'

import { LoginGuard } from './auth/login-guard.service'
import { MaintenanceGuard } from './auth/maintenance-guard.service'
import { AuthGuard } from './auth/auth-guard.service'

import { FollowItemComponent } from './pages/profile/follow-panel/follow-item/follow-item.component'
import { FollowPanelComponent } from './pages/profile/follow-panel/follow-panel.component'
import { TechStackDropdownComponent } from './controls/tech-stack-dropdown/tech-stack-dropdown.component'
import { HomeModule } from './pages/home/home.module'
import { InAppSnackBarComponent } from './controls/in-app-snack-bar/in-app-snack-bar.component'
import { FriendsDialogComponent } from './pages/friends/friends-dialog/friends-dialog.component'
import { FriendItemComponent } from './pages/friends/friend-item/friend-item.component'
import { FriendsComponent } from './pages/friends/friends.component'
import { CommunityDialogComponent } from './pages/community-dialog/community-dialog.component'
import { CommunityComponent } from './pages/community-dialog/community/community.component'
import { initializeApp, provideFirebaseApp } from '@angular/fire/app'
import { provideRemoteConfig, getRemoteConfig } from '@angular/fire/remote-config'
// import { getAnalytics, provideAnalytics, UserTrackingService } from '@angular/fire/analytics'

export function playerFactory() {
    return player
}

@NgModule({
    declarations: [
        // ? MainComponent,
        // ? HomeComponent,
        // ? CarouselComponent,
        // ? CarouselCardComponent,
        // ? LoginComponent,
        // ? LoginContentComponent,
        // ? FooterComponent,
        AppComponent,
        // CategoryPipe,
        ChannelDetailsComponent,
        ContentComponent,
        // ? MessageComponent,
        // ? InputComponent,
        ChatComponent,
        //  ? ChannelItemComponent,
        FilterPipe,
        // ? AddChannelComponent,

        ChannelSettingsComponent,
        VideoComponent,
        // VideoItemComponent,
        // VideosComponent,
        // VideoPlayerComponent,
        // ? CookiePolicyComponent,
        // ? PrivacyPolicyComponent,
        // ?TermsOfServiceComponent,
        // ?CopyrightPolicyComponent,
        // ?GdprPolicyComponent,
        // ? ContactComponent,
        // ?LegalComponent,
        DialogComponent,
        // PricingComponent,
        // SubscriptionTiersComponent,
        // CheckoutComponent,
        // AddPaymentMethodComponent,
        // SubcancelComponent,
        // PaymentMethodsComponent,
        // AccountSubsComponent,
        // AccountCardsComponent,
        // SubscriptionsComponent,
        // PackagesComponent,
        // PackageTierComponent,
        // PurchaseComponent,
        // AccountBanksComponent,
        FriendsComponent,
        FriendItemComponent,
        FriendChatComponent,
        SideBarComponent,

        FeatureFlagDirective,
        // ?UserSettingsComponent,
        SideNavComponent,
        // FriendsMenuOne,
        // FriendsMenuTwo,
        // FriendsMenuThree,
        // FriendsMenuFour,
        // FriendsMenuFive,
        FriendsMenuSixComponent,
        StreamControlsComponent,
        // ? MaintenanceComponent,
        // ? NotFoundComponent,
        CreateGroupComponent,
        LoadingDialogComponent,

        WaitingRoomDialogComponent,
        //  ? UserAvatarComponent,
        // ? FilterOptionsComponent,
        // ? MultiSelectDropdownComponent,
        ViewChannelDetailComponent,
        AttachmentComponent,
        EditGroupComponent,
        FriendsDialogComponent,
        // ? AuthenticateComponent,
        ProfileComponent,
        FollowItemComponent,
        FollowPanelComponent,
        TechStackDropdownComponent,
        InAppSnackBarComponent,
        CommunityDialogComponent,
        CommunityComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        PickerModule,
        PdfViewerModule,
        CommonModule,
        HttpClientModule,
        SharedModule,
        LegalModule,
        RouterModule,
        AppRoutingModule,
        MatChipsModule,
        MatListModule,
        MatRippleModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production
        }),
        OverlayModule,
        // VgCoreModule,
        // VgControlsModule,
        // VgOverlayPlayModule,
        // VgBufferingModule,
        InfiniteScrollModule,
        MatDialogModule,
        LottieModule.forRoot({ player: playerFactory }),
        HomeModule,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideRemoteConfig(() => getRemoteConfig()),
        // provideAnalytics(() => getAnalytics())
    ],
    exports: [
        // ? HomeComponent,
        // ? LoginComponent
        // ? AddChannelComponent,
        CreateGroupComponent,
        // ? MultiSelectDropdownComponent,
        // CategoryPipe,
        EditGroupComponent
        // new
        // LazyImgDirective
        // ClickOutsideDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
        // UserTrackingService,
        BnNgIdleService,
        ThemeService,
        TokenStorage,
        AuthGuard,
        MaintenanceGuard,
        LoginGuard,
        DialogService,
        {
            provide: [HTTP_INTERCEPTORS],
            useClass: AuthHeaderInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: CredentialsInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: CatchErrorInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
