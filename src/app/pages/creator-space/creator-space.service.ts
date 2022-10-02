import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { environment } from '../../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class CreatorSpaceService {
    constructor(private http: HttpClient) {}

    public getUploadURL({ fileName, fileType, Key }): Promise<any> {
        return this.http
            .put(`${environment.apiUrl}/attachments/url`, {
                fileName,
                fileType,
                Key,
                bucketName: 'videos'
            })
            .toPromise()
    }

    public uploadVideoByUrl({ url, title, duration, channelId }): Promise<any> {
        return this.http
            .post(`${environment.apiUrl}/video`, { url, title, duration, channelId })
            .toPromise()
    }

    public uploadVideo(image: File, url: string): Observable<any> {
        const headers: HttpHeaders = new HttpHeaders({
            'x-amz-acl': 'public-read',
            'Content-Type': image.type
        })
        return this.http
            .put(url, image, { headers, reportProgress: true, observe: 'events' })
            .pipe(catchError(this.errorMgmt))
    }

    public getUserVideos(id): Promise<any> {
        return this.http.get(`${environment.apiUrl}/users/${id}/videos`).toPromise()
    }

    public getChannelLiveStreams(channelId): Promise<any> {
        return this.http.get(`${environment.apiUrl}/channels/${channelId}/live-streams`).toPromise()
    }

    public toggleVideoStatus(id, status): Promise<any> {
        return this.http.patch(`${environment.apiUrl}/videos/${id}/hide`, { status }).toPromise()
    }

    public deleteVideo(id): Promise<any> {
        return this.http.delete(`${environment.apiUrl}/videos/${id}`).toPromise()
    }

    public getMonthLiveStreaming(): Promise<any> {
        return this.http.get(`${environment.apiUrl}/liveStreaming/me/montly`).toPromise()
    }

    errorMgmt(error: HttpErrorResponse) {
        console.log('>> ERROR', error)
        let errorMessage = ''
        if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message
        } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`
        }
        console.log(errorMessage)
        return throwError(throwError)
    }
}
