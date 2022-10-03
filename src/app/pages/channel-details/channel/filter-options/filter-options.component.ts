import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { ChannelService } from '../../../../services/channel.service'
import { Util } from '../../../../util/util'

@Component({
    selector: 'app-filter-options',
    templateUrl: './filter-options.component.html',
    styleUrls: ['./filter-options.component.scss'],
    animations: Util.inOutAnimation
})
export class FilterOptionsComponent implements OnInit {
    searchText = ''
    public filterChannelForm: FormGroup
    public techList = []
    public hasTempFilters: boolean = false
    clickedOutsideCount: any = 0
    private selectedTech: any = []

    constructor(private fb: FormBuilder, public channelService: ChannelService) {}

    ngOnInit() {
        this.channelService.filterChannelDialogBehavior.subscribe(async (data) => {
            if (data && data.isOpen) {
                this.filterChannelForm = this.fb.group({ techStack: '' })
                this.selectedTech = this.channelService.isAddChannelEnabled ? data.selectedTech : []
                this.initFilterList()
            }
        })
    }

    incrementClickOutsideCount() {
        ++this.clickedOutsideCount
        if (this.clickedOutsideCount > 0) {
            this.onNoClick()
            this.clickedOutsideCount = 0
        }
    }

    toggleStatus(event, item, index) {
        if (this.channelService.isAddChannelEnabled) {
            if (!item.item_status && this.selectedTech.length > 3) {
                event.preventDefault()
            } else {
                item.item_status = !item.item_status
                item.item_status ? this.selectedTech.push(item) : this.selectedTech.splice(index, 1)
                this.hasTempFilters = this.selectedTech.length > 0
            }
        } else {
            item.item_status = !item.item_status
            item.item_status ? this.selectedTech.push(item) : this.selectedTech.splice(index, 1)
            this.hasTempFilters = this.selectedTech.length > 0
        }
    }

    initFilterList() {
        this.hasTempFilters = !this.channelService.isAddChannelEnabled
            ? this.channelService.hasFilters
            : false
        this.techList = this.channelService.techList
        this.techList.forEach((item) => {
            item.item_status = false
            if (!this.channelService.isAddChannelEnabled) {
                this.channelService.filterTechList.forEach((selected) => {
                    if (selected.item_text == item.item_text) {
                        item.item_status = true
                    }
                })
            } else {
                this.selectedTech.forEach((selected) => {
                    if (selected.item_text == item.item_text) {
                        item.item_status = true
                    }
                })
                this.hasTempFilters = this.selectedTech.length > 0
            }
        })
    }

    onNoClick() {
        this.channelService.isFilterChannelEnabled = false
        this.selectedTech = []
        this.hasTempFilters = false
    }

    removeFilters() {
        this.techList.forEach((item) => (item.item_status = false))
        this.hasTempFilters = false
        this.selectedTech = []
    }

    async filterChannels() {
        this.channelService.filterTechList = []
        this.techList.forEach((item) => {
            if (item.item_status) {
                this.channelService.filterTechList.push(Object.assign({}, item))
            }
        })
        const channels = await this.channelService.searchChannels()
        this.channelService.channelsBehavior.next(channels)
        this.channelService.hasFilters = this.techList.some((item) => item.item_status)
        this.incrementClickOutsideCount()
    }

    submitChannels() {
        this.channelService.addTechListBehavior.next(this.selectedTech)
        this.incrementClickOutsideCount()
    }
}
