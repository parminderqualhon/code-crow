import { Injectable, EventEmitter } from '@angular/core'
import { Subscription } from 'rxjs/internal/Subscription'

@Injectable({
    providedIn: 'root'
})
export class SharedService {
    refreshGroupListEvent = new EventEmitter()
    subsVar: Subscription
    wasHomePressed: boolean = false

    isLoginPage: boolean = true

    constructor() {}

    refreshGroupList() {
        this.refreshGroupListEvent.emit()
    }
}
