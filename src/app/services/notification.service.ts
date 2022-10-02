import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    public notifications: any = []
    constructor(private http: HttpClient) {}

    public sendEmail(subject, message, name, email, isContact): Promise<any> {
        return this.http
            .post(`${environment.apiUrl}/email/send`, {
                subject,
                message,
                name,
                email,
                isContact
            })
            .toPromise()
    }

    public sendEmails({ subject, message, name, userIds, url }): Promise<any> {
        return this.http
            .post(`${environment.apiUrl}/email/send-many`, {
                subject,
                message,
                name,
                userIds,
                url
            })
            .toPromise()
    }

    public sendWebNotifications({ body, title, userIds }): Promise<any> {
        return this.http
            .post(`${environment.apiUrl}/notifications/send-many`, {
                body,
                title,
                userIds
            })
            .toPromise()
    }
}
