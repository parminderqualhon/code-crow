import { Injectable } from '@angular/core'
import { UserService } from './user.service'
import { HttpClient } from '@angular/common/http'
import { TokenStorage } from '../auth/token.storage'
import { ChatService } from './chat.service'
import { Socket } from './socket.service'
import { AuthService } from '../auth/auth.service'
import { ChannelService } from './channel.service'
import { NotificationService } from './notification.service'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class GroupchatService {
    constructor(
        public http: HttpClient,
        public tokenStorage: TokenStorage,
        public chatService: ChatService,
        public channelService: ChannelService,
        public notificationService: NotificationService,
        public socket: Socket,
        public authService: AuthService,
        public userService: UserService
    ) {}

    async createGroup(host, members, groupName, channelId) {
        return this.http
            .post(`${environment.apiUrl}/groups/create-group`, {
                host,
                members,
                groupName,
                channelId
            })
            .toPromise()
    }

    async getGroupList() {
        return this.http.get(`${environment.apiUrl}/groups`).toPromise()
    }

    async updateGroup(groupId, members, groupName) {
        return this.http
            .post(`${environment.apiUrl}/groups/update-group`, {
                groupId,
                members,
                groupName
            })
            .toPromise()
    }

    async deleteGroup(groupId) {
        return this.http.post(`${environment.apiUrl}/groups/delete-group`, { groupId }).toPromise()
    }

    async updateHostMemberGroup(groupId, members, host) {
        return this.http
            .post(`${environment.apiUrl}/groups/update-host-member-group`, {
                groupId,
                members,
                host
            })
            .toPromise()
    }
}
