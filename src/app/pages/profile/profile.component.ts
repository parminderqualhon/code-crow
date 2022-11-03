import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core'
import { UserService } from './../../services/user.service'
import { ChatService } from '../../services/chat.service'
import { ChannelService } from '../../services/channel.service'
import { AuthService } from '../../auth/auth.service'
import { FollowService } from '../../services/follow.service'
import { ActivatedRoute, Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Sort } from '@angular/material/sort'
import { Util } from '../../util/util'
import { FormControl } from '@angular/forms'
import { MatMenuTrigger } from '@angular/material/menu'

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    @ViewChild('fileInput') fileInput: ElementRef
    @ViewChild('techMenuTrigger') techMenuTrigger: MatMenuTrigger
    data = []

    isDisplayNameEditable: boolean = false
    isCustomUsernameEditable: boolean = false
    isDescriptionEditable: boolean = false

    public otherUser: any
    public isCurrentUser: boolean
    private techStackUrls: string[] = []

    public searchQuery: string = ''
    public channelCount: number = 0
    public skip: number
    public limit: number
    public hostedChannels: any[] = []
    public isFollowing: boolean = false
    public isFollower: boolean = false
    public isMessageable: boolean = false
    public sortedChannels: any[]
    techStackFilter = []
    techStackSelected = []
    myControl = new FormControl()
    filteredOptions: any[] = []

    constructor(
        private activatedRoute: ActivatedRoute,
        public authService: AuthService,
        public channelService: ChannelService,
        public chatService: ChatService,
        public userService: UserService,
        public followService: FollowService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {}

    async ngOnInit() {
        this.activatedRoute.params.subscribe(async ({ customUsername }) => {
            await this.channelService.getTechList()
            this.data = this.channelService.techList
            this.otherUser = await this.userService.getUserByCustomUsername(customUsername)
            console.log(this.otherUser)
            if (this.otherUser) {
                this.isCurrentUser = this.otherUser._id == this.authService.currentUser._id
                if (!this.channelService.techList.length) {
                    await this.channelService.getTechList()
                }
                if(this.otherUser.techStack){
                this.otherUser.techStack.forEach(async (techName) => {
                    const tech = this.channelService.techList.find(
                        (item) => item.item_text === techName
                    )
                    if (tech) this.techStackUrls.push(tech.item_image)
                })
            }
                await this.getChannels(true)
                this.channelCount = this.otherUser?.hostChannelIds?.length || 0
                if (!this.isCurrentUser) {
                    const relationship = await this.followService.getFollowRelationship({
                        source: this.otherUser._id
                    })
                    this.isFollowing = relationship.isFollowing
                    this.isFollower = relationship.isFollower
                    this.isMessageable = this.otherUser.isMessageGuardEnabled
                        ? relationship.isFollower
                        : true
                }
                this.searchTech('')
            } else {
                this.router.navigate(['/404'])
            }
        })
    }

    async getChannels(isRefresh = false): Promise<any> {
        if (isRefresh) {
            this.resetSkipLimit()
        }
        const channels = await this.channelService.getChannelsByUserId({
            userId: this.otherUser._id,
            searchQuery: this.searchQuery,
            skip: this.skip,
            limit: this.limit
        })
        if (channels.length) {
            this.skip += this.limit
            this.hostedChannels.push(...channels)
            this.sortedChannels = this.hostedChannels.slice()
        } else {
            if (this.searchQuery && !this.skip)
                this.snackBar.open('No results with the search criteria', null, {
                    duration: 2000
                })
        }
    }

    async searchChannels() {
        this.hostedChannels = []
        await this.getChannels(true)
    }

    sortChannels(sort: Sort) {
        const data = this.hostedChannels.slice()
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

    resetSkipLimit() {
        this.skip = 0
        this.limit = 50
    }

    async seletedFiles(files: FileList) {
        const fileSize = files.item(0).size / 1024 / 1024
        if (['image/jpeg', 'image/png'].includes(files[0].type)) {
            if (fileSize <= 5) {
                const file = files[0]
                await this.userService.updateAvatar({
                    fileToUpload: file,
                    fileName: `avatar\.${file.name.split('.')[1]}`
                })
                this.otherUser = this.authService.currentUser

                if (typeof FileReader !== 'undefined') {
                    const reader = new FileReader()
                    reader.onload = (e: any) => {
                        this.authService.currentUser.avatar = e.target.result
                        this.otherUser.avatar = e.target.result
                        this.fileInput.nativeElement.value = ''
                    }
                    reader.readAsDataURL(file)
                }
            } else {
                this.snackBar.open('Max file size exceeded (5 MB)', null, {
                    duration: 5000
                })
                this.fileInput.nativeElement.value = ''
            }
        } else {
            this.snackBar.open('Unsupported file type', null, { duration: 5000 })
            this.fileInput.nativeElement.value = ''
        }
    }

    async onBlurDisplayName() {
        if (this.otherUser.displayName.length > 2) {
            this.isDisplayNameEditable = false
            await this.userService.updateDisplayName({
                displayName: this.otherUser.displayName
            })
        } else {
            this.snackBar.open('Display name must be at least 3 characters', null, {
                duration: 5000
            })
        }
    }

    async onBlurCustomUsername() {
        if (this.otherUser.customUsername.length > 2) {
            this.isCustomUsernameEditable = false
            const user = await this.userService.updateCustomUsername({
                customUsername: this.otherUser.customUsername
            })
            if (user.exists && !user.isMine) {
                this.snackBar.open('This handle already exists', null, {
                    duration: 5000
                })
                this.otherUser.customUsername = this.authService.currentUser.customUsername
            }
        } else {
            this.snackBar.open('Handle must be at least 3 characters', null, {
                duration: 5000
            })
        }
    }

    async onBlurDescription() {
        if (this.otherUser.description.length > 2) {
            this.isDescriptionEditable = false
            await this.userService.updateDescription({
                description: this.otherUser.description
            })
        } else {
            this.snackBar.open('Description must be at least 3 characters', null, {
                duration: 5000
            })
        }
    }

    openGitProfile(user) {
        const { providerType, username } = user
        const url = `https://${providerType}${
            providerType == 'Bitbucket' ? '.org' : '.com'
        }/${username}`
        const win = window.open(url, '_blank')
        win.focus()
    }

    @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
        this.isDisplayNameEditable = false
        this.isCustomUsernameEditable = false
        this.isDescriptionEditable = false
    }

    async onScroll(e) {
        var { scrollHeight, scrollTop, clientHeight } = e.srcElement
        if (scrollHeight - clientHeight <= scrollTop) {
            await this.getChannels()
            scrollTop = e.srcElement.scrollHeight
        }
    }

    searchTech(query: string) {
        const val = query.toLowerCase()
        this.filteredOptions = this.data.filter((item) => {
            if (item.item_text.toLowerCase().indexOf(val) !== -1 || !val) {
                return item
            }
        })
        // if (temp.length > 0) {
        //     this.techStackFilter = temp
        // } else {
        //     this.techStackFilter = this.techStackSelected
        // }
    }

    async submitTechStack(selectedTechStack: any[]) {
        await this.userService.updateTeckStack({ techStack: selectedTechStack })
        this.otherUser = this.authService.currentUser
        this.snackBar.open('Categories updated', null, {
            duration: 5000
        })
    }
}
