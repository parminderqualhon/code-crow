import { Component, Output, EventEmitter, OnDestroy } from '@angular/core'
import { ChannelService } from '../../../services/channel.service'
import { StreamingService } from '../../../services/streaming.service'
import { ChatService } from '../../../services/chat.service'
import { Subscription } from 'rxjs'

@Component({
    selector: 'app-content',
    templateUrl: './content.component.html',
    styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnDestroy {
    @Output() leavegroupEvent = new EventEmitter<any>()
    @Output() editgroupEvent = new EventEmitter<any>()
    @Output() toggleMobileChat = new EventEmitter<any>()
    streamControlComponentSubscription = new Subscription()

    constructor(
        public channelService: ChannelService,
        public streamingService: StreamingService,
        public chatService: ChatService
    ) {}

    leaveGroup(value) {
        this.leavegroupEvent.emit(value)
    }

    editGroup(group) {
        this.editgroupEvent.emit(group)
    }

    ngOnDestroy() {
        this.streamControlComponentSubscription.unsubscribe()
    }
}
