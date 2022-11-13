import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core'
import { UserService } from '../../services/user.service'
import { AuthService } from '../../auth/auth.service'
import Wallet from '../../auth/login/login-content/phantom.js'
import { ThemeService } from '../../services/theme.service'

const test_data: any[] = [
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        channelId: '1234-5678-9012-3456',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        channelId: '1234-5678-9012-3456',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        channelId: '1234-5678-9012-3456',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        channelId: '1234-5678-9012-3456',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        channelId: '1234-5678-9012-3456',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        channelId: '1234-5678-9012-3456',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        channelId: '1234-5678-9012-3456',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        channelId: '1234-5678-9012-3456',
        amount: 10
    }
]
const test_data_tip: any[] = [
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        sName: 'temp temp',
        rName: 'temp temp',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        sName: 'temp temp temp temp temp temp',
        rName: 'temp',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        sName: 'temp',
        rName: 'temp',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        sName: 'temp',
        rName: 'temp',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        sName: 'temp',
        rName: 'temp',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        sName: 'temp',
        rName: 'temp',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        sName: 'temp',
        rName: 'temp',
        amount: 10
    },
    {
        date: '8/1/2022',
        transactionId: '1234-5678-9012-3456',
        solscanUrl: 'https://www.temporary-url.com/064C41',
        sName: 'temp',
        rName: 'temp',
        amount: 10
    }
]

@Component({
    selector: 'app-premium',
    templateUrl: './premium.component.html',
    styleUrls: ['./premium.component.scss']
})
export class PremiumComponent implements OnInit {
    @Output() clear = new EventEmitter()
    public isDarkTheme: boolean
    public currentButton: string
    public walletAddress: string
    public earnedTokens: any[]
    public bntStyle: string
    public earnedTips: any[]
    public earnedNFT: any[]
    public test: any[]
    isConnected: boolean = false
    constructor(
        private userService: UserService,
        private themeService: ThemeService,
        private authService: AuthService
    ) {}

    async ngOnInit() {
        this.currentButton = 'earned'
        this.bntStyle = 'earned'
        this.isDarkTheme = await this.themeService.isDarkTheme()
        this.earnedNFT = []
        this.earnedTips = test_data_tip
        const { walletAddress } = await this.authService.me()
        if (walletAddress?.length > 10) {
            this.walletAddress = walletAddress
            this.isConnected = true
        } else {
            this.walletAddress = 'Connect Wallet'
            this.isConnected = false
        }
        this.earnedTokens = test_data
        // this.test = new Array(10).fill(10)
    }

    async handleClick(value: string) {
        this.currentButton = value
        this.bntStyle = value
    }

    async saveWalletAddress() {
        const status = this.walletAddress
        if (status == 'Connect Wallet') {
            var address = await Wallet()
            address = address.publicKey.toString()
            await this.userService.updateUser({ wallet: address })
            this.walletAddress = address
            this.userService.showSnackBar(`Wallet Linked`, 3000)
            this.isConnected = true
        } else {
            await this.userService.updateUser({ wallet: '' })
            this.walletAddress = 'Connect Wallet'
            this.userService.showSnackBar(`Wallet Unlinked`, 3000)
            this.isConnected = false
        }
    }
}
