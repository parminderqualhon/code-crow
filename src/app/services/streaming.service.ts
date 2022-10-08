import { SharedService } from './shared.service'
import { SfxService, SoundEffect } from './sfx.service'
import { Injectable } from '@angular/core'
import { v4 as uuidv4 } from 'uuid'
import { HttpClient } from '@angular/common/http'
import { TokenStorage } from '../auth/token.storage'
import { Socket } from './socket.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { UserService } from './user.service'
import { AuthService } from '../auth/auth.service'
import { environment } from '../../environments/environment'
import { connect, LocalVideoTrack, LocalAudioTrack, LocalDataTrack } from 'twilio-video'
import { ChannelService } from './channel.service'
import { BehaviorSubject, Subscription, lastValueFrom } from 'rxjs'
import { InAppSnackBarService } from './inAppSnackBar.service'

@Injectable({
    providedIn: 'root'
})
export class StreamingService {
    public videoStreamId: string
    public isShowingRecordedVideos: boolean = false
    public roomMembers: any = []
    public videoRoom: any
    public hasActiveTracks: boolean = false
    roomMembersSubscription: Subscription
    userActionsSubscription: Subscription

    public userData: {
        id: string
        avatar: any
        customUsername: any
        displayName: string
        userType: string
        screenState: string
        webcamState: string
        audioState: string
        isHandRaised: boolean
        screenStream: any
        screenAudioStream: any
        webcamStream: any
        audioStream: any
    } = {
            id: null,
            avatar: null,
            customUsername: null,
            displayName: null,
            userType: 'listener',
            screenState: 'restricted',
            webcamState: 'restricted',
            audioState: 'restricted',
            isHandRaised: false,
            screenStream: null,
            screenAudioStream: null,
            webcamStream: null,
            audioStream: null
        }

    public streamOptions: {
        isRecording: boolean
        isLiveStreaming: boolean
        isEveryoneSilenced: boolean
        duration: number
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
        private userService: UserService,
        private authService: AuthService,
        private channelService: ChannelService,
        private sfxService: SfxService,
        private sharedService: SharedService,
        private inAppSnackBarService: InAppSnackBarService
    ) {}

    /************ STREAMING ************/

    async getVideoToken({ channelId }): Promise<any> {
        return await lastValueFrom(this.http
            .get(`${environment.apiUrl}/twilio/video/token/${channelId}`))
    }

    async getRoomMembers({ channelId, isParticipant, skip, limit }): Promise<any> {
        return await lastValueFrom(this.http
            .get(`${environment.apiUrl}/channelMembers/${channelId}`, {
                params: { isParticipant, skip, limit }
            }))
    }

