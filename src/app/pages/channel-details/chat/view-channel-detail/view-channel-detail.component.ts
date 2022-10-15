import { SfxService, SoundEffect } from './../../../../services/sfx.service'
import { Socket } from '../../../../services/socket.service'
import { UserService } from '../../../../services/user.service'
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core'
import { ChannelService } from '../../../../services/channel.service'
import { ChatService } from '../../../../services/chat.service'
import { MatDialog } from '@angular/material/dialog'
import { ChannelSettingsComponent } from '../../channel/channel-settings/channel-settings.component'
import { Util } from '../../../../util/util'
import { FormControl, FormGroup } from '@angular/forms'
import { MatChipInputEvent } from '@angular/material/chips'
import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { MatSnackBar } from '@angular/material/snack-bar'
import { AuthService } from '../../../../auth/auth.service'

@Component({
    selector: 'app-view-channel-detail',
    templateUrl: './view-channel-detail.component.html',
    styleUrls: ['./view-channel-detail.component.scss']
})
export class ViewChannelDetailComponent implements OnInit {
    @ViewChild('fileInput', { static: false }) fileInput: ElementRef
    @ViewChild('thumbnailInput') thumbnailInput: ElementRef
    @Input() attachments: string[]
    @Input() host: any
    public showAttachment: boolean = false
    public showDetail: boolean = false
    public editDetail: boolean = false
    public description: string
    public thumbnail: string
    public techList = []
    public techStack = []
    public editTechStack: boolean = false
    public tempTags = []
    public tags = []
    public editTags: boolean = false
    public tagCtrl = new FormControl()
    separatorKeysCodes: number[] = [ENTER, COMMA]
    public isPrivate: boolean
    public isOwner: boolean = false
    @ViewChild('techStackVal') techStackVal: ElementRef
    searchText = ''
    public filterChannelForm: FormGroup

    constructor(
        public channelService: ChannelService,
        public chatService: ChatService,
        public dialogChannelSettings: MatDialog,
        public userService: UserService,
        private socket: Socket,
        private sfxService: SfxService,
        private snackBar: MatSnackBar,
        private authService: AuthService
    ) {}

    async ngOnInit() {
        this.isOwner = this.authService.currentUser._id === this.channelService.currentChannel.user
        this.description = this.showDetail
            ? this.channelService.currentChannel.description
            : this.channelService.currentChannel.description.substring(0, 129)
        this.techStack = this.channelService.currentChannel.techStack
        this.thumbnail = this.channelService.currentChannel.thumbnail
        this.tags = this.channelService.currentChannel.tags
        this.isPrivate = this.channelService.currentChannel.isPrivate
        this.socket
            .listenToChannelUpdate(this.channelService.currentChannel._id)
            .subscribe((request) => {
                this.channelService.currentChannel.description = request.channel.description
                this.channelService.currentChannel.techStack = this.channelService.currentChannel.techStack
                this.channelService.currentChannel.tags = this.channelService.currentChannel.tags
                this.channelService.currentChannel.thumbnail = request.channel.thumbnail
                this.channelService.currentChannel.isPrivate = request.channel.isPrivate
                this.channelService.currentChannel.attachments = request.channel.attachments

                this.description = this.channelService.currentChannel.description
                this.techStack = this.channelService.currentChannel.techStack
                this.tags = this.channelService.currentChannel.tags
                this.thumbnail = this.channelService.currentChannel.thumbnail
                this.isPrivate = this.channelService.currentChannel.isPrivate
                this.attachments = this.channelService.currentChannel.attachments

                this.sfxService.playAudio(SoundEffect.ChannelUpdates)
                this.snackBar.open('Channel details have been updated!', null, {
                    duration: 3000
                })
            })
    }

    async showChannelSettingsDialog() {
        this.dialogChannelSettings.open(ChannelSettingsComponent, {
            width: '850px'
        })
    }

    toggleAttachment() {
        this.showAttachment = !this.showAttachment
    }

