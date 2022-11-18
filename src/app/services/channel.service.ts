import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { AuthService } from '../auth/auth.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { environment } from '../../environments/environment'
import { BehaviorSubject } from 'rxjs'
import { lastValueFrom } from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class ChannelService {
    public channels: any = []
    public channelsBehavior = new BehaviorSubject<any[]>([])
    public hasFilters: boolean = false
    public currentChannel: any
    private skip: any
    private limit: any
    private user: any
    public searchQuery: string = ''
    public isAddChannelEnabled: boolean = false
    public isFilterChannelEnabled: boolean = false
    public isCreateGroupEnabled: boolean = false
    public isEditGroupEnabled: any = false
    public filterTechList = []
    public techList: any = []
    public editGroupDialogBehavior = new BehaviorSubject<boolean>(false)
    public filterChannelDialogBehavior = new BehaviorSubject<any>(null)
    public addChannelDialogBehavior = new BehaviorSubject<boolean>(false)
    public addTechListBehavior = new BehaviorSubject<any[]>([])

    constructor(
        public http: HttpClient,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) {
        this.resetSkipLimit()
    }

    async createChannel(
        title,
        description,
        thumbnail,
        techStack,
        tags,
        isPrivate: boolean = false,
        user,
        channelType
    ) {
        const channel: any = await lastValueFrom(this.http
            .post(`${environment.apiUrl}/channel`, {
                title,
                description,
                thumbnail,
                techStack,
                tags,
                isPrivate,
                user: user._id,
                createdBy: user.displayName,
                avatar: user.avatar,
                isHostActive: true,
                channelType
            }))
        if (channelType === "channel") {
            await this.addHostChannelToUser({ hostChannelId: channel._id })
            this.currentChannel = channel
        }
        return channel
    }

    async deleteChannel({ channelId }): Promise<any> {
        return await lastValueFrom(this.http
            .delete(`${environment.apiUrl}/channels/${channelId}`, {
                params: { bucketName: 'attachments' }
            }))
    }

    async getChannel({ channelId }): Promise<any> {
        return await lastValueFrom(this.http.get(`${environment.apiUrl}/channel?channelId=${channelId}`))
    }

    async getFriendChannel({ title }): Promise<any> {
        return await lastValueFrom(this.http.get(`${environment.apiUrl}/channels/friend?title=${title}`))
    }

    async addChannelToUser({ channelId }) {
        const userUpdate = await lastValueFrom(this.http
            .put(`${environment.apiUrl}/users/channels?channelId=${channelId}`, {}))
        this.authService.setUser(userUpdate)
        this.user = userUpdate
    }

    async removeChannelFromUser({ channelId, userId }) {
        const userUpdate = await lastValueFrom(this.http
            .delete(`${environment.apiUrl}/users/channels?channelId=${channelId}`, {}))
        if (this.user == userId) this.authService.setUser(userUpdate)
    }

    async addHostChannelToUser({ hostChannelId }) {
        console.log("userId", localStorage.getItem('userId'))

        const userUpdate = await lastValueFrom(this.http
            .put(`${environment.apiUrl}/users/host-channels?hostChannelId=${hostChannelId}`, {}))
        this.authService.setUser(userUpdate)
        this.user = userUpdate
    }

    async removeHostChannelFromUser({ hostChannelId }) {
        const userUpdate = await lastValueFrom(this.http
            .delete(`${environment.apiUrl}/users/host-channels?hostChannelId=${hostChannelId}`, {}))
        this.authService.setUser(userUpdate)
        this.user = userUpdate
    }

    async blockUserFromChannel({ channelId, userId }): Promise<any> {
        return await lastValueFrom(this.http
            .patch(
                `${environment.apiUrl}/channels/blocked-users?channelId=${channelId}&userId=${userId}`,
                {}
            ))
    }

    async unblockUserFromChannel({ channelId, userId }): Promise<any> {
        return await lastValueFrom(this.http
            .delete(
                `${environment.apiUrl}/channels/blocked-users?channelId=${channelId}&userId=${userId}`,
                {}
            ))
    }

    async updateIsHostActive({ channelId, isHostActive }): Promise<any> {
        return await lastValueFrom(this.http
            .patch(`${environment.apiUrl}/channels?channelId=${channelId}`, { isHostActive }))
    }

    async updateIsStreaming({ channelId, isStreaming }): Promise<any> {
        return await lastValueFrom(this.http
            .patch(`${environment.apiUrl}/channels?channelId=${channelId}`, { isStreaming }))
    }

    async updateIsEveryoneSilenced({ channelId, isEveryoneSilenced }): Promise<any> {
        return await lastValueFrom(this.http
            .patch(`${environment.apiUrl}/channels?channelId=${channelId}`, {
                isEveryoneSilenced
            }))
    }

    isUserBlockedFromChannel(userId) {
        return this.currentChannel.blockedUsers?.some((user) => !!(user == userId))
    }

    async addAttachments({ channelId, attachmentUrl }): Promise<any> {
        return await lastValueFrom(this.http
            .put(`${environment.apiUrl}/channels/attachments?channelId=${channelId}&encodeURIComponent=${encodeURIComponent(attachmentUrl)}`, {}))
    }

    async deleteAttachment({ channelId, attachmentUrl }): Promise<any> {
        return await lastValueFrom(this.http
            .delete(
                `${environment.apiUrl
                }/channels/attachments?channelId=${channelId}&encodeURIComponent=${encodeURIComponent(
                    attachmentUrl
                )}`
            ))
    }

    async updateChannel(body): Promise<any> {
        return await lastValueFrom(this.http
            .patch(`${environment.apiUrl}/channels`, body))
    }

    async addChannelNotificationSubscriber({ channelId, userId }) {
        return await lastValueFrom(this.http
            .put(
                `${environment.apiUrl}/channels/notification-subscribers?channelId=${channelId}&userId=${userId}`,
                {}
            ))
    }

    async removeChannelNotificationSubscriber({ channelId, userId }) {
        return await lastValueFrom(this.http
            .delete(
                `${environment.apiUrl}/channels/notification-subscribers?channelId=${channelId}&userId=${userId}`
            ))
    }

    async deleteMembers({ channelId }): Promise<any> {
        return await lastValueFrom(this.http
            .delete(`${environment.apiUrl}/channel-members`, {
                params: { channelId }
            }))
    }

    resetSkipLimit() {
        this.skip = 0
        this.limit = 100
    }

    async getInitialChannels() {
        this.user = this.authService.currentUser
        this.currentChannel = null
        this.hasFilters = false
        this.searchQuery = ''
        this.filterTechList = []

        if (this.user) {
            this.channels = await this.getMyChannels()
        } else {
            this.channels = []
        }
        await this.getChannels(true)
        this.channelsBehavior.next(this.channels)
        return this.channels
    }

    async getMyChannels(): Promise<any> {
        return await lastValueFrom(this.http.get(`${environment.apiUrl}/channels/me/hosted`))
    }

    async getChannelsByUserId({ userId, searchQuery = null, skip = 0, limit = 50 }): Promise<any> {
        return await lastValueFrom(this.http
            .get(`${environment.apiUrl}/channels/user`, { params: { searchQuery, skip, limit } }))
    }

    async getChannels(isRefresh = false) {
        if (isRefresh) {
            this.resetSkipLimit()
        }
        const channels: any = await lastValueFrom(this.http
            .get(`${environment.apiUrl}/channels`, {
                params: {
                    searchQuery: this.searchQuery,
                    techStack: this.filterTechList.map((item) => item.item_text).join(),
                    skip: this.skip,
                    limit: this.limit
                }
            }))
        if (channels.length) {
            this.skip += this.limit
            this.channels.push(...channels)
        } else {
            if ((this.searchQuery || this.filterTechList.length) && !this.skip)
                this.snackBar.open('No results with the search criteria', null, {
                    duration: 2000
                })
        }
        return this.channels
    }

    async searchChannels(): Promise<any[]> {
        try {
            this.channels = []
            if (!this.searchQuery && !this.filterTechList.length) {
                return this.getInitialChannels()
            } else {
                return this.getChannels(true)
            }
        } catch (e) {
            console.log(e)
        }
    }

    async leaveChannel(userId, deleteOrLeaveOnExit: boolean = false): Promise<any> {
        if (this.currentChannel) {
            if (this.currentChannel.user === userId) {
                // if host
                if (deleteOrLeaveOnExit) {
                    await this.removeHostChannelFromUser({
                        hostChannelId: this.currentChannel._id
                    })
                    await this.deleteChannel({ channelId: this.currentChannel._id })
                    await this.deleteMembers({
                        channelId: this.currentChannel._id
                    })
                }
            } else {
                // if participant
                if (deleteOrLeaveOnExit) {
                    await this.removeChannelFromUser({
                        channelId: this.currentChannel._id,
                        userId
                    })
                }
            }
            this.currentChannel = null
        }
    }

    async enterChannel(channel): Promise<any> {
        try {
            this.currentChannel = channel
            return this.currentChannel
        } catch (e) {
            console.log(e)
        }
    }

    async toggleNotifications({ channel, userId }) {
        if (channel?.notificationSubscribers?.includes(userId)) {
            await this.removeChannelFromUser({ channelId: channel._id, userId })
            await this.removeChannelNotificationSubscriber({
                channelId: channel._id,
                userId
            })
        } else {
            await this.addChannelToUser({ channelId: channel._id })
            await this.addChannelNotificationSubscriber({
                channelId: channel._id,
                userId
            })
        }
    }

    async sendToken({ channelId }) {
        await lastValueFrom(this.http
            .get(`${environment.apiUrl}/token/sendToken?channelId=${channelId}`, {
                responseType: 'text'
            })).then((res) => {
                return this.snackBar.open('You received 1 recursion Token', null, {
                    duration: 2500
                })
            }).catch((err) => {
                console.log('Err', err)
            })
    }

    async getTechList() {
        if (this.techList.length < 1) {
            var web2Assets: any = await lastValueFrom(this.http
                .get(`${environment.hostUrl}/assets/images/web2/_techStackWeb2.json`))
            var web3Assets: any = await lastValueFrom(this.http
                .get(`${environment.hostUrl}/assets/images/web3/_techStackWeb3.json`))
            var gameAssets: any = await lastValueFrom(this.http
                .get(`${environment.hostUrl}/assets/images/games/_techStackGames.json`))
            web3Assets.forEach((file) => {
                var fileName = file.item_image.substring(file.item_image.lastIndexOf('/') + 1)
                fileName = fileName.substring(0, fileName.indexOf('.'))
                var nameAndTickerList = fileName.split('-')
                var ticker = nameAndTickerList.pop().toUpperCase()
                var fullName = nameAndTickerList
                    .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
                    .join(' ')
                file.item_text = `${fullName} (${ticker})`
            })
            web2Assets.push(...web3Assets)
            gameAssets.forEach((file) => {
                var fileName = file.item_image.substring(file.item_image.lastIndexOf('/') + 1)
                fileName = fileName.substring(0, fileName.indexOf('.'))
                var nameSplitList = fileName.split('-')
                var fullName = nameSplitList
                    .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
                    .join(' ')
                file.item_text = fullName
            })
            web2Assets.push(...gameAssets)
            this.techList = web2Assets
            this.techList.sort((a, b) => a.item_text.localeCompare(b.item_text))
        }
    }
}
