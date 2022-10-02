import { DialogService } from './../../../services/dialog.service'
import { Component, OnInit, ViewChild, Inject } from '@angular/core'
import { AdminService } from '../../../services/admin.service'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { FriendService } from '../../../services/friend.service'
import { DialogData } from '../../../shared/dialog-data'

@Component({
    selector: 'app-add-admin',
    templateUrl: './add-admin.component.html',
    styleUrls: ['./add-admin.component.scss']
})
export class AddAdminComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator
    @ViewChild(MatSort, { static: true }) sort: MatSort
    public displayedColumns: string[] = ['name', 'email', 'loginProvider', 'options']
    public dataSource: MatTableDataSource<any>
    public users: any = []
    public adminRole: any

    constructor(
        private adminService: AdminService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<AddAdminComponent>,
        private friendService: FriendService,
        private dialogService: DialogService
    ) {}

    ngOnInit() {
        console.log(this.data)
    }

    addAdmin(userId: string, username: string) {
        const dialogData: DialogData = {
            title: 'Confirm promoting user',
            message: `Are you sure you want to promote user ${username} to admin?`,
            okText: 'CONFIRM',
            cancelText: 'CLOSE'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    await this.adminService.addAdmin(userId, this.data.roleId)
                    this.dialogRef.close()
                } catch (e) {
                    console.log(e)
                }
            }
        })
    }

    async applyFilter(filterValue: string) {
        this.users = await this.friendService.searchUsers(filterValue)
        this.dataSource = new MatTableDataSource(this.users.map((user) => user.user))
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }
}