    toggleDetail() {
        this.showDetail = !this.showDetail
        this.description = this.showDetail
            ? this.channelService.currentChannel.description
            : this.channelService.currentChannel.description.substring(0, 129)
    }

    toggleDetailEdit() {
        if (this.isOwner) {
            this.editDetail = !this.editDetail
            if (this.editDetail) {
                this.description = this.channelService.currentChannel.description
            } else if (!this.editDetail && !this.showDetail) {
                this.description = this.channelService.currentChannel.description.substring(0, 129)
            }
        }
    }

    async onThumbnailUpdate() {
        const inputNode = this.thumbnailInput.nativeElement
        if (!inputNode.files[0]) return
        const fileSize = inputNode.files[0].size / 1024 / 1024
        if (['image/jpeg', 'image/png'].includes(inputNode.files[0].type)) {
            if (fileSize <= 5) {
                const { location: thumbnailUrl } = await this.chatService.postFile(
                    'thumbnail',
                    inputNode.files[0]
                )
                // delete old thumbnail from S3
                if (this.thumbnail) this.deleteAttachment(this.thumbnail, true)
                this.thumbnail = thumbnailUrl
                let channel = await this.channelService.updateChannelInfo({
                    channelId: this.channelService.currentChannel._id,
                    description: this.description,
                    thumbnail: thumbnailUrl,
                    techStack: this.techStack,
                    tags: this.tags,
                    isPrivate: this.isPrivate,
                    userId: this.channelService.currentChannel.user
                })
                this.channelService.currentChannel.thumbnail = channel.thumbnail
                this.socket.emitChannelUpdate(channel)
            } else {
                this.snackBar.open('Max file size exceeded (5 MB)', null, {
                    duration: 5000
                })
                this.thumbnailInput.nativeElement.value = ''
            }
        } else {
            this.snackBar.open('Unsupported file type', null, {
                duration: 5000
            })
            this.thumbnailInput.nativeElement.value = ''
        }
    }

    async seletedFiles(files: FileList) {
        const fileSize = files.item(0).size / 1024 / 1024
        if (!Util.restrictedMimeTypes.includes(files.item(0).type)) {
            if (fileSize <= 15) {
                this.showAttachment = true
                await this.uploadAttachment(files)
            } else {
                this.snackBar.open('Max file size exceeded (15 MB)', null, {
                    duration: 5000
                })
                this.fileInput.nativeElement.value = ''
            }
        } else {
            this.snackBar.open('Unsupported file type', null, { duration: 5000 })
            this.fileInput.nativeElement.value = ''
        }
    }

    async uploadAttachment(files: FileList) {
        if (this.isOwner) {
            try {
                let data = await this.chatService.postFile(
                    this.channelService.currentChannel._id,
                    files[0]
                )
                await this.channelService.addAttachments({
                    channelId: this.channelService.currentChannel._id,
                    attachmentUrl: data.location
                })
                this.attachments.push(data.location)
            } catch (error) {
                console.log(error)
            }
            this.socket.emitChannelUpdate(this.channelService.currentChannel)
        }
    }

    async deleteAttachment(removeUrl, isThumbnail = false) {
        if (this.isOwner) {
            try {
                const attachmenUrl = new URL(decodeURIComponent(removeUrl))
                const key = attachmenUrl.pathname.substring(attachmenUrl.pathname.indexOf('/') + 1)
                await this.chatService.deleteFile(key)
                if (isThumbnail) return
                await this.channelService.deleteAttachment({
                    channelId: this.channelService.currentChannel._id,
                    attachmentUrl: removeUrl
                })
                this.attachments = this.attachments.filter((item) => item !== removeUrl)
            } catch (error) {
                console.log(error)
            }
        }
    }

    async togglePrivate() {
        if (this.isOwner) {
            let channel = await this.channelService.updateChannelInfo({
                channelId: this.channelService.currentChannel._id,
                description: this.description,
                thumbnail: this.thumbnail,
                techStack: this.techStack,
                tags: this.tags,
                isPrivate: this.isPrivate,
                userId: this.channelService.currentChannel.user
            })
            this.isPrivate = !this.isPrivate
            this.socket.emitChannelUpdate(channel)
        }
    }

