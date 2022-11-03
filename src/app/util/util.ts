import { environment } from '../../environments/environment'
import { trigger, transition, style, animate, stagger, keyframes, query } from '@angular/animations'

export class Util {
    static inOutAnimation: [any] = [
        trigger('inOutAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(100%)' }),
                animate('300ms ease-in', style({ transform: 'translateX(0%)' }))
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('300ms ease-out', style({ transform: 'translateX(100%)' }))
            ])
        ])
    ]

    static reverseInOutAnimation: [any] = [
        trigger('reverseInOutAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(-100%)' }),
                animate('100ms ease-in', style({ transform: 'translateX(0%)' }))
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0%)' }),
                animate('100ms ease-out', style({ transform: 'translateX(-100%)' }))
            ])
        ])
    ]

    static cardAnimation: [any] = [
        trigger('cardAnimation', [
            // Transition from any state to any state
            transition('* => *', [
                // Initially the all cards are not visible
                query(':enter', style({ opacity: 0 }), { optional: true }),

                // Each card will appear sequentially with the delay of 3ms
                query(
                    ':enter',
                    stagger('3ms', [
                        animate(
                            '.2s ease-in',
                            keyframes([
                                style({ opacity: 0, transform: 'translateY(-50%)', offset: 0 }),
                                style({
                                    opacity: 0.5,
                                    transform: 'translateY(-10px)',
                                    offset: 0.3
                                }),
                                style({ opacity: 1, transform: 'translateY(0)', offset: 1 })
                            ])
                        )
                    ]),
                    { optional: true }
                )
            ])
        ])
    ]

    static restrictedMimeTypes = [
        'application/x-msdownload',
        'application/x-ms-installer',
        'application/x-elf',
        'application/x-sh',
        'text/x-perl',
        'text/x-python'
    ]

    static guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1)
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
    }

    static convertObjToArray(unmappedMeta) {
        if (Object.keys(unmappedMeta).length > 0) {
            return Object.keys(unmappedMeta).map((key) => unmappedMeta[key])
        }
    }

    static arrayBufferToBase64(buffer: ArrayBuffer) {
        let binary = ''
        const bytes = new Uint8Array(buffer)
        const len = bytes.byteLength
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i])
        }
        return window.btoa(binary)
    }

    static convertMinsToHrsMins(mins) {
        let h: any = Math.floor(mins / 60)
        let m: any = mins % 60
        h = h < 10 ? '0' + h : h
        m = m < 10 ? '0' + m : m
        return `${h}:${m}`
    }

    static getMetaTagData() {
        return {
            twitterHandle: '@CodeCrowCorp',
            author: 'Code Crow Corp',
            title: 'Code Crow',
            description:
                'A Web3 Network - Code Crow is a Stream-and-Earn platform for web3 gamers and developers',
            imageSrc: `${environment.hostUrl}/assets/images/logo_2.png`,
            imageWidth: '664',
            imageHeight: '358',
            url: environment.hostUrl
        }
    }

    static compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1)
    }

    static tweet({ url, text }) {
        const encodedUrl = encodeURIComponent(url)
        const encodedText = encodeURIComponent(text)
        window.open(
            `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
            '_blank'
        )
    }
}
