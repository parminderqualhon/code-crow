import { Injectable } from '@angular/core'

const JWT_KEY = 'jwt'
const THEME_KEY = 'theme'

@Injectable({
    providedIn: 'root'
})
export class TokenStorage {
    constructor() {}

    signOut() {
        localStorage.clear()
    }

    public saveJWT(jwt: string) {
        localStorage.setItem(JWT_KEY, jwt)
    }

    public saveUserId(userId: string) {
        localStorage.setItem('userId', userId)
    }

    public saveTheme(theme) {
        if (!theme) {
            return
        }
        localStorage.setItem(THEME_KEY, theme)
    }

    getAuthenticatedStatus(): boolean {
        if (localStorage.getItem(JWT_KEY)) return true
        else return false
    }

    public getTheme() {
        return localStorage.getItem(THEME_KEY)
    }
}
