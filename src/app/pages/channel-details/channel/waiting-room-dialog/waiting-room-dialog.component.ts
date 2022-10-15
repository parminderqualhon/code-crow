import { Component, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { Socket } from '../../../../services/socket.service'
import { AuthService } from '../../../../auth/auth.service'

@Component({
    selector: 'app-waiting-room-dialog',
    templateUrl: './waiting-room-dialog.component.html',
    styleUrls: ['./waiting-room-dialog.component.scss']
})
export class WaitingRoomDialogComponent implements OnInit {
    public hasRequestedAccess: boolean = false

    constructor(
        private dialogRef: MatDialogRef<WaitingRoomDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private router: Router,
        private socket: Socket,
        private authService: AuthService
    ) {}

    async ngOnInit() {
        this.socket.listenToChannelAccessResponse({ channelId: this.data.channel._id })
            .subscribe((data) => {
                if (data.isGrantedAccess) {
                    this.router.navigate(['/channel', this.data.channel._id])
                } else {
                    this.onNoClick()
                }
            })
    }

    onNoClick() {
        this.dialogRef.close()
    }

    async requestAccess() {
        this.hasRequestedAccess = true
        this.socket.emitChannelAccessRequest({
            channelId: this.data.channel._id,
            userId: this.authService.currentUser._id
        })
        setTimeout(() => {
            this.hasRequestedAccess = false
        }, 30000)
    }
}
