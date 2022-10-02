import { Inject, Injectable } from '@angular/core'
import { DOCUMENT } from '@angular/common'

@Injectable({ providedIn: 'root' })
export class StyleManagerService {
    constructor(@Inject(DOCUMENT) public doc) {}

    /**
     * Set the stylesheet with the specified key.
     */
    setStyle(key: string, href: string) {
        this.getLinkElementForKey(key).setAttribute('href', href)
    }

    /**
     * Remove the stylesheet with the specified key.
     */
    removeStyle(key: string) {
        const existingLinkElement = this.getExistingLinkElementByKey(key)
        if (existingLinkElement) {
            this.doc.head.removeChild(existingLinkElement)
        }
    }

    getLinkElementForKey(key: string) {
        return this.getExistingLinkElementByKey(key) || this.createLinkElementWithKey(key)
    }

    getClassNameForKey(key: string) {
        return `app-${key}`
    }
    getExistingLinkElementByKey(key: string) {
        return this.doc.head.querySelector(`link[rel="stylesheet"].${this.getClassNameForKey(key)}`)
    }

    createLinkElementWithKey(key: string) {
        const linkEl = this.doc.createElement('link')
        linkEl.setAttribute('rel', 'stylesheet')
        linkEl.classList.add(this.getClassNameForKey(key))
        this.doc.head.appendChild(linkEl)
        return linkEl
    }
}
