import { SharedService } from './shared.service'
import { SfxService, SoundEffect } from './sfx.service'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { TokenStorage } from '../auth/token.storage'
import { Socket } from './socket.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { AuthService } from '../auth/auth.service'
import { environment } from '../../environments/environment'
import { ChannelService } from './channel.service'
import { Subscription, lastValueFrom } from 'rxjs'
import { DialogService } from './dialog.service'
import { WHIPClient } from "@eyevinn/whip-web-client"

@Injectable({
    providedIn: 'root'
})
export class StreamingService {
    public videoStreamId: string
    public isShowingRecordedVideos: boolean = false
    public roomMembers: any = []
    public channelMembersCount: number = 0
    public hasActiveTracks: boolean = false
    roomMembersSubscription: Subscription
    userActionsSubscription: Subscription

    public userData: {
        id: string
        avatar: any
        customUsername: any
        displayName: string
        userType: string
        obsState: string
        screenState: string
        webcamState: string
        audioState: string
        isHandRaised: boolean
        obsStream: any
        screenStream: any
        webcamStream: any
        audioStream: any
    } = {
            id: null,
            avatar: null,
            customUsername: null,
            displayName: null,
            userType: 'listener',
            obsState: 'restricted',
            screenState: 'restricted',
            webcamState: 'restricted',
            audioState: 'restricted',
            isHandRaised: false,
            obsStream: null,
            screenStream: null,
            webcamStream: null,
            audioStream: null
        }

    public streamOptions: {
        isRecording: boolean
        isLiveStreaming: boolean
        isEveryoneSilenced: boolean
        duration: number
        hasWaitedOneSecondObs: boolean
        hasWaitedOneSecondScreen: boolean
        hasWaitedOneSecondWebcam: boolean
        hasWaitedOneSecondAudio: boolean
        hasWaitedOneSecondRecord: boolean
        hasWaitedOneSecondRaiseHand: boolean
        hasWaitedOneSecondSilence: boolean
        isTimedOut: boolean
        isMaxLimitReached: boolean
    } = {
            isRecording: false,
            isLiveStreaming: false,
            isEveryoneSilenced: true,
            duration: 0,
            hasWaitedOneSecondObs: true,
            hasWaitedOneSecondScreen: true,
            hasWaitedOneSecondWebcam: true,
            hasWaitedOneSecondAudio: true,
            hasWaitedOneSecondRecord: true,
            hasWaitedOneSecondRaiseHand: true,
            hasWaitedOneSecondSilence: true,
            isTimedOut: false,
            isMaxLimitReached: false
        }

    constructor(
        public http: HttpClient,
        public tokenStorage: TokenStorage,
        private socket: Socket,
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private channelService: ChannelService,
        private sfxService: SfxService,
        private sharedService: SharedService,
        private dialogService: DialogService
    ) {}

    /************ STREAMING ************/

    async getMembers({ channelId, isParticipant, skip, limit }): Promise<any> {
        return await lastValueFrom(this.http
            .get(`${environment.apiUrl}/channel-members`, {
                params: { channelId, isParticipant, skip, limit }
            }))
    }

    async getChannelMembersCount({ channelId }): Promise<any> {
        return await lastValueFrom(this.http
            .get(`${environment.apiUrl}/channel-members/count`, {
                params: { channelId }
            }))
    }

