import { UserService } from './../../../services/user.service'
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core'
import { FriendService } from './../../../services/friend.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DialogService } from '../../../services/dialog.service'
import { DialogData } from '../../../shared/dialog-data'
import { Router } from '@angular/router'
import { GroupchatService } from '../../../services/groupchat.service'
import { ChannelService } from '../../../services/channel.service'
import { AuthService } from '../../../auth/auth.service'
import { ChatService } from '../../../services/chat.service'

// @Component({
//     template: `
//         <button
//             [disabled]="friend.isPlaceholder"
//             class="app-frienditem-td-button"
//             title="Friend options"
//             mat-icon-button
//             (click)="$event.stopPropagation()"
//             [matMenuTriggerFor]="friends_more_menu"
//         >
//             <span class="friends-more"></span>
//         </button>
//         <mat-menu
//             #friends_more_menu="matMenu"
//             [xPosition]="'before'"
//             class="friend-list-menu"
//         >
//             <section class="user-menu">
//                 <div (click)="sendFriendRequest()">
//                     <mat-icon>person_add</mat-icon>
//                     <span class="nav-caption"> Add </span>
//                 </div>
//                 <div (click)="blockUser()">
//                     <mat-icon>block</mat-icon>
//                     <span class="nav-caption"> Block </span>
//                 </div>
//             </section>
//         </mat-menu>
//     `,
//     styleUrls: ['./friends-menus.component.scss'],
//     selector: 'friends-menu-one',
//     encapsulation: ViewEncapsulation.None,
// })
// export class FriendsMenuOne {
//     @Input() friend: any
//     constructor(
//         private friendService: FriendService,
//         private snackBar: MatSnackBar,
//         public userService: UserService
//     ) { }

//     async sendFriendRequest() {
//         try {
//             // await this.friendService.sendFriendRequest(this.friend._id)
//             await this.friendService.getFriendList()
//             this.snackBar.open(
//                 `Friend request sent to ${this.friend.username}`,
//                 null,
//                 { duration: 5000 }
//             )
//         } catch (e) {
//             console.log(e)
//         }
//     }

//     async blockUser() {
//         try {
//             await this.friendService.blockUser(this.friend._id)
//             await this.friendService.getFriendList()
//             this.snackBar.open(`You've blocked ${this.friend.username}`, null, {
//                 duration: 5000,
//             })
//         } catch (e) {
//             console.log(e)
//         }
//     }
// }

// @Component({
//     template: `
//         <button
//             class="app-frienditem-td-button"
//             title="Friend options"
//             mat-icon-button
//             (click)="$event.stopPropagation()"
//             [matMenuTriggerFor]="friends_more_menu"
//         >
//             <span class="friends-more"></span>
//         </button>
//         <mat-menu
//             #friends_more_menu="matMenu"
//             [xPosition]="'before'"
//             class="friend-list-menu"
//         >
//             <section class="user-menu">
//                 <div (click)="cancelFriendRequest()">
//                     <mat-icon>person_add_disabled</mat-icon>
//                     <span class="nav-caption"> Cancel </span>
//                 </div>
//                 <div (click)="blockUser()">
//                     <mat-icon>block</mat-icon>
//                     <span class="nav-caption"> Block </span>
//                 </div>
//             </section>
//         </mat-menu>
//     `,
//     styleUrls: ['./friends-menus.component.scss'],
//     selector: 'friends-menu-two',
//     encapsulation: ViewEncapsulation.None,
// })
// export class FriendsMenuTwo {
//     @Input() friend: any
//     constructor(
//         private friendService: FriendService,
//         private snackBar: MatSnackBar
//     ) { }

//     async cancelFriendRequest() {
//         try {
//             // await this.friendService.cancelFriendRequest(this.friend._id)
//             await this.friendService.getFriendList()
//             this.snackBar.open(
//                 `Friend request to ${this.friend.username} has been canceled`,
//                 null,
//                 { duration: 5000 }
//             )
//         } catch (e) {
//             console.log(e)
//         }
//     }

//     async blockUser() {
//         try {
//             await this.friendService.blockUser(this.friend._id)
//             await this.friendService.getFriendList()
//             this.snackBar.open(`You've blocked ${this.friend.username}`, null, {
//                 duration: 5000,
//             })
//         } catch (e) {
//             console.log(e)
//         }
//     }
// }

