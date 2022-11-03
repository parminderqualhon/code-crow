import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    OnDestroy,
    OnInit
} from '@angular/core'
import { MatMenuTrigger } from '@angular/material/menu'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
    selector: 'app-tech-stack-dropdown',
    templateUrl: './tech-stack-dropdown.component.html',
    styleUrls: ['./tech-stack-dropdown.component.scss']
})
export class TechStackDropdownComponent {
    @Input() list: any[]
    @Input() menuTrigger: MatMenuTrigger
    // @Input() alreadyAddedTechStacks: any[]
    @ViewChild('input', { static: false }) input: ElementRef
    @Output() shareIndividualCheckedList = new EventEmitter()
    @Output() shareKeyword = new EventEmitter()
    @Output() submitTechStack = new EventEmitter()
    @Input() checkedList: any[]
    searchQuery: any

    constructor(private snackBar: MatSnackBar) {}

    // check if tech stack is already added to the profile
    checkIfAlreadySelected(tech: string) {
        return this.checkedList?.findIndex((el) => el.item_text === tech) > -1 ? true : false
    }

    // getSelectedValue(status: Boolean, text: String, src: String) {
    //     if (status) {
    //         if (this.checkedList.length < 4) {
    //             this.checkedList.push({ item_status: status, item_text: text, item_image: src, })
    //         }
    //     } else {
    //         var index = this.checkedList.findIndex(tech => tech.item_text === text)
    //         this.checkedList.splice(index, 1)
    //     }
    //     this.shareIndividualStatus(this.checkedList)
    // }

    getSelectedValue(event: any, text: String, src: String) {
        // create a copy of array so original tech stack array doesn't get affected
        let tempCheckedList = [...this.checkedList]
        // check if checkbox is checked or unchecked
        if (event.target.checked) {
            // check if already 4 techstacks are selected
            if (tempCheckedList.length < 4) {
                tempCheckedList.push({ item_text: text, item_image: src })
                this.checkedList = [...tempCheckedList]
                event.target.checked = true
            } else {
                // uncheck checkbox because already 4 techs are selected
                event.target.checked = false
                this.snackBar.open("You can't select more than 4 tech stack", null, {
                    duration: 1500
                })
            }
        } else {
            let index = tempCheckedList.findIndex((tech) => tech.item_text === text)
            tempCheckedList.splice(index, 1)
            this.checkedList = [...tempCheckedList]
            return false
        }
        // this.shareIndividualStatus(this.checkedList)
    }

    onClick(event, status: Boolean) {
        if (!status && this.checkedList.length > 3) {
            event.preventDefault()
        }
    }

    shareIndividualStatus(checkedList: any[]) {
        this.shareIndividualCheckedList.emit(checkedList)
    }

    search(searchQuery: string) {
        this.shareKeyword.emit(searchQuery)
    }

    stopPropagation = (event: any) => {
        event.stopPropagation()
    }

    onSubmitTechStack() {
        if (!this.checkedList.length) {
            this.snackBar.open('Please select at least one technology', null, {
                duration: 5000
            })
            return
        }
        this.submitTechStack.emit(this.checkedList)
        this.menuTrigger?.closeMenu()
    }

    onCancel() {
        this.menuTrigger?.closeMenu()
    }

    onRemoveTechStack(item: any) {
        let tempCheckedList = [...this.checkedList]
        let techIndex = tempCheckedList.findIndex((tech) => tech.item_text == item.item_text)
        if (techIndex > -1) {
            tempCheckedList.splice(techIndex, 1)
            this.checkedList = [...tempCheckedList]
        }
    }

    onRemoveAllFilters() {
        let tempCheckedList = [...this.checkedList]
        tempCheckedList = []
        this.checkedList = [...tempCheckedList]
    }

    trackByMethod(index: number, el: any): number {
        return el.id
    }
}
