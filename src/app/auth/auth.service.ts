import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { TokenStorage } from './token.storage'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(public http: HttpClient, private tokenStorage: TokenStorage) {}

    public currentUser: any = false
    private userPromise: any

    logout() {
        const user = this.currentUser
        this.setUser(null)
        this.tokenStorage.signOut()
        window.location.href = '/'
    }

    setJWT(jwt) {
        this.tokenStorage.saveJWT(jwt)
    }

    setUserId(userId) {
        this.tokenStorage.saveUserId(userId)
    }

    setUser(user) {
        if (!user) {
            this.tokenStorage.signOut()
        }
        this.currentUser = user
    }

    me(): Promise<any> {
        if (this.currentUser || this.userPromise) return this.currentUser || this.userPromise
        this.userPromise = this.http
            .get(`${environment.apiUrl}/auth/me`, {
                headers: {
                    Authorization: localStorage.getItem('jwt'),
                    userId: localStorage.getItem('userId')
                }
            })
            .toPromise()
            .then((res) => {
                this.setUser(res['user'])
                if (res['freshJwt']) this.setJWT(res['freshJwt'])
                return res['user'][0]
            })
            .catch((e) => {
                if (e.status === 401 || e.includes('Error')) this.logout()
                return null
            })
            .finally(() => (this.userPromise = null))
        return this.userPromise
    }
}
