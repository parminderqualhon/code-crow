import { Component, ElementRef, Input, ViewChild } from '@angular/core'
import * as _ from 'lodash'

@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent {
    @ViewChild('carouselContainer', { static: true })
    carouselContainer: ElementRef

    @ViewChild('carousel') carousel: ElementRef
    @Input() animationDuration = 700
    @Input() channels: any[]

    public animating = false
    public animateDirection: -1 | 0 | 1 = 0

    carouselStyle() {
        const { matches: isMobile } = window.matchMedia('(max-width: 767px)')

        return {
            transform: this.animating
                ? `translateX(calc(${this.animateDirection} * (${
                      isMobile ? '65%' : '33% + 1.5rem'
                  })))`
                : 'translateX(0px)',
            transition: this.animating ? `${this.animationDuration}ms` : 'none'
        }
    }

    nextSlide() {
        this.shiftSlide(-1)
    }

    prevSlide() {
        this.shiftSlide(1)
    }

    shiftOne(arr, direction) {
        direction > 0 ? arr.unshift(arr.pop()) : arr.push(arr.shift())
    }

    shiftSlide(direction) {
        if (this.animating) return
        this.animateDirection = direction
        this.animating = true
        setTimeout(() => {
            this.shiftOne(this.channels, direction)
            this.animating = false
            this.animateDirection = 0
        }, this.animationDuration)
    }
}
