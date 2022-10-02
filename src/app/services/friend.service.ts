import { SfxService, SoundEffect } from './sfx.service'
import { Injectable, EventEmitter } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Socket } from './socket.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ChatService } from './chat.service'
import { UserService } from './user.service'
import { AuthService } from '../auth/auth.service'
import { environment } from '../../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class FriendService {
    public fullList = []
    public sentRequests = []
    public receivedRequests = []
    public friendsList = []
    public blockedUsers = []
    public allUsers = []
    public isGettingFriends: boolean = false
    public friendsLoadedEmmiter: EventEmitter<any> = new EventEmitter<any>()
    private skip: any
    private limit: any
    public isShowingSearchResults: boolean = false
    public searchResults: any = []

    constructor(
        private http: HttpClient,
        public socket: Socket,
        private snackBar: MatSnackBar,
        public friendsChatService: ChatService,
        private userService: UserService,
        private sfxService: SfxService,
        private authService: AuthService
    ) {
        this.resetSkipLimit()
    }

    resetSkipLimit() {
        this.skip = 0
        this.limit = 100
    }

    public async getAllUsers(isRefresh: boolean = false): Promise<any> {
        if (isRefresh) {
            this.resetSkipLimit()
        }
        this.isGettingFriends = true
        const searchResults: any = await this.http
            .get(`${environment.apiUrl}/users`, {
                params: { searchQuery: '', skip: this.skip, limit: this.limit }
            })
            .toPromise()
        if (searchResults.length) this.skip += this.limit
        if (isRefresh) {
            this.allUsers = searchResults
        } else if (searchResults.length) {
            this.allUsers.push(...searchResults)
        }
        this.isGettingFriends = false
        return this.allUsers
    }

    async searchUsers(query) {
        try {
            if (!query) {
                // await this.getFriendList()
                await this.getAllUsers(true)
                // if (this.allUsers.length < 25) await this.getPlaceholderUsers()
                this.isShowingSearchResults = false
            } else if (query.length >= 3) {
                this.searchResults = await this.http
                    .get(`${environment.apiUrl}/users`, {
                        params: {
                            searchQuery: encodeURIComponent(query),
                            skip: '0',
                            limit: '100'
                        }
                    })
                    .toPromise()
                this.isShowingSearchResults = true
                if (this.searchResults && !this.searchResults.length) {
                    this.snackBar.open('No users were found for your search criteria', null, {
                        duration: 2000
                    })
                }
            } else {
                await this.getAllUsers(true)
                // if (this.allUsers.length < 25) await this.getPlaceholderUsers()
                this.isShowingSearchResults = false
                this.snackBar.open('Please input at least 3 characters', null, {
                    duration: 2000
                })
            }
            return this.searchResults
        } catch (e) {
            this.isShowingSearchResults = false
        }
    }

    public blockUser(recipient): Promise<any> {
        return this.http
            .post(`${environment.apiUrl}/friends/block?recipient=${recipient}`, {})
            .toPromise()
    }

    public unblockUser(recipient): Promise<any> {
        return this.http
            .delete(`${environment.apiUrl}/friends/block?recipient=${recipient}`, {})
            .toPromise()
    }

    public async getFriendList() {
        var friends = []
        const user = this.authService.currentUser
        if (user) {
            const response: any = await this.http.get(`${environment.apiUrl}/friends`).toPromise()
            if (response && response.friends) {
                friends = response.friends.map((friend) =>
                    friend.recipient && friend.recipient._id == user._id
                        ? {
                            status: friend.status,
                            user: friend.requester,
                            channelId: friend.channelId,
                            lastMessage: friend.lastMessage ? friend.lastMessage : '',
                            unreadMessageCount: friend.unreadMessageCount
                        }
                        : {
                            status: friend.status,
                            user: friend.recipient,
                            channelId: friend.channelId,
                            lastMessage: friend.lastMessage ? friend.lastMessage : '',
                            unreadMessageCount: friend.unreadMessageCount
                        }
                )
                this.filterFriends(friends)
                if (this.allUsers)
                    this.allUsers = this.allUsers.filter(
                        (allUser) =>
                            !this.fullList.some((friend) => friend.user._id === allUser.user._id)
                    )
            }
        }
    }

    private filterFriends(friends) {
        if (friends) {
            // this.fullList = friends.map(friend => this.socket.addConnectionEvent(friend))
            this.friendsList = this.fullList.filter((friend) => !!(friend.status == 3))
            this.sentRequests = this.fullList.filter((friend) => !!(friend.status == 1))
            this.receivedRequests = this.fullList.filter((friend) => !!(friend.status == 2))
            this.blockedUsers = this.fullList.filter((friend) => !!(friend.status == 4))
        }
    }

    public friendOnlineNotification(friend) {
        this.snackBar.open(`${friend.user.displayName} is now online`, null, {
            duration: 3000
        })
    }

    public async friendRequestNotification(request) {
        this.sfxService.playAudio(SoundEffect.FriendRequestReceived)
        const requester = await this.userService.getUserById(request)
        this.getFriendList()
        const snackBarRef = this.snackBar.open(
            `${requester.displayName} wants to add you as a friend`,
            'Accept',
            { duration: 5000 }
        )
        snackBarRef.onAction().subscribe(async () => {
            try {
                // await this.acceptFriendRequest(requester._id)
                this.getFriendList()
                this.snackBar.open(`You and ${requester.displayName} are now friends`, null, {
                    duration: 5000
                })
            } catch (e) {
                console.log(e)
            }
        })
    }

    public async friendAddedNotification(request) {
        const recipient = await this.userService.getUserById(request)
        this.getFriendList()
        this.snackBar.open(`${recipient.displayName} accepted your friend request`, null, {
            duration: 5000
        })
    }
}