// @Component({
//     template: `
//         <button
//             class="app-frienditem-td-button"
//             title="Friend options"
//             mat-icon-button
//             (click)="$event.stopPropagation()"
//             [matMenuTriggerFor]="friends_more_menu"
//         >
//             <span class="friends-more"></span>
//         </button>
//         <mat-menu
//             #friends_more_menu="matMenu"
//             [xPosition]="'before'"
//             class="friend-list-menu"
//         >
//             <section class="user-menu">
//                 <div (click)="acceptFriendRequest()">
//                     <mat-icon>how_to_reg</mat-icon>
//                     <span class="nav-caption"> Accept </span>
//                 </div>
//                 <div (click)="declineFriendRequest()">
//                     <mat-icon>person_add_disabled</mat-icon>
//                     <span class="nav-caption"> Decline </span>
//                 </div>
//             </section>
//         </mat-menu>
//     `,
//     styleUrls: ['./friends-menus.component.scss'],
//     selector: 'friends-menu-three',
//     encapsulation: ViewEncapsulation.None,
// })
// export class FriendsMenuThree {
//     @Input() friend: any
//     constructor(
//         private friendService: FriendService,
//         private snackBar: MatSnackBar
//     ) { }

//     async acceptFriendRequest() {
//         try {
//             // await this.friendService.acceptFriendRequest(this.friend._id)
//             await this.friendService.getFriendList()
//             this.snackBar.open(
//                 `You and ${this.friend.username} are now friends`,
//                 null,
//                 { duration: 5000 }
//             )
//         } catch (e) {
//             console.log(e)
//             this.snackBar.open(
//                 `Something went wrong, please try again shortly`,
//                 null,
//                 { duration: 5000 }
//             )
//         }
//     }

//     async declineFriendRequest() {
//         try {
//             // await this.friendService.cancelFriendRequest(this.friend._id)
//             await this.friendService.getFriendList()
//             this.snackBar.open(
//                 `You've declined a friend request from ${this.friend.username}`,
//                 null,
//                 { duration: 5000 }
//             )
//         } catch (e) {
//             console.log(e)
//             this.snackBar.open(
//                 `Something went wrong, please try again shortly`,
//                 null,
//                 { duration: 5000 }
//             )
//         }
//     }
// }

// @Component({
//     template: `
//         <button
//             class="app-frienditem-td-button"
//             title="Friend options"
//             mat-icon-button
//             (click)="$event.stopPropagation()"
//             [matMenuTriggerFor]="friends_more_menu"
//         >
//             <span class="friends-more"></span>
//         </button>
//         <mat-menu
//             #friends_more_menu="matMenu"
//             [xPosition]="'before'"
//             class="friend-list-menu"
//         >
//             <section class="user-menu">
//                 <div (click)="removeFriend()">
//                     <mat-icon>remove</mat-icon>
//                     <span class="nav-caption"> Remove </span>
//                 </div>
//                 <div (click)="blockUser()">
//                     <mat-icon>block</mat-icon>
//                     <span class="nav-caption"> Block </span>
//                 </div>
//             </section>
//         </mat-menu>
//     `,
//     styleUrls: ['./friends-menus.component.scss'],
//     selector: 'friends-menu-four',
//     encapsulation: ViewEncapsulation.None,
// })
// export class FriendsMenuFour {
//     @Input() friend: any
//     constructor(
//         private friendService: FriendService,
//         private snackBar: MatSnackBar
//     ) { }

//     async removeFriend() {
//         try {
//             // await this.friendService.cancelFriendRequest(this.friend._id)
//             await this.friendService.getFriendList()
//             this.snackBar.open(
//                 `You've removed ${this.friend.username} from your friend list`,
//                 null,
//                 { duration: 5000 }
//             )
//         } catch (e) {
//             console.log(e)
//         }
//     }

//     async blockUser() {
//         try {
//             await this.friendService.blockUser(this.friend._id)
//             await this.friendService.getFriendList()
//             this.snackBar.open(`You've blocked ${this.friend.username}`, null, {
//                 duration: 5000,
//             })
//         } catch (e) {
//             console.log(e)
//         }
//     }
// }

// @Component({
//     template: `
//         <button
//             class="app-frienditem-td-button"
//             title="Friend options"
//             mat-icon-button
//             (click)="$event.stopPropagation()"
//             [matMenuTriggerFor]="friends_more_menu"
//         >
//             <span class="friends-more"></span>
//         </button>
//         <mat-menu
//             #friends_more_menu="matMenu"
//             [xPosition]="'before'"
//             class="friend-list-menu"
//         >
//             <section class="user-menu">
//                 <div (click)="unblockUser()">
//                     <mat-icon>check_circle_outline</mat-icon>
//                     <span class="nav-caption"> Unblock </span>
//                 </div>
//             </section>
//         </mat-menu>
//     `,
//     styleUrls: ['./friends-menus.component.scss'],
//     selector: 'friends-menu-five',
//     encapsulation: ViewEncapsulation.None,
// })
// export class FriendsMenuFive {
//     @Input() friend: any
//     constructor(
//         private friendService: FriendService,
//         private snackBar: MatSnackBar
//     ) { }

