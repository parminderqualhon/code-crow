import { HttpClient } from '@angular/common/http'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Injectable } from '@angular/core'
import { PaymentService } from './payment.service'
import { AuthService } from '../auth/auth.service'
import { environment } from '../../environments/environment'
import { lastValueFrom } from 'rxjs'

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

    async getUserById(userId): Promise<any> {
        return await lastValueFrom(this.http.get(`${environment.apiUrl}/users?userId=${userId}`, {}))
    }

    async getUsersByIds(userIds: Array<string>): Promise<any> {
        return await lastValueFrom(this.http.post(`${environment.apiUrl}/users/search/ids`, { userIds }))
    }

    async getUsersByName(name): Promise<any> {
        return await lastValueFrom(this.http
            .get(`${environment.apiUrl}/users/search/name`, { params: { name } }))
    }

    async getUserByCustomUsername({ customUsername }): Promise<any> {
        return await lastValueFrom(this.http
            .get(`${environment.apiUrl}/users/search/custom-username`, { params: { customUsername } }))
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

    async updateUser(body) {
        const userUpdate = await lastValueFrom(this.http
            .patch(`${environment.apiUrl}/users/current`, body))
        this.authService.setUser(userUpdate)
    }

    async updateAvatar({ fileToUpload, fileName }) {
        const formData: FormData = new FormData()
        formData.append('file', fileToUpload, fileName)
        formData.append('bucketName', 'avatars')
        const userUpdate = await lastValueFrom(this.http
            .put(`${environment.apiUrl}/users/current/avatar`, formData))
        this.authService.setUser(userUpdate)
    }

    async updateCustomUsername({ customUsername }) {
        const userUpdate: any = await lastValueFrom(this.http
            .patch(`${environment.apiUrl}/users/current/custom-username`, {
                customUsername
            }))
        if (!userUpdate.exists) {
            this.authService.setUser(userUpdate)
        }
        return userUpdate
    }

    showError() {
        this.snackBar.open('An error has occured, please try again later', null, {
            duration: 2000
        })
    }

    showSnackBar(message: string, duration: number) {
        this.snackBar.open(message, null, { duration: duration })
    }
}
