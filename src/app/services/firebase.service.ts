import { Injectable } from '@angular/core'
import { RemoteConfig, fetchAndActivate, getAllChanges } from '@angular/fire/remote-config'
// import { getAnalytics, setUserProperties } from '@angular/fire/analytics'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    public isMaintenanceModeEnabled: any = false
    public isFeatureVideoResponsesEnabled: any = false
    public isFeatureGroupChatEnabled: any = false
    public isFeatureMintPageEnabled: any = false
    public isFeaturePremiumPageEnabled: any = false

    constructor(
        private remoteConfig: RemoteConfig
    ) {}

    public setUserPropertyAnalytics() {
        // const env = environment.name === 'local' || 'development' ? 'dev' : 'prod'
        // const analytics = getAnalytics()
        // setUserProperties(analytics, { server_env: env })
    }

    public async getAllRemoteConfigValues() {
        await fetchAndActivate(this.remoteConfig)
        getAllChanges(this.remoteConfig).subscribe((changes) => {
            console.log('changes', changes)
            this.isMaintenanceModeEnabled = changes.site_settings_maintenance_mode.asBoolean()
            this.isFeatureVideoResponsesEnabled = changes.feature_video_responses.asBoolean()
            this.isFeatureGroupChatEnabled = changes.feature_group_chat.asBoolean()
            this.isFeatureMintPageEnabled = changes.feature_mint_page.asBoolean()
            this.isFeaturePremiumPageEnabled = changes.feature_premium_page.asBoolean()
        })
    }
}