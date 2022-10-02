import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Injectable } from '@angular/core'
import { AuthService } from '../auth/auth.service'

@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('jwt')
        const clonedRequest = request.clone({
            headers: token ? request.headers.set('Authorization', token) : request.headers
        })
        // return next.handle(clonedRequest)

        return Observable.create((observer) => {
            const subscription = next.handle(clonedRequest).subscribe(
                (event) => observer.next(event),
                (err) => {
                    if (err.status == 401) {
                        this.authService.logout()
                    }
                    observer.error(err)
                },
                () => {
                    observer.complete()
                }
            )
            return () => {
                subscription.unsubscribe()
            }
        })
    }
}
