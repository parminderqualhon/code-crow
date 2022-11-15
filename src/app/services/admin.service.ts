import { Injectable, EventEmitter } from '@angular/core'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { Socket } from './socket.service'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    constructor(public socket: Socket, private http: HttpClient) {}

    public uploadFile(file: File, url: string): Observable<any> {
        const headers: HttpHeaders = new HttpHeaders({
            'x-amz-acl': 'public-read',
            'Content-Type': file.type
        })
        return this.http
            .put(url, file, { headers, reportProgress: true, observe: 'events' })
            .pipe(catchError(this.errorMgmt))
    }

    public getUserRole(): Promise<any> {
        return this.http.get(`${environment.apiUrl}/roles/role-mapping`).toPromise()
    }

    public getRoles(): Promise<any> {
        return this.http.get(`${environment.apiUrl}/roles`).toPromise()
    }

    public getAdmins(roleId: string): Promise<any> {
        return this.http.get(`${environment.apiUrl}/roles/users?roleId=${roleId}`).toPromise()
    }

    public addAdmin(userId: string, roleId: string): Promise<any> {
        return this.http
            .post(`${environment.apiUrl}/roles/role-mapping`, { roleId, userId })
            .toPromise()
    }

    public removeAdmin(userId: string, roleId: string): Promise<any> {
        return this.http
            .patch(`${environment.apiUrl}/roles/role-mapping`, { roleId, userId })
            .toPromise()
    }

    public getUploadURL(fileName, fileType, bucketName): Promise<any> {
        return this.http
            .put(`${environment.apiUrl}/attachments/url`, {
                fileName,
                fileType,
                bucketName
            })
            .toPromise()
    }

    public getVideos(filter = '', sortOrder = 'asc', pageNumber = 0, pageSize = 5): Promise<any> {
        return this.http
            .get(
                `${environment.apiUrl}/videos?admin=1&filter=${filter}&skip=${pageNumber}&limit=${pageSize}&sort=${sortOrder}`
            )
            .toPromise()
    }

    public getAllVideos(): Promise<any> {
        return this.http.get(`${environment.apiUrl}/videos/all?admin=1`).toPromise()
    }

    public getChannels(): Promise<any> {
        return this.http.get(`${environment.apiUrl}/channels`).toPromise()
    }

    public getChannelLiveStreams(id): Promise<any> {
        return this.http
            .get(`${environment.apiUrl}/channels/live-streams?channelId=${id}`)
            .toPromise()
    }

    public getMonthLiveStreaming(): Promise<any> {
        return this.http.get(`${environment.apiUrl}/streams/`).toPromise()
    }

    errorMgmt(error: HttpErrorResponse) {
        let errorMessage = ''
        if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message
        } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`
        }
        console.log(errorMessage)
        return throwError(throwError)
    }

    public getMaintenanceMode(): Promise<any> {
        return this.http.get(`${environment.apiUrl}/site-settings/maintenance-mode`).toPromise()
    }

    public createMaintenanceMode(isEnabled, message): Promise<any> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await this.http
                    .patch(`${environment.apiUrl}/site-settings/maintenance-mode`, {
                        isEnabled,
                        message
                    })
                    .toPromise()
                this.socket.emitMaintenanceMode({ isEnabled, message })
                resolve()
            } catch (e) {
                reject(e)
            }
        })
    }

    public createLegalDoc(title, createdAt, pdf): Promise<any> {
        return this.http.post(`${environment.apiUrl}/legal`, { title, createdAt, pdf }).toPromise()
    }

    public getLegalDocs(bucketName: string) {
        return this.http
            .get(`${environment.apiUrl}/legal/get/objects`, {
                params: { bucketName }
            })
            .toPromise()
    }

    public setUserBan(id, isBanned): Promise<any> {
        return this.http
            .patch(`${environment.apiUrl}/users/ban?userId=${id}`, { isBanned })
            .toPromise()
    }
}
