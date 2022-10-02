import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core'

@Component({
    selector: 'app-multi-select-dropdown',
    templateUrl: './multi-select-dropdown.component.html',
    styleUrls: ['./multi-select-dropdown.component.scss']
})
export class MultiSelectDropdownComponent {
    @Input() list: any[]
    @ViewChild('input', { static: false }) input: ElementRef
    @Output() shareIndividualCheckedList = new EventEmitter()
    @Output() shareKeyword = new EventEmitter()
    showDropDown = false
    focus = false
    hover = false
    checkedList: any[]
    keyword: any

    constructor() {
        this.checkedList = []
    }

    getSelectedValue(status: Boolean, text: String, src: String) {
        if (status) {
            if (this.checkedList.length < 4) {
                this.checkedList.push({
                    item_status: status,
                    item_text: text,
                    item_image: src
                })
            }
        } else {
            var index = this.checkedList.findIndex((tech) => tech.item_text === text)
            this.checkedList.splice(index, 1)
        }
        this.shareIndividualStatus(this.checkedList)
    }

    onClick(event, status: Boolean) {
        if (!status && this.checkedList.length > 3) {
            event.preventDefault()
        }
    }

    shareIndividualStatus(checkedList) {
        this.shareIndividualCheckedList.emit(checkedList)
    }

    search(e) {
        this.shareKeyword.emit(e)
    }
}
