import { StreamingService } from './../../services/streaming.service'
import { Component, OnInit, ViewChild } from '@angular/core'
import { ChatService } from '../../services/chat.service'
import { TokenStorage } from '../../auth/token.storage'
// import { ChartDataSets, ChartOptions } from 'chart.js'
// import { Color, BaseChartDirective, Label } from 'ng2-charts'
// import * as moment from 'moment'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { ChannelService } from '../../services/channel.service'
import { UserService } from '../../services/user.service'
import { AuthService } from '../../auth/auth.service'

@Component({
    selector: 'app-channels',
    templateUrl: './channels.component.html',
    styleUrls: ['./channels.component.scss']
})
export class ChannelsComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator

    public displayedColumns: string[] = ['title']
    public dataSource: MatTableDataSource<any>
    public channels: any
    public channel: any
    public isEditingChannel: Boolean = false
    public channelUsers: any
    public blockedUsers: any
    public userId: string
    public filter: string

    public pageNumber: number = 0
    public pageLimit: number = 5
    public totalCount: number = 0

    constructor(
        public chatService: ChatService,
        public channelService: ChannelService,
        public streamingService: StreamingService,
        public tokenStorage: TokenStorage,
        private userService: UserService,
        private authService: AuthService
    ) {}

    async ngOnInit() {
        this.channels = await this.channelService.getChannels(true)
        this.dataSource = new MatTableDataSource(this.channels)
        this.totalCount = this.channels.length
        console.log(this.channels)
    }

    public async filterChannels(filterValue: string) {
        this.filter = filterValue.trim()
        this.pageNumber = 0
        await this.loadChannelsPage()
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage()
        }
    }

    public changePage($event) {
        this.pageLimit = $event.pageSize
        this.pageNumber = $event.pageIndex
        this.loadChannelsPage()
    }

    async loadChannelsPage() {
        // await this.channelService.searchChannels(this.filter)
        this.dataSource = new MatTableDataSource(this.channelService.channels)
        this.totalCount = this.channelService.channels.length
    }

    public async showChannel(channel) {
        if (this.channel && this.channel._id == channel._id) {
            console.log('>> CONDITION TRUE')
        } else {
            const user = this.authService.currentUser
            // this.channelService.enterChannel(channel._id, user)
            //   .then(async () => {
            this.channelUsers = await this.userService.getUsersByIds(
                channel?.notificationSubscribers
            )
            // this.lineChartData[0].data = this.getWeekActivity(this.chatService.messages, 'timestamp', 'lineChartLabels', 'lastWeekMessages')

            this.channel = await this.channelService.getChannel({
                channelId: channel._id
            })
            // const liveStreamingWeekActivity = this.getWeekActivity(this.channel.liveStreaming, 'startDate', 'lineChartLabels', 'lastWeekStreams')

            // const arr = new Array(7).fill([])
            // const keys = Object.keys(this.lastWeekStreams).map(i => parseInt(i))
            // arr.forEach(($arr, i) => {
            //   if (keys.indexOf(i) > -1)
            //     arr[i] = this.lastWeekStreams[i.toString()]
            // })
            // const durations = arr.map($arr => $arr.length ? $arr.reduce((accumulator, currentValue) => accumulator + currentValue.duration, 0) : 0)
            // const participants = arr.map($arr => $arr.length ? $arr.reduce((accumulator, currentValue) => accumulator + currentValue.participants.length, 0) : 0)

            // this.streamingLineChartData = [
            //   {
            //     data: durations,
            //     yAxisID: 'A',
            //     label: 'Duration (sec.)',
            //     fill: false
            //   },
            //   {
            //     data: participants,
            //     yAxisID: 'B',
            //     label: 'Participants',
            //     fill: false
            //   }
            // ]

            this.blockedUsers = await channel.blockedUsers
            this.channelUsers = this.channelUsers.filter((channelUser) =>
                this.blockedUsers.indexOf(channelUser) > -1 || channelUser == user._id
                    ? false
                    : true
            )
            this.channel = channel
            this.isEditingChannel = !this.isEditingChannel
            // })
        }
    }

    // public lastWeekMessages: any = []
    // public lastWeekStreams: any = []

    // getWeekActivity(arr, key, that, id) {
    //   const weekObj = {}
    //   const weekofYear = arr.map(val => {
    //     const int = moment(val[key]).format('w')
    //     weekObj[int] ? weekObj[int].push(val) : weekObj[int] = [val]
    //     return parseInt(int)
    //   })
    //   const maxNumber = Math.max(...weekofYear)
    //   const lastWeekActivity = weekObj[maxNumber.toString()] || []
    //   const dayObj = {}
    //   const dayofWeek = lastWeekActivity.map(value => {
    //     const int = moment(value[key]).format('d')
    //     dayObj[int] ? dayObj[int].push(value) : dayObj[int] = [value]
    //     return parseInt(int)
    //   })
    //   this[id] = dayObj
    //   const values = this[that].map((day, i) => dayObj[i.toString()] ? dayObj[i.toString()].length : 0)
    //   return values
    // }

    async blockUser(userId) {
        try {
            const block = await this.channelService.blockUserFromChannel({
                channelId: this.channel._id,
                userId
            })
            await this.channelService.removeChannelNotificationSubscriber({
                channelId: this.channelService.currentChannel._id,
                userId
            })
            this.channelUsers = this.channelUsers.filter((user) =>
                user._id == userId ? false : true
            )
            this.blockedUsers.push(block)
        } catch (e) {
            console.log(e)
        }
    }

    async unblockUser(userId) {
        try {
            const unblock = await this.channelService.unblockUserFromChannel({
                channelId: this.channel._id,
                userId
            })
            this.blockedUsers = this.blockedUsers.filter((block) =>
                block._id == userId ? false : true
            )
            this.channelUsers.push(unblock)
        } catch (e) {
            console.log(e)
        }
    }

    async deleteChannel() {
        const bool = confirm(
            `Are you sure you want to delete channel ${this.channel.title}?\nAll chat and data will be obliterated.`
        )
        if (bool) {
            this.channelService.deleteChannel({ channelId: this.channel._id })
            this.channels = this.channels.filter((c) => (c._id != this.channel._id ? true : false))
            this.channel = null
            this.isEditingChannel = false
        }
    }

    // public lineChartData: any = [
    //   {
    //     data: [],
    //     fill: false
    //   }
    // ]
    // public streamingLineChartData: any = [
    //   {
    //     data: [],
    //     fill: false
    //   }
    // ]
    // public lineChartLabels: any[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    // public lineChartOptions: any = {
    //   responsive: true,
    //   scales: {
    //     gridLines: {
    //       display: false
    //     }
    //   },
    //   maintainAspectRatio: false,
    //   legend: {
    //     display: false
    //   }
    // };
    // public streamLineChartOptions: any = {
    //   responsive: true,
    //   scales: {
    //     gridLines: {
    //       display: false
    //     },
    //     yAxes: [
    //       {
    //         id: 'A',
    //         type: 'linear',
    //         position: 'left',
    //       },
    //       {
    //         id: 'B',
    //         type: 'linear',
    //         position: 'right'
    //       }
    //     ]
    //   },
    //   maintainAspectRatio: false,
    //   legend: {
    //     display: false
    //   }
    // }
    // public lineChartColors: any = [
    //   {
    //     backgroundColor: 'rgba(148,159,177,0.2)',
    //     borderColor: 'rgba(148,159,177,1)',
    //     pointBackgroundColor: 'rgba(148,159,177,1)',
    //     pointBorderColor: '#fff',
    //     pointHoverBackgroundColor: '#fff',
    //     pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    //   }
    // ];
    // public lineChartLegend = true;
    // public lineChartType = 'line';
}
