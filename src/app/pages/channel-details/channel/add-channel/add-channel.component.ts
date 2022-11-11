import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { MatChipInputEvent } from '@angular/material/chips'
import { ChannelService } from '../../../../services/channel.service'
import { ChatService } from '../../../../services/chat.service'
import { TagsService } from '../../../../services/tags.service'
import { Util } from '../../../../util/util'
import { AuthService } from '../../../../auth/auth.service'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
    selector: 'app-add-channel',
    templateUrl: './add-channel.component.html',
    styleUrls: ['./add-channel.component.scss'],
    animations: Util.inOutAnimation
})
export class AddChannelComponent implements OnInit {
    @ViewChild('fileInput') fileInput: ElementRef
    public error: any = {}
    public addChannelForm: FormGroup
    separatorKeysCodes: number[] = [ENTER, COMMA]
    thumbnail: any
    file: File
    tags: any = []
    selectedTags: string[] = []
    selectedTech: any = []
    public submitted = false
    clickedOutsideCount = 0

    constructor(
        private router: Router,
        public chatService: ChatService,
        public channelService: ChannelService,
        private tagsService: TagsService,
        private fb: FormBuilder,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) {}

    async ngOnInit() {
        this.channelService.addChannelDialogBehavior.subscribe(async (data) => {
            if (data) {
                this.tags = await this.tagsService.getTags()
            }
        })
        this.addChannelForm = this.fb.group({
            title: [null, Validators.required],
            description: [null, Validators.required],
            tags: [null, Validators.required],
            isPrivate: [null]
        })
        this.channelService.addTechListBehavior.subscribe(async (selectedTech) => {
            this.selectedTech = selectedTech
        })
    }

    incrementClickOutsideCount() {
        ++this.clickedOutsideCount
        if (this.clickedOutsideCount > 0) {
            this.onNoClick()
            this.clickedOutsideCount = 0
        }
    }

    onNoClick() {
        this.channelService.isAddChannelEnabled = false
        this.selectedTech = []
    }

    add(event: MatChipInputEvent): void {
        const input = event.input
        const value = event.value
        if ((value || '').trim() && this.selectedTags.length < 3) {
            this.selectedTags.push(value.trim())
            this.addChannelForm.get('tags').setValue(this.selectedTags)
        }
        if (input) {
            input.value = ''
        }
    }

    addTags(value) {
        if ((value || '').trim() && this.selectedTags.length < 3) {
            this.selectedTags.push(value.trim())
            this.addChannelForm.get('tags').setValue(this.selectedTags)
        }
    }

    removeTech(value) {
        const selectedTextIndex = this.selectedTech.findIndex((item) => item.item_text === value)
        this.selectedTech.splice(selectedTextIndex, 1)
    }

    removeTag(tag: string) {
        const index = this.selectedTags.indexOf(tag)
        if (index >= 0) {
            this.selectedTags.splice(index, 1)
            this.addChannelForm.get('tags').setValue(this.selectedTags)
        }
    }

    onFileSelected() {
        const inputNode = this.fileInput.nativeElement
        const fileSize = inputNode.files[0].size / 1024 / 1024
        if (['image/jpeg', 'image/png'].includes(inputNode.files[0].type)) {
            if (fileSize <= 5) {
                if (typeof FileReader !== 'undefined') {
                    const reader = new FileReader()

                    reader.onload = (e: any) => {
                        this.thumbnail = e.target.result
                    }

                    reader.readAsDataURL(inputNode.files[0])
                    this.file = inputNode.files[0]
                }
            } else {
                this.snackBar.open('Max file size exceeded (5 MB)', null, {
                    duration: 5000
                })
                this.fileInput.nativeElement.value = ''
            }
        } else {
            this.snackBar.open('Unsupported file type', null, {
                duration: 5000
            })
            this.fileInput.nativeElement.value = ''
        }
    }

    async addChannel() {
        this.submitted = true
        this.addChannelForm.markAllAsTouched()
        if (
            this.addChannelForm.valid &&
            this.selectedTags.length > 0 &&
            this.selectedTech.length > 0
        ) {
            const user = this.authService.currentUser
            try {
                for (let val of this.selectedTags) {
                    await this.tagsService.createTag({ name: val, isAllowed: false })
                }
                const { location: thumbnailUrl } = this.file
                    ? await this.chatService.postFile('thumbnail', this.file)
                    : { location: null }
                const channel = await this.channelService.createChannel(
                    this.addChannelForm.value.title,
                    this.addChannelForm.value.description,
                    thumbnailUrl,
                    this.selectedTech.map((item) => item.item_text),
                    this.selectedTags,
                    this.addChannelForm.value.isPrivate,
                    user,
                    'channel'
                )
                this.onNoClick()
                this.router.navigate(['/channel', channel._id])
            } catch (err) {
                this.error = {
                    message: 'An error occurred, please try refreshing the page!'
                }
            }
        } else {
            this.error = {
                message: 'Please fill in all required fields.'
            }
        }
    }

    showFilterDialog() {
        this.channelService.isFilterChannelEnabled = true
        this.channelService.filterChannelDialogBehavior.next({
            isOpen: true,
            selectedTech: this.selectedTech
        })
    }
}
