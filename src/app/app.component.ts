import { TokenStorage } from './auth/token.storage'
import { ChannelService } from './services/channel.service'
import { AdminService } from './services/admin.service'
import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { AuthService } from './auth/auth.service'
import { ChatService } from './services/chat.service'
import { Socket } from './services/socket.service'
import { FriendService } from './services/friend.service'
import { Meta } from '@angular/platform-browser'
import { Util } from './util/util'
import { SharedService } from './services/shared.service'
import { Observable, Subscription } from 'rxjs'
import { environment } from '../environments/environment'
import { SfxService } from './services/sfx.service'
import { StreamingService } from './services/streaming.service'
import { AnimationOptions } from 'ngx-lottie'
import { ThemeService } from './services/theme.service'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    public user: any
    public error = false
    public isLoading: boolean = false
    public isAuthenticated: boolean = false
    private showSideBar: boolean = false
    private isCompactSideBar: boolean = false
    private showMobileSideBar: boolean = false

    public animationOpts: AnimationOptions = null
    private animationOptsSubscription: Subscription

    constructor(
        public authService: AuthService,
        private router: Router,
        public chatService: ChatService,
        public channelService: ChannelService,
        public sharedService: SharedService,
        public adminService: AdminService,
        private socket: Socket,
        private friendService: FriendService,
        private metaTagService: Meta,
        private tokenStorage: TokenStorage,
        @Inject(PLATFORM_ID) private platformId: Object,
        private sfxService: SfxService,
        private streamingService: StreamingService,
        private themeService: ThemeService
    ) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                // compact sidebar on channel detail page
                this.isCompactSideBar = event.url.startsWith('/channel/')
            }
        })
    }

    async ngOnInit() {
        try {
            this.animationOptsSubscription = this.themeService.logoAnimationOpts.subscribe(
                async (opts) => {
                    if (opts) {
                        this.animationOpts = opts
                    }
                }
            )
            this.themeService.updateAnimation()
            this.addMetaTags()
            this.isAuthenticated = await this.tokenStorage.getAuthenticatedStatus()
            this.showSideBar = this.isAuthenticated

            this.router.events.subscribe(async (event) => {
                if (!(event instanceof NavigationEnd)) {
                    return
                }

                this.showSideBar = this.isAuthenticated
                await this.channelService.getTechList()

                if (this.isAuthenticated) {
                    // isPlatformBrowser(this.platformId) ?
                    await this.streamingService.leaveRoom()
                    window.scrollTo(0, 0)
                    await this.onInitsubMethod()
                }
                this.showMobileSideBar = false

                this.isLoading = false
                if (this.router.url === '/login') {
                    return
                }
            })
                if(this.isAuthenticated){
                this.isLoading = false
                await this.onInitsubMethod()
            }
            
        } catch (e) {
            this.isLoading = false
            console.log(e)
            this.error = true
        }
        this.themeService.setTheme(this.tokenStorage.getTheme() || 'theme-light')
    }

    private async onInitsubMethod() {
        try {
            this.user = await this.authService.me()
            await this.channelService.getTechList()
            const onConnectionSuccess = async () => {
                if (this.user) {
                    this.sharedService.isLoginPage = false
                    await this.socket.emitUserConnection(this.user._id, true)
                    this.socket.listenToMaintenanceMode().subscribe((request) => {
                        if (request.data.isEnabled && !this.user.isAdmin) {
                            this.router.navigate(['/maintenance'])
                        }
                    })

                    this.socket.listenToUserConnection(this.user._id).subscribe(async (request) => {
                        this.authService.setUser(request.user)
                    })

                    this.socket.listenToChatMessages().subscribe(async (data) => {
                        this.chatService.incomingMessageActivateChatTab(data.data)
                    })
                }
            }
                if (this.socket.apiSocket.readyState == WebSocket.OPEN) onConnectionSuccess()
            
            await this.sfxService.getAllSavedMutedSfx()
        } catch (e) {
            console.log(e)
        }
    }

    public onToggleSidenav = () => {
        this.showMobileSideBar = !this.showMobileSideBar
    }

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return
    }

    private addMetaTags() {
        const metaTagData = Util.getMetaTagData()
        this.metaTagService.addTags([
            {
                name: 'keywords',
                content:
                    'Code Crow, Code Crow Corp, crow, code, coding, devops, programming, programmer, develop, developing, developer, computer science, software engineering, software, cicd, streaming, live-streaming, pair programming, web3, cryptocurrency, crypto, crypto currency, gaming, game, games, twitch'
            },
            { name: 'description', content: metaTagData.description },
            { name: 'robots', content: 'index, follow' },
            { name: 'author', content: metaTagData.author },
            { property: 'og:author', content: metaTagData.author },
            { property: 'og:type', content: 'website' },
            { property: 'og:title', content: metaTagData.title },
            { property: 'og:description', content: metaTagData.description },
            { property: 'og:url', content: metaTagData.url },
            { property: 'og:image', content: metaTagData.imageSrc },
            { property: 'og:image:width', content: metaTagData.imageWidth },
            { property: 'og:image:height', content: metaTagData.imageHeight },
            { property: 'twitter:card', content: 'summary_large_image' },
            { property: 'twitter:site', content: metaTagData.twitterHandle },
            { property: 'twitter:creator', content: metaTagData.twitterHandle },
            { property: 'twitter:title', content: metaTagData.title },
            { property: 'twitter:description', content: metaTagData.description },
            { property: 'twitter:image:src', content: metaTagData.imageSrc },
            { property: 'twitter:image:width', content: metaTagData.imageWidth },
            { property: 'twitter:image:height', content: metaTagData.imageHeight },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
            { name: 'apple-mobile-web-app-title', content: metaTagData.title },
            { charset: 'UTF-8' }
        ])
    }

    onToggleSidebar() {
        this.showSideBar = !this.showSideBar
    }

    async onScrollChannels(e) {
        if (this.router.url == '/' && this.isAuthenticated) {
            var { scrollHeight, scrollTop, clientHeight } = e.srcElement
            if (scrollHeight - clientHeight <= scrollTop) {
                await this.channelService.getChannels()
                scrollTop = e.srcElement.scrollHeight
            }
        }
    }
}
