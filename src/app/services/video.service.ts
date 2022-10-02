import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http'
import { throwError } from 'rxjs'
import { Socket } from './socket.service'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class VideoService {
    public isLoadingVideos: Boolean = false
    public isShowingVideo: boolean = false

    constructor(public http: HttpClient, public socket: Socket) {}

    getVideos({ limit, skip, me = '0', query = {} }): Promise<any> {
        return this.http
            .get(`${environment.apiUrl}/video?skip=${skip}&limit=${limit}&me=${me}`, {
                params: query
            })
            .toPromise()
    }

    public deleteVideoPart({ channelId, ssid }): Promise<any> {
        return this.http
            .delete(`${environment.apiUrl}/videoParts?channelId=${channelId}`, {
                params: { bucketName: 'channelVideos', ssid }
            })
            .toPromise()
    }

    public deleteAllVideoParts({ channelId }): Promise<any> {
        return this.http
            .delete(`${environment.apiUrl}/videoParts/all?channelId=${channelId}`, {
                params: { bucketName: 'channelVideos' }
            })
            .toPromise()
    }

    public uploadVideoByUrl({ url, title, duration, thumbnail, channelId }): Promise<any> {
        return this.http
            .post(`${environment.apiUrl}/video`, {
                url,
                title,
                duration,
                thumbnail,
                channelId
            })
            .toPromise()
    }

    getVideo({ id }): Promise<any> {
        return this.http.get(`${environment.apiUrl}/videos?id=${id}`).toPromise()
    }

    getVideoStream({ id }): Promise<any> {
        return this.http.get(`${environment.apiUrl}/videos/signedURL?id=${id}`).toPromise()
    }

    likeVideo({ status, id }): Promise<any> {
        return this.http.post(`${environment.apiUrl}/videos/like?id=${id}`, { status }).toPromise()
    }

    comment({ body, id }): Promise<any> {
        return this.http.post(`${environment.apiUrl}/videos/comment?id=${id}`, { body }).toPromise()
    }

    errorMgmt(error: HttpErrorResponse) {
        let errorMessage = ''
        if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message
        } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`
        }
        return throwError(throwError)
    }

    async getVideoParts({ channelId }) {
        const self = this
        const videoParts: any = await this.http
            .get(`${environment.apiUrl}/videoParts?channelId=${channelId}`, {})
            .toPromise()
        return videoParts.map((videoPart) => ({
            ...videoPart,
            size: Math.round(videoPart.size * 100) / 100,
            //TODO: set to auto-delete mongoose and s3 object after 7 days
            delete: async function () {
                await self.deleteVideoPart({ channelId, ssid: this.ssid })
            }
        }))
    }
}