    async initRoomMembers() {
        this.roomMembers = await this.getMembers({
            channelId: this.channelService.currentChannel._id,
            isParticipant: true,
            skip: 0,
            limit: 10
        })
        this.channelMembersCount = await this.getChannelMembersCount({
            channelId: this.channelService.currentChannel._id
        })
        Object.assign(this.userData, this.getMember(this.authService.currentUser))
        const doesUserExist = this.roomMembers.some((member) => member.id == this.userData.id)
        if (this.channelService.currentChannel.user === this.userData.id && !doesUserExist) {
            this.roomMembers.push(this.userData)
        }
        this.socket.emitRoomMemberUpdate({
            channelId: this.channelService.currentChannel._id,
            userData: this.userData,
            isNewUser: true
        })
        this.listenToRoomMemberUpdate()
        this.listenToUserActions()

        this.streamOptions.isEveryoneSilenced =
            this.channelService.currentChannel.isEveryoneSilenced
        if (this.channelService.currentChannel.user === this.authService.currentUser._id) {
            await this.createLiveStream(
                this.channelService.currentChannel._id,
                `${this.channelService.currentChannel.title}-${this.channelService.currentChannel.user}`
            )
            await this.channelService.updateIsStreaming({
                channelId: this.channelService.currentChannel._id,
                isStreaming: true
            })
        }
    }

    listenToRoomMemberUpdate() {
        this.roomMembersSubscription = this.socket
            .listenToRoomMemberUpdate({
                channelId: this.channelService.currentChannel._id
            })
            .subscribe(async (data) => {
                if (this.channelService.currentChannel) {
                    if (data.isNewUser) {
                        const doesUserExist = this.roomMembers.some(
                            (member) => member.id == data.userData.id
                        )
                        if (!doesUserExist && data.userData.userType != 'listener') {
                            this.roomMembers.push(data.userData)
                            if (this.userData.id == data.userData.id) {
                                this.userData = data.userData
                            }
                        }
                    } else if (!data.isNewUser) {
                        const index = this.roomMembers.findIndex(
                            (item) => item.id == data.userData.id
                        )
                        if (index > -1) this.roomMembers.splice(index, 1)
                        if (this.userData.id == data.userData.id) {
                            this.userData = data.userData
                        }
                    }
                    this.channelMembersCount = await this.getChannelMembersCount({
                        channelId: this.channelService.currentChannel._id
                    })
                    this.channelService.currentChannel.memberCount = this.channelMembersCount
                }
            })
    }

    listenToUserActions() {
        this.userActionsSubscription = this.socket
            .listenToUserActions({
                channelId: this.channelService.currentChannel._id
            })
            .subscribe(async (data) => {
                const messageData = JSON.parse(data.message)
                var member = this.roomMembers.find((member) => member.id == messageData.userId)
                if (!member) member = data.userData
                switch (messageData.type) {
                    case 'toggleTrack':
                        break;
                    case 'toggleRaiseHand':
                        if (this.channelService.currentChannel.user == this.userData.id &&
                            this.userData.id != messageData.userId &&
                            messageData.isHandRaised
                        ) {
                            const snackBarRef = this.snackBar.open(
                                `${member.displayName} would like to participate`,
                                'Allow',
                                { duration: 5000, verticalPosition: 'top' }
                            )
                            snackBarRef.onAction().subscribe(() => {
                                try {
                                    this.toggleUserType(member, true)
                                } catch (e) {
                                    console.log(e)
                                }
                            })
                            // this.inAppSnackBarService.openSnackBar(`${member} would like to participate`, 'error', 3000, 'bottom', 'center')
                        }
                        break
                    case 'toggleSilenceOnEveryone':
                        this.streamOptions.isEveryoneSilenced = messageData.isEveryoneSilenced
                        if (this.userData.id !== this.channelService.currentChannel.user) {
                            await this.stopObsStream()
                            await this.stopScreenStream()
                            await this.stopWebcamStream()
                            await this.stopAudioStream()
                        }
                        break
                    case 'toggleRestriction':
                        switch (messageData.featureType) {
                            case 'obs':
                                if (member.id === messageData.userId) {
                                    member.obsState = messageData.featureState
                                }
                                if (this.userData.id === messageData.userId) {
                                    this.userData.obsState = messageData.featureState
                                    await this.stopObsStream(this.userData.obsState)
                                }
                                break
                            case 'screen':
                                if (member.id === messageData.userId) {
                                    member.screenState = messageData.featureState
                                }
                                if (this.userData.id === messageData.userId) {
                                    this.userData.screenState = messageData.featureState
                                    await this.stopScreenStream(this.userData.screenState)
                                }
                                break
                            case 'webcam':
                                if (member.id === messageData.userId) {
                                    member.webcamState = messageData.featureState
                                }
                                if (this.userData.id === messageData.userId) {
                                    this.userData.webcamState = messageData.featureState
                                    await this.stopWebcamStream(this.userData.webcamState)
                                }
                                break
                            case 'audio':
                                if (member.id === messageData.userId) {
                                    member.audioState = messageData.featureState
                                }
                                if (this.userData.id === messageData.userId) {
                                    this.userData.audioState = messageData.featureState
                                    await this.stopAudioStream(this.userData.audioState)
                                }
                                break
                        }
                        break
                }
                this.updateUserInRoom(member)
            })
    }

