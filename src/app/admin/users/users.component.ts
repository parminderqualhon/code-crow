import { UserService } from './../../services/user.service'
import { ChannelService } from '../../services/channel.service'
import { Component, OnInit, ViewChild } from '@angular/core'
import { ChatService } from '../../services/chat.service'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { AdminService } from '../../services/admin.service'
import { FriendService } from '../../services/friend.service'

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator
    @ViewChild(MatSort, { static: true }) sort: MatSort
    public displayedColumns: string[] = [
        'name',
        'email',
        'loginProvider',
        'hostChannel',
        'channel',
        'options'
    ]
    public dataSource: MatTableDataSource<any>
    public isShowingUser: boolean = false
    public shownUser: any
    public users = []

    constructor(
        public chatService: ChatService,
        public channelService: ChannelService,
        public adminService: AdminService,
        private friendsService: FriendService,
        private userService: UserService
    ) {
        this.dataSource = new MatTableDataSource(this.users)
    }

    async ngOnInit() {
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
        this.users = await this.friendsService.getAllUsers()
        this.dataSource = new MatTableDataSource(this.users.map((user) => user.user))
    }

    public async showUser(user) {
        this.shownUser = user
        this.isShowingUser = !this.isShowingUser
    }

    public async toggleBan() {
        await this.adminService.setUserBan(this.shownUser._id, !this.shownUser.isBanned)
    }

    async searchUsers(name: string) {
        try {
            if (!name) {
                this.users = await this.friendsService.getAllUsers()
                this.dataSource = new MatTableDataSource(this.users.map((user) => user.user))
            } else if (name.length >= 4) {
                this.users = await this.userService.getUsersByName(name)
                this.dataSource = new MatTableDataSource(this.users)
            }
        } catch (e) {
            console.log(e)
        }
    }
}
