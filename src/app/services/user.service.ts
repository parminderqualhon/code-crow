import { HttpClient } from '@angular/common/http'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Injectable } from '@angular/core'
import { PaymentService } from './payment.service'
import { AuthService } from '../auth/auth.service'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class UserService {
    public isSubscribed: boolean
    public plan: any
    public metadata: []
    public isUsersEnabled: boolean = false
    public searchQuery: string = ''

    constructor(
        private snackBar: MatSnackBar,
        private http: HttpClient,
        private authService: AuthService
    ) {}

    getUserById(userId): Promise<any> {
        return this.http.get(`${environment.apiUrl}/users?userId=${userId}`, {}).toPromise()
    }

    getUsersByIds(userIds: Array<string>): Promise<any> {
        return this.http.post(`${environment.apiUrl}/users/search/ids`, { userIds }).toPromise()
    }

    getUsersByName(name): Promise<any> {
        return this.http
            .get(`${environment.apiUrl}/users/search/name`, { params: { name } })
            .toPromise()
    }

    getUserByCustomUsername(customUsername): Promise<any> {
        return this.http
            .get(
                `${environment.apiUrl}/users/search/custom-username?customUserName=${customUsername}`
            )
            .toPromise()
    }

    // async getPlan() {
    // 	try {
    // 		const user = await this.getUser()
    // 		if (user) {
    // 			this.customerId = user.customerId
    // 			const customer: any = await this.paymentService.stripeGetCustomer(this.customerId)
    // 			if (customer && customer.subscriptions.data.length) { // Check if subscribed via Stripe
    // 				this.plan = customer.subscriptions.data[0]
    // 				this.plan.subscriptionId = this.plan.plan.id
    // 				this.isSubscribed = true
    // 				this.plan.metadata = this.plan.plan.metadata.features.split(",")
    // 				this.plan.sources = customer.sources.data
    // 				this.plan.planAmount = (this.plan.plan.amount > 0 ? this.plan.plan.amount / 100 : 0) + ".00"
    // 			}
    // 			return this.plan
    // 		}
    // 	} catch (e) {
    // 		console.log(e)
    // 	}
    // }

    // async getPlusPlan() {
    // 	const plans: any = await this.paymentService.stripeGetPrices({ active: true })
    // 	plans.data.forEach((plan) => {
    // 		if (plan.nickname == 'Plus') {
    // 			this.metadata = plan.metadata.features.split(",")
    // 		}
    // 	})
    // }

    showError() {
        this.snackBar.open('An error has occured, please try again later', null, {
            duration: 2000
        })
    }

    showSnackBar(message: string, duration: number) {
        this.snackBar.open(message, null, { duration: duration })
    }

    async updateIsEmailNotificationsEnabled(isEnabled) {
        const userUpdate = await this.http
            .patch(`${environment.apiUrl}/users/current/email-notifications`, {
                isEnabled
            })
            .toPromise()
        this.authService.setUser(userUpdate)
    }

    async updateIsWebNotificationsEnabled(isEnabled) {
        const userUpdate = await this.http
            .patch(`${environment.apiUrl}/users/current/web-notifications`, {
                isEnabled
            })
            .toPromise()
        this.authService.setUser(userUpdate)
    }

    async updateIsDoNotDisturbEnabled(isEnabled) {
        const userUpdate = await this.http
            .patch(`${environment.apiUrl}/users/current/do-not-disturb`, {
                isEnabled
            })
            .toPromise()
        this.authService.setUser(userUpdate)
    }

    async updateIsMessageGuardEnabled(isEnabled) {
        const userUpdate = await this.http
            .patch(`${environment.apiUrl}/users/current/message-guard`, { isEnabled })
            .toPromise()
        this.authService.setUser(userUpdate)
    }

    async updateIsOnline(isOnline) {
        const userUpdate = await this.http
            .patch(`${environment.apiUrl}/users/current/online`, { isOnline })
            .toPromise()
        this.authService.setUser(userUpdate)
    }

    async updateEmail(email: string) {
        const userUpdate = await this.http
            .patch(`${environment.apiUrl}/users/current/email`, { email })
            .toPromise()
        this.authService.setUser(userUpdate)
    }

    async updateWalletAddress(walletAddress: string) {
        const userUpdate = await this.http
            .patch(`${environment.apiUrl}/users/current/wallet-address`, {
                walletAddress
            })
            .toPromise()
        this.authService.setUser(userUpdate)
    }

    async updateWebNotificationSubscription({ sub, userId }) {
        const userUpdate = await this.http
            .patch(`${environment.apiUrl}/users/current/notification`, {
                sub,
                userId
            })
            .toPromise()
        this.authService.setUser(userUpdate)
    }

    async updateAvatar({ fileToUpload, fileName }) {
        const formData: FormData = new FormData()
        formData.append('file', fileToUpload, fileName)
        formData.append('bucketName', 'avatars')
        const userUpdate = await this.http
            .put(`${environment.apiUrl}/users/current/avatar`, formData)
            .toPromise()
        this.authService.setUser(userUpdate)
    }

    async updateDisplayName({ displayName }) {
        const userUpdate = await this.http
            .patch(`${environment.apiUrl}/users/current/display-name`, {
                displayName
            })
            .toPromise()
        this.authService.setUser(userUpdate)
    }

    async updateCustomUsername({ customUsername }) {
        const userUpdate: any = await this.http
            .patch(`${environment.apiUrl}/users/current/custom-username`, {
                customUsername
            })
            .toPromise()
        if (!userUpdate.exists) {
            this.authService.setUser(userUpdate)
        }
        return userUpdate
    }

    async updateTeckStack({ techStack }) {
        const userUpdate = await this.http
            .patch(`${environment.apiUrl}/users/current/tech-stack`, { techStack })
            .toPromise()
        this.authService.setUser(userUpdate)
    }

    async updateDescription({ description }) {
        const userUpdate = await this.http
            .patch(`${environment.apiUrl}/users/current/description`, { description })
            .toPromise()
        this.authService.setUser(userUpdate)
    }
}