    async descriptionUpdate() {
        let channel = await this.channelService.updateChannelInfo({
            channelId: this.channelService.currentChannel._id,
            description: this.description,
            thumbnail: this.thumbnail,
            techStack: this.techStack,
            tags: this.tags,
            isPrivate: this.isPrivate,
            userId: this.channelService.currentChannel.user
        })
        this.editDetail = !this.editDetail
        this.channelService.currentChannel.description = channel.description
        this.socket.emitChannelUpdate(channel)
    }

    getImagePath(techName) {
        return this.channelService.techList
            .filter((x) => x.item_text === techName)
            .map((x) => x.item_image)
            .toString()
    }

    toggleTechStackEdit() {
        if (this.isOwner) {
            this.editTechStack = !this.editTechStack
            this.techList = this.channelService.techList
            this.techList.forEach((item) => {
                item.item_status = false
                this.channelService.currentChannel.techStack.forEach((selected) => {
                    if (selected == item.item_text) {
                        item.item_status = true
                    }
                })
            })
        }
    }

    async techStackUpdate() {
        this.techStack = this.techList.filter(item => item.item_status).map(item => item.item_text)
        let channel = await this.channelService.updateChannelInfo({
            channelId: this.channelService.currentChannel._id,
            description: this.description,
            thumbnail: this.thumbnail,
            techStack: this.techStack,
            tags: this.tags,
            isPrivate: this.isPrivate,
            userId: this.channelService.currentChannel.user
        })
        this.editTechStack = !this.editTechStack
        this.channelService.currentChannel.techStack = channel.techStack
        this.socket.emitChannelUpdate(channel)
    }

    setTechStatus() {
        this.techStackVal['checked'] = true
    }

    toggleStatus(event, item) {
        const tempTechList = this.techList.filter((x) => x.item_status)
        if (
            (!item.item_status && tempTechList.length > 3) ||
            (item.item_status && tempTechList.length < 2)
        ) {
            event.preventDefault()
        } else {
            var tech = this.techList.find((tech) => tech.item_text == item.item_text)
            tech.item_status = !tech.item_status
        }
    }

    removeTech(tech) {
        const tempTechList = this.techList.filter((x) => x.item_status)
        if (tempTechList.length > 1) {
            tech.item_status = false
        }
    }

    toggleTagsEdit() {
        if (this.isOwner) {
            this.editTags = !this.editTags
            this.tempTags = []
            this.channelService.currentChannel.tags.forEach((tag) => this.tempTags.push(tag))
        }
    }

    removeTag(tag: string) {
        const index = this.tempTags.indexOf(tag)
        if (this.tempTags.length > 1 && index >= 0) {
            this.tempTags.splice(index, 1)
        }
    }

    add(event: MatChipInputEvent): void {
        const input = event.input
        const value = event.value
        // Add our tags
        if ((value || '').trim() && this.tempTags.length < 3) {
            this.tempTags.push(value.trim())
        }
        // Reset the input value
        if (input) {
            input.value = ''
        }
        this.tagCtrl.setValue(null)
    }

    addTags(value) {
        if ((value || '').trim() && this.tempTags.length < 3) {
            this.tempTags.push(value.trim())
        }
    }

    async tagsUpdate() {
        this.tags = []
        this.tempTags.forEach((tag) => this.tags.push(tag.trim()))
        let channel = await this.channelService.updateChannelInfo({
            channelId: this.channelService.currentChannel._id,
            description: this.description,
            thumbnail: this.thumbnail,
            techStack: this.techStack,
            tags: this.tags,
            isPrivate: this.isPrivate,
            userId: this.channelService.currentChannel.user
        })
        this.editTags = !this.editTags
        this.channelService.currentChannel.tags = channel.tags
        this.socket.emitChannelUpdate(channel)
    }
}
