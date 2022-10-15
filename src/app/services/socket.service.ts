import { Injectable } from '@angular/core'
import { async, Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import { isPlatformBrowser } from '@angular/common'
import { Inject, PLATFORM_ID } from '@angular/core'
import { HttpClient } from '@angular/common/http'


@Injectable({
    providedIn: 'root'
})
export class Socket {
    public apiSocket
    private isBrowser: boolean
    public socketIdentified: boolean = false
    public sessionName: string
    public id: string
    constructor(@Inject(PLATFORM_ID) private platformId: Object, public http: HttpClient) {
        this.isBrowser = isPlatformBrowser(this.platformId)
        if (this.isBrowser) {
            let websocketId: string = ""
            http.get(`${environment.apiUrl}/wsinit/wsid`, {responseType: 'text'}).subscribe((data: string)=>{
                websocketId = data
           
                this.apiSocket = new WebSocket(`${environment.webSocketUrl}/wsinit/wsid/${websocketId}/connect`)
            
                this.apiSocket.addEventListener('open', (data)=> {
                    console.log("socket connection open")
                    console.log(data)
                })
                this.apiSocket.addEventListener('message', (data)=> {
                    console.log("listening to messages")
                    console.log(data)
                })
                this.apiSocket.addEventListener('error', (data)=> {
                    console.log("socket connection error")
                    console.log(data)
                })
                this.apiSocket.addEventListener('close', (data)=> {
                    console.log("socket connection close")
                    console.log(data)
                })
           
            })
        
        }
    }

    async emitUserConnection(userId: string, isOnline: boolean) {
        if (!this.isBrowser) return
        return new Promise((resolve) => {
            this.apiSocket.send(
                JSON.stringify({
                    eventName: isOnline ? 'user-connect' : 'user-disconnect',
                    userId: userId
                })
            )
            resolve(isOnline)
        })
    }

    listenToUserConnection(userId: string): Observable<any> {
        return new Observable((observer) => {
            this.apiSocket.addEventListener(`message`, (data) => {
                if (data.userId === userId && data.eventName === 'user-connection') {
                    this.sessionName = data.userId
                    observer.next(data)
                }
            })
        })
    }

    listenToMaintenanceMode(): Observable<any> {
        return new Observable((observer) => {
            this.apiSocket.addEventListener(`message`, (data) => {
                if (data.eventName === 'maintenance-mode') {
                    observer.next(data)
                }
            })
        })
    }

    emitMaintenanceMode({ isEnabled, message }) {
        this.apiSocket.send(JSON.stringify({ eventName: `maintenance-mode`, isEnabled, message }))
    }

    listenToRemovedUser(channelId): Observable<any> {
        return new Observable((observer) => {
            this.apiSocket.addEventListener(`message`, (data) => {
                if (data.eventName === `user-removed` && data.channel === channelId) {
                    observer.next(data)
                }
            })
        })
    }

    emitRemovedUser(channelId, userId) {
        this.apiSocket.send(JSON.stringify({ eventName: `user-removed`, channelId, userId }))
    }

    listenToChannelUpdate(channelId): Observable<any> {
        return new Observable((observer) => {
            this.apiSocket.addEventListener(`message`, (data) => {
                if (data.eventName === `channel-update` && data.channelId === channelId) {
                    observer.next(data)
                }
            })
        })
    }

    emitChannelUpdate(channelId) {
        this.apiSocket.send(JSON.stringify({ eventName: `channel-update`, channelId }))
    }

    /************ Recording ****************/

    emitVideoRecordingStarted({ channelId }) {
        this.apiSocket.send(JSON.stringify({ eventName: `video-recording-started`, channelId }))
    }

    listenToVideoRecordingStarted({ channelId }): Observable<any> {
        return new Observable((observer) => {
            this.apiSocket.addEventListener(`message`, (data) => {
                if (data.eventName === `video-recording-started` && data.channelId === channelId) {
                    observer.next(data)
                    return data
                }
            })
        })
    }

    emitVideoRecordingEnded({ channelId, sessionCounter }) {
        this.apiSocket.send(
            JSON.stringify({ eventName: 'video-recording-ended', channelId, sessionCounter })
        )
    }

    listenToCompositionStatusUpdate({ channelId }): Observable<any> {
        return new Observable((observer) => {
            this.apiSocket.addEventListener(`message`, (data) => {
                if (
                    data.eventName === `composition-status-update` &&
                    data.channelId === channelId
                ) {
                    observer.next(data)
                    return data
                }
            })
        })
    }

    emitCompositionDeleted({ channelId, compositionSid }) {
        this.apiSocket.send(
            JSON.stringify({ eventName: 'composition-deleted', channelId, compositionSid })
        )
    }

    listenToCompositionDeleted({ channelId }): Observable<any> {
        return new Observable((observer) => {
            this.apiSocket.addEventListener(`message`, (data) => {
                if (data.eventName === `composition-deleted` && data.channelId === channelId) {
                    observer.next(data)
                    return data
                }
            })
        })
    }

    /************ Chat ****************/

    listenToChatMessages(): Observable<any> {
        return new Observable((observer) => {
            this.apiSocket.addEventListener(`message`, (data) => {
                if (data.eventName === `message-received` && data.userId === this.sessionName) {
                    observer.next(data)
                }
            })
        })
    }

    emitChatMessage({ source1, source2 }) {
        this.apiSocket.send(JSON.stringify({ eventName: `message-sent`, source1, source2 }))
    }

    /************ Channel chat ****************/

    listenToChannelMessage(channelId): Observable<any> {
        return new Observable((observer) => {
            this.apiSocket.addEventListener(`message`, (data) => {
                if (data.eventName === `channel-message-${channelId}`) {
                    observer.next(data)
                }
            })
        })
    }

    emitChannelSubscribeByUser(channelId, userId) {
        this.apiSocket.send(
            JSON.stringify({
                eventName: `channel-subscribe`,
                channel: channelId,
                userId: userId
            })
        )
    }

    emitMessageToChannel(channelId, message) {
        this.apiSocket.send(
            JSON.stringify({ eventName: `channel-message`, channel: channelId, message })
        )
    }

    emitDeleteMessageToChannel(channelId, message) {
        this.apiSocket.send(
            JSON.stringify({
                eventName: `delete-channel-message`,
                channel: channelId,
                message
            })
        )
    }

    emitDeleteAllMessagesToChannel(channelId) {
        this.apiSocket.send(
            JSON.stringify({ eventName: `delete-all-channel-messages`, channel: channelId })
        )
    }

    emitHistoryToChannel(channelId, message) {
        this.apiSocket.send(
            JSON.stringify({
                eventName: `channel-message-history`,
                channel: channelId,
                message
            })
        )
    }

    listenToChannelTyping(channelId): Observable<any> {
        return new Observable((observer) => {
            this.apiSocket.addEventListener(`message`, (data) => {
                if (data.eventName === `typing` && data.channelId === channelId) {
                    observer.next(data)
                }
            })
        })
    }

    emitChannelChatTypingByUser(channelId, userId) {
        this.apiSocket.send(
            JSON.stringify({
                eventName: `channel-chat-typing`,
                channel: channelId,
                user: userId
            })
        )
    }

    /************ Channel streaming ****************/

    listenToRoomMemberUpdate({ channelId }): Observable<any> {
        return new Observable((observer) => {
            this.apiSocket.addEventListener(`message`, (data) => {
                if (
                    data.eventName === `channel-streaming-room-member-update` &&
                    data.channelId === channelId
                ) {
                    observer.next(data)
                }
            })
        })
    }

    emitRoomMemberUpdate({ channelId, userData, isNewUser }) {
        userData.screenStream = null
        userData.screenAudioStream = null
        userData.webcamStream = null
        userData.audioStream = null
        this.apiSocket.send(
            JSON.stringify({
                eventName: 'channel-streaming-room-member-update',
                channel: channelId,
                userData,
                isNewUser
            })
        )
    }

    listenToUserActions({ channelId }): Observable<any> {
        return new Observable((observer) => {
            this.apiSocket.addEventListener(`message`, (data) => {
                if (
                    data.eventName === `channel-streaming-user-actions` &&
                    data.channelId === channelId
                ) {
                    observer.next(data)
                }
            })
        })
    }

    emitUserActions({ channelId, userData, message }) {
        userData.screenStream = null
        userData.screenAudioStream = null
        userData.webcamStream = null
        userData.audioStream = null
        this.apiSocket.send(
            JSON.stringify({
                eventName: `channel-streaming-user-actions`,
                channel: channelId,
                userData,
                message
            })
        )
    }

    emitReactToMessage(channelId: string, message: Object, user: Object, reaction: string) {
        this.apiSocket.send(
            JSON.stringify({
                eventName: `react-to-message`,
                channel: channelId,
                message,
                user,
                reaction
            })
        )
    }
}
