import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { StreamingService } from '../../../../services/streaming.service'
import { HintService } from '../../../../services/hint.service'

@Component({
    selector: 'app-video',
    templateUrl: './video.component.html',
    styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
    @ViewChild('screenContainer') screenContainer: ElementRef
    public hint: string

    constructor(private hintService: HintService) {}

    async ngOnInit() {
        const hint = await this.hintService.getRandomHint()
        if (hint) {
            this.hint = hint.text
        }
    }

    sideScroll(direction) {
        this.screenContainer.nativeElement.scrollTo({
            top: 0,
            left:
                this.screenContainer.nativeElement.scrollLeft +
                (direction === 'left' ? -1 : 1) * this.screenContainer.nativeElement.clientWidth,
            behavior: 'smooth'
        })
    }
}
