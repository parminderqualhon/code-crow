import { EventEmitter, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    public paymentMethodRemovedEmitter: EventEmitter<any> = new EventEmitter<any>()
    public paymentSubscriptionRemovedEmitter: EventEmitter<any> = new EventEmitter<any>()
    public isAddCardEnabled: boolean = false

    constructor(private http: HttpClient) {}

    //Customer

    public stripeCreateCustomer(): Promise<any> {
        return this.http.post(`${environment.apiUrl}/payments/stripe/customer`, {}).toPromise()
    }

    public stripeGetCustomer(): Promise<any> {
        return this.http.get(`${environment.apiUrl}/payments/stripe/customer`, {}).toPromise()
    }

    public stripeUpdateCustomerPaymentMethod({ paymentMethodId }): Promise<any> {
        return this.http
            .patch(`${environment.apiUrl}/payments/stripe/customer/payment-method`, {
                paymentMethodId
            })
            .toPromise()
    }

    //SetupIntent and PaymentIntent

    public stripeCreateSetupIntent(): Promise<any> {
        return this.http.post(`${environment.apiUrl}/payments/stripe/setup-intent`, {}).toPromise()
    }

    public stripeGetPaymentMethods(): Promise<any> {
        return this.http
            .get(`${environment.apiUrl}/payments/stripe/payment-methods`, {})
            .toPromise()
    }

    public stripeDeletePaymentMethod({ paymentMethodId }): Promise<any> {
        return this.http
            .delete(`${environment.apiUrl}/payments/stripe/payment-methods/${paymentMethodId}`, {})
            .toPromise()
    }

    public stripeCreatePaymentIntent({ paymentMethodId, receiverAccountId, amount }): Promise<any> {
        return this.http
            .post(`${environment.apiUrl}/payments/stripe/payment-intent`, {
                paymentMethodId,
                receiverAccountId,
                amount
            })
            .toPromise()
    }

    //Connect Account

    public stripeCreateAccount(): Promise<any> {
        return this.http
            .post(`${environment.apiUrl}/payments/stripe/connect/account`, {})
            .toPromise()
    }

    public stripeCreateAccountLink({ accountId, refreshAndReturnUrl }): Promise<any> {
        return this.http
            .post(`${environment.apiUrl}/payments/stripe/connect/account/link`, {
                accountId,
                refreshAndReturnUrl
            })
            .toPromise()
    }

    public stripeGetAccount(): Promise<any> {
        return this.http
            .get(`${environment.apiUrl}/payments/stripe/connect/account`, {})
            .toPromise()
    }

    public stripeDeleteAccount(): Promise<any> {
        return this.http
            .delete(`${environment.apiUrl}/payments/stripe/connect/account`, {})
            .toPromise()
    }

    // public getStreamTime() {
    //   return this.http.get(`${environment.apiUrl}/streamTime/user`).toPromise()
    // }

    // public createStreamTime({ purchasedMinutes, allowedParticipants, productId, chargeId, userId }) {
    //   return this.http.post(`${environment.apiUrl}/streamTime`, { purchasedMinutes, allowedParticipants, productId, chargeId, userId }).toPromise()
    // }

    // public updateStreamTime({ purchasedMinutes, allowedParticipants, productId, chargeId, userId }) {
    //   return this.http.patch(`${environment.apiUrl}/streamTime/update`, { purchasedMinutes, allowedParticipants, productId, chargeId, userId }).toPromise()
    // }

    // public async pay(token, amount) {
    // const { email }= this.authService.currentUser

    // return this.http.post(`${environment.apiUrl}/payments/stripe/pay`, { token, amount, email }).toPromise()
    // }

    // public stripeGetSkus(query) {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/skus`, { params: query }).toPromise()
    // }

    // public stripeGetProducts() {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/products`).toPromise()
    // }

    // public stripeCreateCharge({ source, amount, description, customer }) {
    //   return this.http.post(`${environment.apiUrl}/payments/stripe/charges`, { source, amount, description, customer }).toPromise()
    // }

    // public stripeGetProduct(productId) {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/products/${productId}`).toPromise()
    // }

    // public stripeGetProductSkus(productId) {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/products/${productId}/skus`).toPromise()
    // }

    // public stripeGetPrices(query = {}) {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/prices`, { params: query }).toPromise()
    // }

    // public stripeGetPrice(priceId) {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/prices/${priceId}`).toPromise()
    // }

    // public stripeGetCharges() {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/charges`).toPromise()
    // }

    // public stripeGetCharge(chargeId) {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/charges/${chargeId}`).toPromise()
    // }

    // public stripeGetRefunds() {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/refunds`).toPromise()
    // }

    // public stripeGetRefund(refundId) {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/refunds/${refundId}`).toPromise()
    // }

    // public stripeGetSubscriptions() {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/subscriptions`).toPromise()
    // }

    // public stripeGetSubscription(subscriptionId) {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/subscriptions/${subscriptionId}`).toPromise()
    // }

    // public stripeGetCustomers() {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/customers`).toPromise()
    // }

    // public stripeGetSKU(skuId) {
    //   return this.http.get(`${environment.apiUrl}/payments/stripe/skus/${skuId}`).toPromise()
    // }

    // public stripeCreateCustomerSource({ customerId, token }) {
    //   return this.http.post(`${environment.apiUrl}/payments/stripe/customers/sources`, { customerId, token }).toPromise()
    // }

    // public stripePayInvoice(invoiceId, { source }) {
    //   return this.http.post(`${environment.apiUrl}/payments/stripe/invoices/${invoiceId}/pay`, { source }).toPromise()
    // }

    // public stripeCreateProduct({ name, type, attributes, caption, description }) {
    //   return this.http.post(`${environment.apiUrl}/payments/stripe/products', { name, type, attributes, caption, description }).toPromise()
    // }

    // public stripeCreateSKU({ price, product, attributes }) {
    //   return this.http.post(`${environment.apiUrl}/payments/stripe/skus', { price, product, attributes }).toPromise()
    // }

    // public stripeCreatePrice({ amount, product, interval, interval_count, active, trial_period_days }) {
    //   return this.http.post(`${environment.apiUrl}/payments/stripe/prices', { amount, product, interval, interval_count, active, trial_period_days }).toPromise()
    // }

    // public stripeUpdatePrice(priceId, { active }) {
    //   return this.http.patch(`${environment.apiUrl}/payments/stripe/prices/${priceId}`, { active }).toPromise()
    // }

    // public stripeCreateRefund({ charge, amount, reason }) {
    //   return this.http.post(`${environment.apiUrl}/payments/stripe/refunds', { charge, amount, reason }).toPromise()
    // }

    // public stripeCreateSubscription({ priceId, customerId, autoCharge }) {
    //   const collection_method = autoCharge ? 'charge_automatically' : 'send_invoice'
    //   return this.http.post(`${environment.apiUrl}/payments/stripe/subscriptions', { priceId, customerId, collection_method }).toPromise()
    // }

    // public stripeDeleteSKU(skuId) {
    //   return this.http.delete(`${environment.apiUrl}/payments/stripe/skus/${skuId}`).toPromise()
    // }

    // public stripeDeleteProduct(productId) {
    //   return this.http.delete(`${environment.apiUrl}/payments/stripe/products/${productId}`).toPromise()
    // }

    // public stripeDeletePrice(priceId) {
    //   return this.http.delete(`${environment.apiUrl}/payments/stripe/prices/${priceId}`).toPromise()
    // }

    // public stripeDeleteSubscription(subscriptionId) {
    //   return this.http.delete(`${environment.apiUrl}/payments/stripe/subscriptions/${subscriptionId}`).toPromise()
    // }

    // public stripeSetDefaultCard(customerId, default_source) {
    //   return this.http.patch(`${environment.apiUrl}/payments/stripe/customers/set-default-card`, { customerId, default_source }).toPromise()
    // }

    // public stripeDeleteSource(customerId, sourceId) {
    //   return this.http.post(`${environment.apiUrl}/payments/stripe/customers/sources/delete`, { customerId, sourceId }).toPromise()
    // }
}