    disconnected() {
        console.log('disconnected')
        if (!this.sharedService.wasHomePressed) {
            window.location.href = '/'
        }
        // if (this.streamOptions.isTimedOut || this.streamOptions.isMaxLimitReached) {
        //     if (this.streamOptions.isTimedOut) this.snackBar.open("You have been removed due to inactivity", null, { duration: 5000 })
        //     if (this.streamOptions.isMaxLimitReached) this.snackBar.open("You have reached the 15-min time limit. This limit will be lifted after beta", null, { duration: 5000 })
        //     this.streamOptions.isTimedOut = false
        //     this.streamOptions.isMaxLimitReached = false
        // }

        this.streamOptions = {
            isRecording: false,
            isLiveStreaming: false,
            isEveryoneSilenced: false,
            duration: 0,
            hasWaitedOneSecondObs: true,
            hasWaitedOneSecondScreen: true,
            hasWaitedOneSecondWebcam: true,
            hasWaitedOneSecondAudio: true,
            hasWaitedOneSecondRecord: true,
            hasWaitedOneSecondRaiseHand: true,
            hasWaitedOneSecondSilence: true,
            isTimedOut: false,
            isMaxLimitReached: false
        }
        this.videoStreamId = null
        this.isShowingRecordedVideos = false
        this.roomMembers = []
        this.hasActiveTracks = false
        this.sharedService.wasHomePressed = false

        this.socket.emitRoomMemberUpdate({
            channelId: this.channelService.currentChannel._id,
            userData: this.userData,
            isNewUser: false
        })

        if (this.authService.currentUser && this.channelService.currentChannel.user == this.authService.currentUser._id) {
            this.updateLiveStream()
            this.channelService.updateIsStreaming({
                channelId: this.channelService.currentChannel._id,
                isStreaming: false
            })
        }
        // this.endRecording()
    }

    getMember({ _id, avatar, customUsername, displayName, obsStream, screenStream, webcamStream, audioStream }) {
        return {
            id: _id,
            avatar: avatar,
            customUsername: customUsername,
            displayName: displayName,
            userType: _id == this.channelService.currentChannel.user ? 'host' : 'listener',
            obsState: 'hibernate',
            screenState: 'hibernate',
            webcamState: 'hibernate',
            audioState: 'hibernate',
            isHandRaised: false,
            obsStream,
            screenStream,
            webcamStream,
            audioStream
        }
    }

    updateUserInRoom(userData) {
        var roomUser = this.roomMembers.find((member) => member.id == userData.id)
        if (roomUser) {
            Object.assign(roomUser, userData)
        } else {
            if (userData.userType != 'listener') this.roomMembers.push(userData)
        }
    }

