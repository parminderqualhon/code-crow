import {
    Component,
    OnInit,
    ViewChild,
    Input,
    ElementRef,
    Renderer2,
    EventEmitter,
    Output
} from '@angular/core'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { CreatorSpaceService } from '../../creator-space.service'
import { ChatService } from '../../../../services/chat.service'
import { VideoService } from '../../../../services/video.service'
import { TokenStorage } from '../../../../auth/token.storage'
import { HttpEvent, HttpEventType } from '@angular/common/http'
// import { ChartDataSets, ChartOptions } from 'chart.js'
// import { Color, Label } from 'ng2-charts'
// import * as moment from 'moment'
import * as _ from 'lodash'
import { DomSanitizer } from '@angular/platform-browser'
import { Util } from '../../../../util/util'
import { DialogService } from '../../../../services/dialog.service'
import { DialogData } from '../../../../shared/dialog-data'
import { MatSnackBar } from '@angular/material/snack-bar'
import { UserService } from '../../../../services/user.service'
import { AdminService } from '../../../../services/admin.service'
import { AuthService } from '../../../../auth/auth.service'

@Component({
    selector: 'app-creator-videos-table',
    templateUrl: './creator-videos-table.component.html',
    styleUrls: ['./creator-videos-table.component.scss']
})
export class CreatorVideosTableComponent implements OnInit {
    @Input() videos: any
    @Output() videosEvent = new EventEmitter()
    @ViewChild('videoPreview', { static: false }) videoPreviewElement: ElementRef
    @ViewChild('fileInput', { static: false }) fileInput: ElementRef
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator
    @ViewChild(MatSort, { static: true }) sort: MatSort
    @ViewChild('videothumbnail', { static: false }) videoThumbnail: ElementRef

    public file: File
    public progress: number = 0
    public videoURL
    public videoDuration: number
    public videoUploaded: boolean = false
    public thumbnail: File

