import { AfterViewInit, Component, EventEmitter, Inject, OnDestroy, OnInit, Output, PLATFORM_ID, } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { Sort } from '@angular/material/sort'
import { Util } from '../../util/util'
import { UserService } from './../../services/user.service'
import { ChatService } from '../../services/chat.service'
import { ChannelService } from '../../services/channel.service'
import { SharedService } from '../../services/shared.service'
import { ThemeService } from '../../services/theme.service'
import { AuthService } from '../../auth/auth.service'

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: Util.cardAnimation
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
    @Output() clear = new EventEmitter()
    public sortedChannels: any[]
    public stickySearchHeader: boolean = false
    public featuredChannels: any[] = []

    public showUsers: boolean = false
    public isDarkTheme: boolean = false

    constructor(
        public authService: AuthService,
        public channelService: ChannelService,
        public sharedService: SharedService,
        public chatService: ChatService,
        public userService: UserService,
        private titleService: Title,
        public themeService: ThemeService,
        @Inject(PLATFORM_ID) private platform_id
    ) {}

    async ngOnInit() {
        this.sharedService.isLoginPage = false
        const { title } = Util.getMetaTagData()
        this.titleService.setTitle(title)
        window.addEventListener('scroll', this.scrollEvent, true)
        this.isDarkTheme = await this.themeService.isDarkTheme()
        this.channelService.channelsBehavior.subscribe(async channels => {
            this.sortedChannels = channels
            this.featuredChannels = channels
                .slice()
                .filter((channel) => !channel.password)
                .sort((a, b) => b.roomMembers - a.roomMembers)
                .slice(0, 5)
        })
    }

    ngOnDestroy() {
        this.chatService.activeTabs = []
        window.removeEventListener('scroll', this.scrollEvent, true)
    }

    async ngAfterViewInit() {
        await this.getChannels()
    }

    scrollEvent = (): void => {
        const channelsListContainerElement = document.querySelector('.list-channel-container')
        this.stickySearchHeader = channelsListContainerElement.getBoundingClientRect().top <= 0
    }

    onClear() {
        this.clear.emit()
    }

    showAddChannelDialog() {
        this.channelService.isAddChannelEnabled = true
        this.channelService.addChannelDialogBehavior.next(true)
    }

    showFilterDialog() {
        this.channelService.isFilterChannelEnabled = true
        this.channelService.filterChannelDialogBehavior.next({ isOpen: true, selectedTech: [] })
    }

    showEditGroupDialog($group) {
        this.channelService.isEditGroupEnabled = $group
        this.channelService.editGroupDialogBehavior.next(true)
    }

    async getChannels() {
        var channels = await this.channelService.getInitialChannels()
        this.sortedChannels = channels.slice()
        if (this.sortedChannels.length < 5) return
        this.featuredChannels = channels
            .slice()
            .filter((channel) => !channel.password)
            .sort((a, b) => b.roomMembers - a.roomMembers)
            .slice(0, 5)
    }

    async searchChannels() {
        const channels: any[] = await this.channelService.searchChannels()
        this.sortedChannels = channels
    }

    sortChannels(sort: Sort) {
        const data = this.channelService.channels.slice()
        if (!sort.active || sort.direction === '') {
            this.sortedChannels = data
            return
        }

        this.sortedChannels = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc'
            switch (sort.active) {
                case 'techStack':
                    return Util.compare(a.techStack?.length, b.techStack?.length, isAsc)
                case 'title':
                    return Util.compare(a.title.toLowerCase(), b.title.toLowerCase(), isAsc)
                case 'description':
                    return Util.compare(
                        a.description.toLowerCase(),
                        b.description.toLowerCase(),
                        isAsc
                    )
                case 'info':
                    return Util.compare(a.roomMembers?.length, b.roomMembers?.length, isAsc)
                case 'tags':
                    return Util.compare(a.tags?.length, b.tags?.length, isAsc)
                case 'host':
                    return Util.compare(a.createdBy.toLowerCase(), b.createdBy.toLowerCase(), isAsc)
                default:
                    return 0
            }
        })
    }

    leaveGroup() {
        this.sharedService.refreshGroupList()
    }
}