    async startObsStream() {
        if (this.streamOptions.hasWaitedOneSecondObs) {
            this.waitOneSecondObs()
            var trackName = `obs-${this.userData.id}`
            var obsStream = await this.getLiveInput({ meta: { name: trackName }, recording: { mode: "automatic" } })
            this.userData.obsStream = obsStream
            this.userData.obsState = 'live'
            this.updateUserInRoom(this.userData)
            this.sendDataToRoom({ type: 'toggleTrack' })
            this.streamOptions.isLiveStreaming = true
            this.sfxService.playAudio(SoundEffect.StartedSharingScreen)
            this.waitOneSecondObs()
            this.checkForActiveTracks()
            this.dialogService.openDialog({
                title: 'Streaming Information',
                message: `URL: + ${obsStream.url} \nKey: ${obsStream.streamKey}`,
                okText: 'OK'
            }, {
                disableClose: true
            })
        }
    }

    async stopObsStream(state = 'hibernate') {
        this.streamOptions.isLiveStreaming = false
        this.userData.obsStream = null
        this.userData.obsState = state
        this.updateUserInRoom(this.userData)
        this.sendDataToRoom({ type: 'toggleTrack' })
        this.checkForActiveTracks()
        await this.deleteLiveInput({ inputId: this.userData.obsStream.uid })
    }