    async initRoomMembers() {
        this.roomMembers = await this.getRoomMembers({
            channelId: this.channelService.currentChannel._id,
            isParticipant: true,
            skip: 0,
            limit: 50
        })
        Object.assign(this.userData, this.getMember(this.authService.currentUser))
        const doesUserExist = this.roomMembers.some((member) => member.id == this.userData.id)
        if (this.channelService.currentChannel.user == this.userData.id && !doesUserExist) {
            this.roomMembers.push(this.userData)
        }
        this.socket.emitRoomMemberUpdate({
            channelId: this.channelService.currentChannel._id,
            userData: this.userData,
            isNewUser: true
        })
        this.listenToRoomMemberUpdate()
        this.listenToUserActions()
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
                    this.channelService.currentChannel.memberCount = data.memberCount
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
                    case 'toggleRaiseHand':
                        // if (member.id === messageData.userId) {
                        //     member.isHandRaised = messageData.isHandRaised
                        // if (messageData.isHandRaised && this.roomMembers.length > 3) {
                        //     const index = this.roomMembers.findIndex(member => member.id == messageData.userId)
                        //     if (index > -1) this.roomMembers.splice(index, 1)
                        //     this.roomMembers.splice(2, 0, member)
                        // }
                        // }
                        if (
                            this.channelService.currentChannel.user == this.userData.id &&
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
                            await this.stopScreenStream()
                            await this.stopWebcamStream()
                            await this.stopAudioStream()
                        }
                        break
                    // case 'toggleUserType':
                    //     if (member.id === messageData.userId) {
                    //         member.userType = messageData.userType
                    //         member.isHandRaised = false
                    //     }
                    //     if (this.userData.id === messageData.userId) {
                    //         this.userData.userType = messageData.userType
                    //         this.userData.isHandRaised = false
                    //         await this.stopScreenStream()
                    //         await this.stopWebcamStream()
                    //         await this.stopAudioStream()
                    //     }
                    //     break
                    case 'toggleRestriction':
                        switch (messageData.featureType) {
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

    async connect() {
        this.streamOptions.isEveryoneSilenced =
            this.channelService.currentChannel.isEveryoneSilenced
        const videoToken = await this.getVideoToken({
            channelId: this.channelService.currentChannel._id
        })
        connect(videoToken, {
            name: this.channelService.currentChannel._id,
            audio: false,
            video: false
        }).then(async (room) => {
            room.participants.forEach((participant) => this.participantConnected(participant))
            room.on('participantConnected', (participant) => this.participantConnected(participant))
            room.on('participantDisconnected', (participant) =>
                this.participantDisconnected(participant)
            )
            room.once('disconnected', (error) => this.disconnected(error))
            this.videoRoom = room

            if (this.channelService.currentChannel.user == this.authService.currentUser._id) {
                await this.createLiveStream(
                    this.channelService.currentChannel._id,
                    `${this.channelService.currentChannel.title}-${this.channelService.currentChannel.user}`
                )
                await this.channelService.updateIsStreaming({
                    channelId: this.channelService.currentChannel._id,
                    isStreaming: true
                })
            }
        })
    }

    async participantConnected(participant) {
        const user = await this.userService.getUserById(participant.identity)
        const member = this.getMember(user)
        this.participantTrackSubscriptions(participant, member)
        // this.sfxService.playAudio(SoundEffect.UserJoinedChannel)
    }

    async participantDisconnected(participant) {
        participant.tracks.forEach((publication) => {
            if (publication.isSubscribed) {
                this.stopAndDetachTrack(publication.track)
                publication.unpublish()
            }
        })
        // this.sfxService.playAudio(SoundEffect.UserLeftChannel)
    }

    disconnected(error) {
        console.log('disconnected', error)
        if (error.code === 20104) {
            console.log('Signaling reconnection failed due to expired AccessToken!')
            window.location.reload()
        } else if (error.code === 53000) {
            console.log('Signaling reconnection attempts exhausted!')
            window.location.reload()
        } else if (error.code === 53002) {
            console.log('Signaling reconnection took too long!')
            window.location.reload()
        } else if (!error.code) {
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
            this.videoRoom = null
            this.hasActiveTracks = false
            this.sharedService.wasHomePressed = false

            this.socket.emitRoomMemberUpdate({
                channelId: this.channelService.currentChannel._id,
                userData: this.userData,
                isNewUser: false
            })
        }

        if (
            this.authService.currentUser &&
            this.channelService.currentChannel.user == this.authService.currentUser._id
        ) {
            this.updateLiveStream()
            this.channelService.updateIsStreaming({
                channelId: this.channelService.currentChannel._id,
                isStreaming: false
            })
        }
        this.endRecording()
    }

    getMember({ _id, avatar, customUsername, displayName }) {
        return {
            id: _id,
            avatar: avatar,
            customUsername: customUsername,
            displayName: displayName,
            userType: _id == this.channelService.currentChannel.user ? 'host' : 'listener',
            screenState: 'hibernate',
            webcamState: 'hibernate',
            audioState: 'hibernate',
            isHandRaised: false,
            screenStream: null,
            screenAudioStream: null,
            webcamStream: null,
            audioStream: null
        }
    }

    participantTrackSubscriptions(participant, member) {
        participant.tracks.forEach((publication) => {
            if (publication.isSubscribed) {
                this.setParticipantTrack(publication.track, member, 'live')
            }
        })

        participant.on('trackSubscribed', (track) => {
            this.setParticipantTrack(track, member, 'live')
        })

        participant.on('trackUnsubscribed', (track) => {
            this.setParticipantTrack(track, member, 'hibernate')
        })
    }

    setParticipantTrack(track, member, state) {
        this.checkForActiveTracks()
        if (track.name.includes('screen-host') || track.name.includes('screen')) {
            if (member.screenState != 'restricted') member.screenState = state
            if (member.screenState === 'live') {
                member.screenStream = track
                this.attachScreen(member.screenStream)
            } else {
                track.detach().forEach((element) => element.remove())
                member.screenStream = null
            }
            this.updateUserInRoom({
                id: member.id,
                screenState: member.screenState,
                screenStream: member.screenStream,
                screenAudioStream: member.screenAudioStream
            })
        } else if (track.name.includes('webcam')) {
            if (member.webcamState != 'restricted') member.webcamState = state
            if (member.webcamState === 'live') {
                member.webcamStream = track
                this.attachScreen(member.webcamStream)
            } else {
                track.detach().forEach((element) => element.remove())
                member.webcamStream = null
            }
            this.updateUserInRoom({
                id: member.id,
                webcamState: member.webcamState,
                webcamStream: member.webcamStream
            })
        } else if (track.name.includes('audio')) {
            if (member.audioState != 'restricted') member.audioState = state
            if (member.audioState === 'live') {
                member.audioStream = track
                this.attachAudio(member.audioStream)
            } else {
                track.detach().forEach((element) => element.remove())
                member.audioStream = null
            }
            this.updateUserInRoom({
                id: member.id,
                audioState: member.audioState,
                audioStream: member.audioStream
            })
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

    async startScreenStream() {
        if (this.streamOptions.hasWaitedOneSecondScreen) {
            this.waitOneSecondScreen()
            await (navigator.mediaDevices as any)
                .getDisplayMedia({
                    video: true,
                    audio: true
                })
                .then(async (screenStream) => {
                    var trackName =
                        this.channelService.currentChannel.user == this.userData.id
                            ? `screen-host-sess-${this.channelService.currentChannel.sessionCounter}`
                            : `screen-sess-${this.channelService.currentChannel.sessionCounter}`
                    this.userData.screenStream = new LocalVideoTrack(
                        screenStream.getVideoTracks()[0],
                        { name: trackName, logLevel: 'error' }
                    )
                    this.userData.screenState = 'live'
                    this.updateUserInRoom(this.userData)
                    this.attachScreen(this.userData.screenStream)
                    this.videoRoom.localParticipant.publishTrack(this.userData.screenStream)

                    if (screenStream.getAudioTracks().length > 0) {
                        this.userData.screenAudioStream = new LocalAudioTrack(
                            screenStream.getAudioTracks()[0],
                            { name: 'audio-' + trackName, logLevel: 'error' }
                        )
                        this.attachAudio(this.userData.screenAudioStream)
                        this.videoRoom.localParticipant.publishTrack(
                            this.userData.screenAudioStream
                        )
                    }

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

    attachScreen(track) {
        const container = document.getElementById('screen_container')
        const screenNativeElement = track.attach()
        const { matches: isMobile } = window.matchMedia('(max-width: 767px)')
        if (screenNativeElement) {
            if (isMobile) {
                screenNativeElement.style.width = '80%'
                screenNativeElement.style.cssText =
                    'scroll-snap-align: center; width: 80%!important; margin: 0 0.5rem;'
            } else {
                screenNativeElement.style.width = '100%'
            }
            screenNativeElement.addEventListener('dblclick', (event) => {
                if (document.fullscreenElement) {
                    document.exitFullscreen()
                } else {
                    if (screenNativeElement.requestFullscreen) {
                        screenNativeElement.requestFullscreen()
                    } else {
                        screenNativeElement.webkitRequestFullscreen()
                    }
                }
            })
            screenNativeElement.addEventListener('click', (event) => {
                event.preventDefault()
                event.stopPropagation()
                screenNativeElement.scrollIntoView()
            })
        }
        container.append(screenNativeElement)
        if (isMobile) {
            const allVideoElements = Array.prototype.slice.call(
                container.getElementsByTagName('video')
            )
            allVideoElements.forEach((element, i) => {
                if (i === 0) element.style.marginLeft = '10%'
                else element.style.marginLeft = '0.5rem'
                if (allVideoElements.length === i + 1) element.style.marginRight = '10%'
                else element.style.marginRight = '0.5rem'
            })
        }
    }

    async stopScreenStream(state = 'hibernate') {
        this.videoRoom.localParticipant.videoTracks.forEach((publication) => {
            if (publication.track.name.includes('screen')) {
                this.stopAndDetachTrack(publication.track)
                publication.unpublish()
            }
        })

        this.videoRoom.localParticipant.audioTracks.forEach((publication) => {
            if (publication.track.name.includes('audio-screen')) {
                this.stopAndDetachTrack(publication.track)
                publication.unpublish()
            }
        })

        this.streamOptions.isLiveStreaming = false
        this.userData.screenStream = null
        this.userData.screenAudioStream = null
        this.userData.screenState = state
        this.updateUserInRoom(this.userData)
        this.checkForActiveTracks()
    }

    async startWebcamStream() {
        if (this.streamOptions.hasWaitedOneSecondWebcam) {
            this.waitOneSecondWebcam()
            await (navigator.mediaDevices as any)
                .getUserMedia({
                    video: true,
                    audio: false
                })
                .then((webcamStream) => {
                    var trackName =
                        this.channelService.currentChannel.user == this.userData.id
                            ? `webcam-host-sess-${this.channelService.currentChannel.sessionCounter}`
                            : `webcam-sess-${this.channelService.currentChannel.sessionCounter}`
                    this.userData.webcamStream = new LocalVideoTrack(
                        webcamStream.getVideoTracks()[0],
                        { name: trackName, logLevel: 'error' }
                    )
                    this.userData.webcamState = 'live'
                    this.updateUserInRoom(this.userData)
                    this.attachScreen(this.userData.webcamStream)
                    this.videoRoom.localParticipant.publishTrack(this.userData.webcamStream)
                    this.userData.webcamStream.on('stopped', () => {
                        this.stopWebcamStream()
                    })
                    this.waitOneSecondWebcam()
                    this.checkForActiveTracks()
                })
                .catch((err) => console.error('failed. ', err))
        }
    }

    // attachWebcam(track, userId) {
    //     setTimeout(() => {
    //         const container = document.getElementById(`webcam_${userId}`)
    //         const webcamNativeElement = track.attach()
    //         webcamNativeElement.style.width = "100%"
    //         container.append(webcamNativeElement)
    //     })
    // }

    async stopWebcamStream(state = 'hibernate') {
        this.videoRoom.localParticipant.videoTracks.forEach((publication) => {
            if (publication.track.name.includes('webcam')) {
                this.stopAndDetachTrack(publication.track)
                publication.unpublish()
            }
        })
        this.userData.webcamStream = null
        this.userData.webcamState = state
        this.updateUserInRoom(this.userData)
        this.checkForActiveTracks()
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
                .then((audioStream) => {
                    var trackName = `audio-sess-${this.channelService.currentChannel.sessionCounter}`
                    this.userData.audioStream = new LocalAudioTrack(
                        audioStream.getAudioTracks()[0],
                        { name: trackName, logLevel: 'error' }
                    )
                    this.userData.audioState = 'live'
                    this.updateUserInRoom(this.userData)
                    this.attachAudio(this.userData.audioStream)
                    this.videoRoom.localParticipant.publishTrack(this.userData.audioStream)
                    this.userData.audioStream.onended = () => {
                        this.stopAudioStream()
                    }
                    this.waitOneSecondAudio()
                    this.checkForActiveTracks()
                })
                .catch((err) => console.error('failed. ', err))
        }
    }

    attachAudio(track) {
        const container = document.getElementById('audio_container')
        container.append(track.attach())
    }

    async stopAudioStream(state = 'hibernate') {
        this.videoRoom.localParticipant.audioTracks.forEach((publication) => {
            if (
                publication.track.name.includes('audio') &&
                !publication.track.name.includes('screen')
            ) {
                this.stopAndDetachTrack(publication.track)
                publication.unpublish()
            }
        })
        this.userData.audioStream = null
        this.userData.audioState = state
        this.updateUserInRoom(this.userData)
        this.checkForActiveTracks()
    }

    stopAndDetachTrack(track) {
        if (track) {
            track.disable()
            track.stop()
            track.detach().forEach((element) => element.remove())
        }
    }

    //TODO: uncomment when adding video recording or when time limit for live streams
    checkForActiveTracks() {
        // this.hasActiveTracks = this.roomMembers.some(member => member.screenStream != null || member.webcamStream != null || member.audioStream != null)
        // if (!this.hasActiveTracks) this.endRecording()
    }

    async leaveRoom() {
        if (this.videoRoom) {
            this.stopScreenStream()
            this.stopWebcamStream()
            this.stopAudioStream()
            this.videoRoom.disconnect()
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
        // this.sendDataToRoom({ type: 'toggleUserType', userId: user.id, userType: user.userType })
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

    /************ VIDEO RECORDING ************/

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

    public async endRecording() {
        if (this.streamOptions.isRecording) {
            this.streamOptions.isRecording = false
            this.socket.emitVideoRecordingEnded({
                channelId: this.channelService.currentChannel._id,
                sessionCounter: this.channelService.currentChannel.sessionCounter
            })
        }
    }

    async getCompositions({ channelId }): Promise<any> {
        return await lastValueFrom(this.http
            .get(`${environment.apiUrl}/twilio/video/${channelId}/compositions`))
    }

    async deleteAllCompositions({ roomSid, channelId }): Promise<any> {
        return await lastValueFrom(this.http
            .delete(`${environment.apiUrl}/twilio/video/${channelId}/compositions/${roomSid}`, {}))
    }

    async downloadComposition(compositionSid) {
        const url: any = await lastValueFrom(this.http
            .get(`${environment.apiUrl}/twilio/video/compositions/${compositionSid}/download`))
        window.open(url, '_blank')
    }
}