//     async unblockUser() {
//         try {
//             await this.friendService.unblockUser(this.friend._id)
//             await this.friendService.getFriendList()
//             this.snackBar.open(
//                 `You've unblocked ${this.friend.username}`,
//                 null,
//                 { duration: 5000 }
//             )
//         } catch (e) {
//             console.log(e)
//         }
//     }
// }
@Component({
    template: `
        <button
            class="app-frienditem-td-button"
            title="Friend options"
            mat-icon-button
            (click)="$event.stopPropagation()"
            [matMenuTriggerFor]="friends_more_menu">
            <span class="friends-more"></span>
        </button>
        <mat-menu #friends_more_menu="matMenu" [xPosition]="'before'" class="friend-list-menu">
            <section class="user-menu">
                <div (click)="goToChannel()">
                    <mat-icon>how_to_reg</mat-icon>
                    <span class="nav-caption">Channel</span>
                </div>
                <div (click)="leaveGroup()">
                    <mat-icon>person_add_disabled</mat-icon>
                    <span class="nav-caption"> Leave </span>
                </div>
            </section>
        </mat-menu>
    `,
    styleUrls: ['./friends-menus.component.scss'],
    selector: 'app-friends-menu-six',
    encapsulation: ViewEncapsulation.None
})
export class FriendsMenuSixComponent {
    @Input() friendGroup: any

    @Output() leaveMemberEvent = new EventEmitter<any>()

    userId: any
    constructor(
        private friendService: FriendService,
        private snackBar: MatSnackBar,
        private dialogService: DialogService,
        private router: Router,
        private userService: UserService,
        private groupChatService: GroupchatService,
        private channelService: ChannelService,
        private authService: AuthService,
        private chatService: ChatService
    ) {}

    async leaveGroup() {
        const dialogData: DialogData = {
            title: 'Leave Group',
            message: 'Are you sure want to leave the group?',
            okText: 'Ok',
            cancelText: 'Cancel'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe(async (result) => {
            try {
                if (result) {
                    this.userId = this.authService.currentUser._id
                    if (this.userId === this.friendGroup.host._id) {
                        let members = this.friendGroup.members.map((m) => m._id)
                        if (members.length > 0) {
                            let newHost = members[0]
                            members.splice(0, 1)
                            try {
                                await this.groupChatService.updateHostMemberGroup(
                                    this.friendGroup._id,
                                    members,
                                    newHost
                                )
                                this.snackBar.open('You have left the group', null, {
                                    duration: 2000
                                })
                            } catch (e) {
                                this.snackBar.open(
                                    'An error has occured, please try again later',
                                    null,
                                    { duration: 2000 }
                                )
                            }
                        } else if (members.length === 0) {
                            try {
                                let deleteGroup = await this.groupChatService.deleteGroup(
                                    this.friendGroup._id
                                )
                                if (deleteGroup) {
                                    try {
                                        await this.channelService.deleteChannel(
                                            this.friendGroup.channelId
                                        )
                                        if (this.router.url != '/') {
                                            this.router.navigate(['/'])
                                        }
                                        setTimeout(
                                            async () =>
                                                await this.channelService.getInitialChannels(),
                                            100
                                        )
                                        this.snackBar.open('You have left the group', null, {
                                            duration: 2000
                                        })
                                    } catch (e) {
                                        this.snackBar.open(
                                            'An errorc has occured, please try again later',
                                            null,
                                            { duration: 2000 }
                                        )
                                    }
                                }
                            } catch (e) {
                                this.snackBar.open(
                                    'An errorg has occured, please try again later',
                                    null,
                                    { duration: 2000 }
                                )
                            }
                        }
                    } else {
                        let members = this.friendGroup.members.map((m) => m._id)
                        let index = members.indexOf(this.userId)
                        if (members.length >= 1) {
                            members.splice(index, 1)
                            await this.groupChatService.updateGroup(
                                this.friendGroup._id,
                                members,
                                this.friendGroup.groupName
                            )
                            this.closeChat()
                            this.leaveMemberEvent.emit(this.friendGroup)
                            this.snackBar.open('You have left the group', null, {
                                duration: 2000
                            })
                        }
                    }
                    this.closeChat()
                    this.leaveMemberEvent.emit(this.friendGroup)
                }
            } catch (e) {
                this.snackBar.open('An error has occured, please try again later', null, {
                    duration: 2000
                })
            }
        })
    }
    closeChat() {
        let index = this.chatService.activeTabs.indexOf(this.friendGroup)
        this.chatService.activeTabs.splice(index, 1)
    }
    async goToChannel() {
        const dialogData: DialogData = {
            title: 'Go to Channel',
            message: 'Are you sure you want to go to the channel?',
            okText: 'Ok',
            cancelText: 'Cancel'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe(async (result) => {
            try {
                if (result) {
                    this.router.navigate(['/channel', this.friendGroup.channelId])
                }
            } catch (e) {
                this.snackBar.open('An error has occured, please try again later', null, {
                    duration: 2000
                })
            }
        })
    }
}