    async startScreenStream() {
        if (this.streamOptions.hasWaitedOneSecondScreen) {
            this.waitOneSecondScreen()
            await (navigator.mediaDevices as any)
                .getDisplayMedia({
                    video: true,
                    audio: true
                })
                .then(async (screenStream) => {
                    var trackName = `screen-${this.userData.id}`
                    var liveInput = await this.getLiveInput({ meta: { name: trackName }, recording: { mode: "automatic" } })
                    this.userData.screenStream = liveInput
                    const url = liveInput.webRTC.url
                    // const videoIngest: any = document.getElementById(`screenStream-${this.userData.id}`)
                    const client = new WHIPClient({
                        endpoint: url,
                        opts: { debug: true, iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }] }
                    })
                    await client.setIceServersFromEndpoint()
                    // videoIngest.srcObject = screenStream
                    await client.ingest(screenStream)
                    this.userData.screenState = 'live'
                    this.updateUserInRoom(this.userData)
                    this.sendDataToRoom({ type: 'toggleTrack' })
                    this.userData.screenStream.on('stopped', () => {
                        this.stopScreenStream()
                    })
                    this.streamOptions.isLiveStreaming = true
                    this.sfxService.playAudio(SoundEffect.StartedSharingScreen)
                    this.waitOneSecondScreen()
                    this.checkForActiveTracks()
                })
                .catch((err) => console.error('failed. ', err))
        }
    }

    // attachScreen(track) {
    //     const container = document.getElementById('screen_container')
    //     const screenNativeElement = track.attach()
    //     const { matches: isMobile } = window.matchMedia('(max-width: 767px)')
    //     if (screenNativeElement) {
    //         if (isMobile) {
    //             screenNativeElement.style.width = '80%'
    //             screenNativeElement.style.cssText =
    //                 'scroll-snap-align: center; width: 80%!important; margin: 0 0.5rem;'
    //         } else {
    //             screenNativeElement.style.width = '100%'
    //         }
    //         screenNativeElement.addEventListener('dblclick', (event) => {
    //             if (document.fullscreenElement) {
    //                 document.exitFullscreen()
    //             } else {
    //                 if (screenNativeElement.requestFullscreen) {
    //                     screenNativeElement.requestFullscreen()
    //                 } else {
    //                     screenNativeElement.webkitRequestFullscreen()
    //                 }
    //             }
    //         })
    //         screenNativeElement.addEventListener('click', (event) => {
    //             event.preventDefault()
    //             event.stopPropagation()
    //             screenNativeElement.scrollIntoView()
    //         })
    //     }
    //     container.append(screenNativeElement)
    //     if (isMobile) {
    //         const allVideoElements = Array.prototype.slice.call(
    //             container.getElementsByTagName('video')
    //         )
    //         allVideoElements.forEach((element, i) => {
    //             if (i === 0) element.style.marginLeft = '10%'
    //             else element.style.marginLeft = '0.5rem'
    //             if (allVideoElements.length === i + 1) element.style.marginRight = '10%'
    //             else element.style.marginRight = '0.5rem'
    //         })
    //     }
    // }

    async stopScreenStream(state = 'hibernate') {
        this.streamOptions.isLiveStreaming = false
        this.userData.screenStream = null
        this.userData.screenState = state
        this.updateUserInRoom(this.userData)
        this.sendDataToRoom({ type: 'toggleTrack' })
        this.checkForActiveTracks()
        await this.deleteLiveInput({ inputId: this.userData.screenStream.uid })
    }

    async startWebcamStream() {
        if (this.streamOptions.hasWaitedOneSecondWebcam) {
            this.waitOneSecondWebcam()
            await (navigator.mediaDevices as any)
                .getUserMedia({
                    video: true,
                    audio: false
                })
                .then(async (webcamStream) => {
                    var trackName = `webcam-${this.userData.id}`
                    var liveInput = await this.getLiveInput({ meta: { name: trackName }, recording: { mode: "automatic" } })
                    this.userData.webcamStream = liveInput
                    const url = liveInput.webRTC.url
                    // const videoIngest: any = document.getElementById(`webcamStream-${this.userData.id}`)
                    const client = new WHIPClient({
                        endpoint: url,
                        opts: { debug: true, iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }] }
                    })
                    await client.setIceServersFromEndpoint()
                    // videoIngest.srcObject = webcamStream
                    await client.ingest(webcamStream)
                    this.userData.screenState = 'live'
                    this.updateUserInRoom(this.userData)
                    this.sendDataToRoom({ type: 'toggleTrack' })
                    this.userData.webcamStream.on('stopped', () => {
                        this.stopWebcamStream()
                    })
                    this.waitOneSecondWebcam()
                    this.checkForActiveTracks()
                    this.sendDataToRoom({
                        type: 'toggleTrack'
                    })
                })
                .catch((err) => console.error('failed. ', err))
        }
    }

    async stopWebcamStream(state = 'hibernate') {
        this.userData.webcamStream = null
        this.userData.webcamState = state
        this.updateUserInRoom(this.userData)
        this.sendDataToRoom({ type: 'toggleTrack' })
        this.checkForActiveTracks()
        await this.deleteLiveInput({ inputId: this.userData.webcamStream.uid })
    }

    async startAudioStream() {
        if (this.streamOptions.hasWaitedOneSecondAudio) {
            this.waitOneSecondAudio()
            await (navigator.mediaDevices as any)
                .getUserMedia({
                    video: false,
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        deviceId: 'default'
                    }
                })
                .then(async (audioStream) => {
                    var trackName = `audio-${this.userData.id}`
                    var liveInput = await this.getLiveInput({ meta: { name: trackName }, recording: { mode: "automatic" } })
                    this.userData.audioStream = liveInput
                    const url = liveInput.webRTC.url
                    // const videoIngest: any = document.getElementById(`audioStream-${this.userData.id}`)
                    const client = new WHIPClient({
                        endpoint: url,
                        opts: { debug: true, iceServers: [{ urls: "stun:stun.cloudflare.com:3478" }] }
                    })
                    await client.setIceServersFromEndpoint()
                    // videoIngest.srcObject = audioStream
                    await client.ingest(audioStream)
                    this.userData.audioState = 'live'
                    this.updateUserInRoom(this.userData)
                    this.sendDataToRoom({ type: 'toggleTrack' })
                    this.userData.audioStream.onended = () => {
                        this.stopAudioStream()
                    }
                    this.waitOneSecondAudio()
                    this.checkForActiveTracks()
                })
                .catch((err) => console.error('failed. ', err))
        }
    }

    async stopAudioStream(state = 'hibernate') {
        this.userData.audioStream = null
        this.userData.audioState = state
        this.updateUserInRoom(this.userData)
        this.sendDataToRoom({ type: 'toggleTrack' })
        this.checkForActiveTracks()
        await this.deleteLiveInput({ inputId: this.userData.audioStream.uid })
    }

    //TODO: uncomment when adding video recording or when time limit for live streams
    checkForActiveTracks() {
        // this.hasActiveTracks = this.roomMembers.some(member => member.screenStream != null || member.webcamStream != null || member.audioStream != null)
        // if (!this.hasActiveTracks) this.endRecording()
    }

    async leaveRoom() {
        if (this.channelService.currentChannel) {
            this.disconnected()
            this.stopObsStream()
            this.stopScreenStream()
            this.stopWebcamStream()
            this.stopAudioStream()
            if (this.roomMembersSubscription) {
                this.roomMembersSubscription.unsubscribe()
            }
            if (this.userActionsSubscription) {
                this.userActionsSubscription.unsubscribe()
            }
        }
    }

    toggleRaiseHand() {
        if (this.streamOptions.hasWaitedOneSecondRaiseHand) {
            this.waitOneSecondRaiseHand()
            this.sfxService.playAudio(SoundEffect.AskedToSpeak)
            this.sendDataToRoom({
                type: 'toggleRaiseHand',
                userId: this.userData.id,
                isHandRaised: true
            })
        }
    }

    toggleSilenceOnEveryone() {
        if (this.streamOptions.hasWaitedOneSecondSilence) {
            this.waitOneSecondSilence()
            this.streamOptions.isEveryoneSilenced = !this.streamOptions.isEveryoneSilenced
            this.sendDataToRoom({
                type: 'toggleSilenceOnEveryone',
                isEveryoneSilenced: this.streamOptions.isEveryoneSilenced
            })
            this.channelService.updateIsEveryoneSilenced({
                channelId: this.channelService.currentChannel._id,
                isEveryoneSilenced: this.streamOptions.isEveryoneSilenced
            })
        }
    }

    toggleUserType(user, isHandRaised = false) {
        if (user.userType === 'listener' || isHandRaised) {
            user.userType = 'participant'
            user.isHandRaised = false
            this.socket.emitRoomMemberUpdate({
                channelId: this.channelService.currentChannel._id,
                userData: user,
                isNewUser: true
            })
        } else if (user.userType === 'participant') {
            user.userType = 'listener'
            this.socket.emitRoomMemberUpdate({
                channelId: this.channelService.currentChannel._id,
                userData: user,
                isNewUser: false
            })
        }
    }

    toggleRestriction(user, featureType) {
        var featureState = 'hibernate'
        switch (featureType) {
            case 'screen':
                if (user.screenState === 'restricted') {
                    featureState = 'hibernate'
                } else {
                    featureState = 'restricted'
                }
                user.screenState = featureState
                break
            case 'webcam':
                if (user.webcamState === 'restricted') {
                    featureState = 'hibernate'
                } else {
                    featureState = 'restricted'
                }
                user.webcamState = featureState
                break
            case 'audio':
                if (user.audioState === 'restricted') {
                    featureState = 'hibernate'
                } else {
                    featureState = 'restricted'
                }
                user.audioState = featureState
                break
        }
        this.sendDataToRoom({
            type: 'toggleRestriction',
            userId: user.id,
            featureType: featureType,
            featureState: featureState
        })
    }

    sendDataToRoom(message) {
        this.socket.emitUserActions({
            channelId: this.channelService.currentChannel._id,
            userData: this.userData,
            message: JSON.stringify(message)
        })
    }

    public waitOneSecondObs() {
        this.streamOptions.hasWaitedOneSecondObs = false
        setTimeout(async () => {
            this.streamOptions.hasWaitedOneSecondObs = true
        }, 1500)
    }

    public waitOneSecondScreen() {
        this.streamOptions.hasWaitedOneSecondScreen = false
        setTimeout(async () => {
            this.streamOptions.hasWaitedOneSecondScreen = true
        }, 1500)
    }

    public waitOneSecondWebcam() {
        this.streamOptions.hasWaitedOneSecondWebcam = false
        setTimeout(async () => {
            this.streamOptions.hasWaitedOneSecondWebcam = true
        }, 1500)
    }

    public waitOneSecondAudio() {
        this.streamOptions.hasWaitedOneSecondAudio = false
        setTimeout(async () => {
            this.streamOptions.hasWaitedOneSecondAudio = true
        }, 1500)
    }

    public waitOneSecondRecord() {
        this.streamOptions.hasWaitedOneSecondRecord = false
        setTimeout(async () => {
            this.streamOptions.hasWaitedOneSecondRecord = true
        }, 1500)
    }

    public waitOneSecondRaiseHand() {
        this.streamOptions.hasWaitedOneSecondRaiseHand = false
        setTimeout(async () => {
            this.streamOptions.hasWaitedOneSecondRaiseHand = true
        }, 3000)
    }

    public waitOneSecondSilence() {
        this.streamOptions.hasWaitedOneSecondSilence = false
        setTimeout(async () => {
            this.streamOptions.hasWaitedOneSecondSilence = true
        }, 3000)
    }

    async createLiveStream(channelId, title): Promise<any> {
        return await lastValueFrom(this.http
            .post(`${environment.apiUrl}/live-streams`, {
                channel: channelId,
                title
            })).then((res: any) => {
                this.videoStreamId = res._id
            })
    }

    async updateLiveStream(): Promise<any> {
        if (this.videoStreamId) {
            return await lastValueFrom(this.http
                .patch(`${environment.apiUrl}/live-streams/${this.videoStreamId}/end`, {}))
        }
    }

    async getLiveInput(trackData): Promise<any> {
        return await lastValueFrom(this.http
            .post(`${environment.apiUrl}/cloudflare/live-input`, { trackData }))
    }

    async deleteLiveInput({ inputId }): Promise<any> {
        return await lastValueFrom(this.http
            .delete(`${environment.apiUrl}/cloudflare/live-input`, { params: inputId }))
    }

    /************ VIDEO RECORDING ************/

    /**
    * @deprecated The method should not be used
    */
    public async toggleMediaRecorder() {
        if (this.streamOptions.isRecording) {
            this.endRecording()
        } else {
            this.streamOptions.isRecording = true
            this.socket.emitVideoRecordingStarted({
                channelId: this.channelService.currentChannel._id
            })
            this.streamOptions.duration = 0
            const interval = setInterval(() => {
                if (this.streamOptions.isRecording) this.streamOptions.duration++
                if (this.streamOptions.duration == 1800) {
                    // 30 minutes
                    this.snackBar.open('30-min recording limit reached', null, {
                        duration: 5000
                    })
                    this.endRecording()
                    clearInterval(interval)
                }
            }, 1000)
        }
    }

    /**
    * @deprecated The method should not be used
    */
    public async endRecording() {
        if (this.streamOptions.isRecording) {
            this.streamOptions.isRecording = false
            this.socket.emitVideoRecordingEnded({
                channelId: this.channelService.currentChannel._id,
                sessionCounter: this.channelService.currentChannel.sessionCounter
            })
        }
    }

    /**
    * @deprecated The method should not be used
    */
    async getCompositions({ channelId }): Promise<any> {
        return await lastValueFrom(this.http
            .get(`${environment.apiUrl}/twilio/video/${channelId}/compositions`))
    }

    /**
    * @deprecated The method should not be used
    */
    async deleteAllCompositions({ roomSid, channelId }): Promise<any> {
        return await lastValueFrom(this.http
            .delete(`${environment.apiUrl}/twilio/video/${channelId}/compositions/${roomSid}`, {}))
    }

    /**
    * @deprecated The method should not be used
    */
    async downloadComposition(compositionSid) {
        const url: any = await lastValueFrom(this.http
            .get(`${environment.apiUrl}/twilio/video/compositions/${compositionSid}/download`))
        window.open(url, '_blank')
    }
}
