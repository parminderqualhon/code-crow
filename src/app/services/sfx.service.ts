import { Injectable } from '@angular/core'
import { LocalStorage } from '@ngx-pwa/local-storage'

export enum SoundEffect {
    All = 'All',
    AskedToSpeak = 'AskedToSpeak',
    ChannelUpdates = 'ChannelUpdates',
    FriendRequestReceived = 'FriendRequestReceived',
    FriendRequestSend = 'FriendRequestSend',
    MutedMic = 'MutedMic',
    UnmutedMic = 'UnmutedMic',
    SentMessage = 'SentMessage',
    ReceivedMessage = 'ReceivedMessage',
    StartedSharingScreen = 'StartedSharingScreen',
    StoppedSharingScreen = 'StoppedSharingScreen',
    UserJoinedChannel = 'UserJoinedChannel',
    UserLeftChannel = 'UserLeftChannel'
}

@Injectable({
    providedIn: 'root'
})
export class SfxService {
    public sfxList = []

    constructor(private localStorage: LocalStorage) {}

    public async getAllSavedMutedSfx(): Promise<any[]> {
        return (this.sfxList = [
            {
                key: SoundEffect.All,
                path: null,
                isMuted: await this.getIsMuted(SoundEffect.All)
            },
            {
                key: SoundEffect.AskedToSpeak,
                path: '../../assets/sfx/askedToSpeak.wav',
                isMuted: await this.getIsMuted(SoundEffect.AskedToSpeak)
            },
            {
                key: SoundEffect.ChannelUpdates,
                path: '../../assets/sfx/channelUpdates.wav',
                isMuted: await this.getIsMuted(SoundEffect.ChannelUpdates)
            },
            {
                key: SoundEffect.FriendRequestReceived,
                path: '../../assets/sfx/FriendRequestReceived.wav',
                isMuted: await this.getIsMuted(SoundEffect.FriendRequestReceived)
            },
            {
                key: SoundEffect.FriendRequestSend,
                path: '../../assets/sfx/friendRequestSend.wav',
                isMuted: await this.getIsMuted(SoundEffect.FriendRequestSend)
            },
            {
                key: SoundEffect.MutedMic,
                path: '../../assets/sfx/mutedMic.wav',
                isMuted: await this.getIsMuted(SoundEffect.MutedMic)
            },
            {
                key: SoundEffect.UnmutedMic,
                path: '../../assets/sfx/unmutedMic.wav',
                isMuted: await this.getIsMuted(SoundEffect.MutedMic)
            },
            {
                key: SoundEffect.SentMessage,
                path: '../../assets/sfx/sentMessage.wav',
                isMuted: await this.getIsMuted(SoundEffect.SentMessage)
            },
            {
                key: SoundEffect.ReceivedMessage,
                path: '../../assets/sfx/receivedMessage.wav',
                isMuted: await this.getIsMuted(SoundEffect.SentMessage)
            },
            {
                key: SoundEffect.StartedSharingScreen,
                path: '../../assets/sfx/startedSharingScreen.wav',
                isMuted: await this.getIsMuted(SoundEffect.StartedSharingScreen)
            },
            {
                key: SoundEffect.StoppedSharingScreen,
                path: '../../assets/sfx/stoppedSharingScreen.wav',
                isMuted: await this.getIsMuted(SoundEffect.StartedSharingScreen)
            },
            {
                key: SoundEffect.UserJoinedChannel,
                path: '../../assets/sfx/userJoinedChannel.wav',
                isMuted: await this.getIsMuted(SoundEffect.UserJoinedChannel)
            },
            {
                key: SoundEffect.UserLeftChannel,
                path: '../../assets/sfx/userLeftChannel',
                isMuted: await this.getIsMuted(SoundEffect.UserJoinedChannel)
            }
        ])
    }

    async getIsMuted(key: SoundEffect) {
        return await this.localStorage.getItem(key).toPromise()
    }

    public playAudio(key: SoundEffect) {
        const isMutedAll = this.sfxList.find((sound) => sound.key == SoundEffect.All).isMuted
        const sfx = this.sfxList.find((sound) => sound.key == key)
        if (!isMutedAll && !sfx.isMuted) {
            let audio = new Audio()
            let path = this.getPathFromKey(key)
            audio.src = path
            audio.load()
            audio.play()
        }
    }

    private getPathFromKey(key: SoundEffect) {
        return this.sfxList.find((sfx) => sfx.key == key).path
    }

    public saveIsMuted(key: SoundEffect, isMuted: boolean) {
        this.localStorage.setItem(key, isMuted).subscribe(() => {})
        this.sfxList.find((sfx) => sfx.key == key).isMuted = isMuted
    }
}