    public date = new Date()
    public monthFirstDay = new Date(this.date.getFullYear(), this.date.getMonth(), 1)
    public monthLastDay = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0)
    public arrayofDays = this.getDates(this.monthFirstDay, this.monthLastDay, 'YYYY-MM-DD')
    // public momentDate = moment(this.date).format('MMMM-YYYY')

    public displayedColumns: string[] = [
        'title',
        'createdAt',
        'views',
        'rate',
        'duration',
        'status',
        'delete',
        'options',
        'download'
    ]
    public dataSource: MatTableDataSource<any>
    public video: any
    public isUploading = false

    constructor(
        public chatService: ChatService,
        public tokenStorage: TokenStorage,
        public creatorSpaceService: CreatorSpaceService,
        public videoService: VideoService,
        private adminService: AdminService,
        public sanitizer: DomSanitizer,
        private renderer: Renderer2,
        private dialogService: DialogService,
        private snackBar: MatSnackBar,
        private userService: UserService,
        private authService: AuthService
    ) {}

    public async uploadVideo($event) {
        try {
            if ($event.target.files.length > 0) {
                this.isUploading = true
                this.file = $event.target.files[0]
                this.videoURL = this.sanitizer.bypassSecurityTrustResourceUrl(
                    URL.createObjectURL(this.file)
                )
                this.renderer.listen(
                    this.videoPreviewElement.nativeElement,
                    'loadedmetadata',
                    () => {
                        this.videoDuration = this.videoPreviewElement.nativeElement.duration
                        const rand = Math.round(Math.random() * this.videoDuration * 1000) + 1
                        this.videoPreviewElement.nativeElement.currentTime = rand
                    }
                )

                this.renderer.listen(this.videoPreviewElement.nativeElement, 'seeked', () => {
                    const context = this.videoThumbnail.nativeElement.getContext('2d')
                    const { width, height } = this.videoThumbnail.nativeElement
                    context.drawImage(this.videoPreviewElement.nativeElement, 0, 0, width, height)
                    const imgUnit8 = this.videoThumbnail.nativeElement.toDataURL('image/png')
                    const imgBlob = this.dataURItoBlob(imgUnit8)
                    console.log(
                        $event.target.files[0].name.substr(
                            0,
                            $event.target.files[0].name.lastIndexOf('.')
                        ) + '.png'
                    )
                    this.thumbnail = this.blobToFile(
                        imgBlob,
                        $event.target.files[0].name.substr(
                            0,
                            $event.target.files[0].name.lastIndexOf('.')
                        ) + '.png'
                    )
                })

                try {
                    const { _id } = this.authService.currentUser
                    const videoUpload = await this.adminService.getUploadURL(
                        this.file.name,
                        this.file.type,
                        'videos'
                    )
                    this.adminService
                        .uploadFile(this.file, videoUpload.url)
                        .subscribe(async (event: HttpEvent<any>) => {
                            switch (event.type) {
                                case HttpEventType.UploadProgress:
                                    this.progress = Math.round((event.loaded / event.total) * 100)
                                    break
                                case HttpEventType.Response:
                                    try {
                                        const thumbnailUpload =
                                            await this.adminService.getUploadURL(
                                                this.thumbnail.name,
                                                this.thumbnail.type,
                                                'videos'
                                            )
                                        this.adminService
                                            .uploadFile(this.thumbnail, thumbnailUpload.url)
                                            .subscribe(async ($event: HttpEvent<any>) => {
                                                switch ($event.type) {
                                                    case HttpEventType.Response:
                                                        try {
                                                            const channelId = 'gen-' + Util.guid()
                                                            const video =
                                                                await this.videoService.uploadVideoByUrl(
                                                                    {
                                                                        url: event.url,
                                                                        duration:
                                                                            this.videoDuration,
                                                                        title: this.file.name.substr(
                                                                            0,
                                                                            this.file.name.lastIndexOf(
                                                                                '.'
                                                                            )
                                                                        ),
                                                                        thumbnail: {
                                                                            Location:
                                                                                $event.url.substr(
                                                                                    0,
                                                                                    $event.url.indexOf(
                                                                                        '?'
                                                                                    )
                                                                                )
                                                                        },
                                                                        channelId: channelId
                                                                    }
                                                                )
                                                            this.ngOnInit()
                                                            this.videoUploaded = true
                                                            setTimeout(() => {
                                                                this.progress = 0
                                                                this.videoUploaded = false
                                                                this.file = null
                                                                this.thumbnail = null
                                                                this.fileInput.nativeElement.value =
                                                                    ''
                                                                this.isUploading = false
                                                            }, 1500)
                                                            if (video) {
                                                                await this.getMyVideos()
                                                            }
                                                        } catch (e) {
                                                            console.log(e)
                                                            this.isUploading = false
                                                        }
                                                }
                                            })
                                    } catch (e) {
                                        console.log(e)
                                        this.isUploading = false
                                    }
                            }
                        })
                } catch (e) {
                    console.log(e)
                    this.isUploading = false
                }
            }
        } catch (e) {
            console.log(e)
            this.isUploading = false
        }
    }

    public selectVideo() {
        this.fileInput.nativeElement.click()
    }

    showStatistics(video) {
        this.video = video
        const timestamps = _(this.video.views)
            .map((view) => view.viewsTimestamps)
            .flatten()
            .value()

        const values = this.getMonthActivity(timestamps, 'date')
        const viewsData = new Array(this.lineChartLabels.length).fill(0)
        const viewsDuration = new Array(this.lineChartLabels.length).fill(0)

        this.arrayofDays.forEach((day, index) => {
            viewsData[index] = values[day]
                ? values[day].reduce((accumulator, currentValue) => accumulator + 1, 0)
                : 0
        })
        this.arrayofDays.forEach((day, index) => {
            viewsDuration[index] = values[day]
                ? values[day].reduce(
                      (accumulator, currentValue) => accumulator + currentValue.duration,
                      0
                  )
                : 0
        })

        this.lineChartData[0].data = viewsData
        this.lineChartData[1].data = viewsDuration
    }

    async activate($event, id) {
        try {
            const status = $event.checked
            await this.creatorSpaceService.toggleVideoStatus(id, status)
        } catch (e) {
            console.log(e)
        }
    }

    async deleteVideo(id: string) {
        try {
            this.openDialog(id)
        } catch (e) {
            console.log(e)
        }
    }

    async downloadVideo(video) {
        var videoURL = await this.videoService.getVideoStream({ id: video._id })
        window.open(`${videoURL}`)
    }

    toggleView() {
        this.video = null
    }

    async getMyVideos() {
        const { _id } = this.authService.currentUser
        this.videos = await this.creatorSpaceService.getUserVideos(_id)
        this.ngOnInit()
        this.videosEvent.emit()
    }

    async ngOnInit() {
        await this.videos.forEach((video: any) => {
            video.totalViews = video.views.length
                ? video.views.map((view) => view.viewCounter).reduce((a, b) => a + b)
                : 0
            video.totalRate = Math.round(
                (video.likes.filter((like) => like.status).length / video.likes.length) * 100
            )
        })
        this.dataSource = new MatTableDataSource(this.videos)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase()
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage()
        }
    }

    public getDates(startDate, stopDate, format) {
        const dateArray = []
        // let currentDate = moment(startDate)
        // const $stopDate = moment(stopDate)
        // while (currentDate <= $stopDate) {
        //     dateArray.push(moment(currentDate).format(format))
        //     currentDate = moment(currentDate).add(1, 'days')
        // }
        return dateArray
    }

    public getMonthActivity(arr, key) {
        const obj = {}
        // arr.forEach((value) => {
        //     const int = moment(value[key]).format('YYYY-MM-DD')
        //     obj[int] ? obj[int].push(value) : (obj[int] = [value])
        // })
        return obj
    }

    public lineChartData: any = [
        {
            data: [],
            fill: false,
            label: 'Views'
        },
        {
            data: [],
            fill: false,
            label: 'Watch Time (s)'
        }
    ]
    public lineChartLabels: any[] = this.getDates(this.monthFirstDay, this.monthLastDay, 'dd-Do')
    public lineChartOptions: any = {
        responsive: true,
        scales: {
            gridLines: {
                display: false
            }
        },
        maintainAspectRatio: false,
        legend: {
            display: false
        }
    }
    public lineChartColors: any = [
        {
            backgroundColor: 'rgba(148,159,177,0.2)',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }
    ]
    public lineChartLegend = true
    public lineChartType = 'line'

    public dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1])
        const mimeString = dataURI.split(',')[0].split(':')[1].split('')[0]
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (var i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i)

        return new Blob([ab], { type: mimeString })
    }

    public blobToFile = (theBlob: Blob, fileName: string): File => {
        const file = new File([theBlob], fileName)
        return file
    }

    async openDialog(id) {
        const dialogData: DialogData = {
            title: 'Delete video',
            message:
                'Deleting a video can not be undone.<br/>Note: that you can always set your videos to private to hide them. Are you sure you want to proceed?',
            okText: 'Ok',
            cancelText: 'Cancel'
        }

        const dialogRef = this.dialogService.openDialog(dialogData, {
            disableClose: true
        })

        dialogRef.afterClosed().subscribe(async (result) => {
            try {
                if (result) {
                    await this.creatorSpaceService.deleteVideo(id)
                    this.getMyVideos()
                }
            } catch (e) {
                this.snackBar.open('An error has occured, please try again later', null, {
                    duration: 2000
                })
            }
        })
    }
}
