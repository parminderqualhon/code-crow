import { ChannelService } from '../../../../../services/channel.service'
import { UserService } from '../../../../../services/user.service'
import { Component } from '@angular/core'
import { environment } from '../../../../../../environments/environment'
import { MatDialogRef } from '@angular/material/dialog'
import { StreamingService } from '../../../../../services/streaming.service'
import * as spl_token from '@solana/spl-token'
import {
    Transaction,
    PublicKey,
    Connection,
    LAMPORTS_PER_SOL,
    TransactionInstruction
} from '@solana/web3.js'
import { DialogData } from '../../../../../shared/dialog-data'
import { DialogService } from '../../../../../services/dialog.service'

// const TOKEN_PROGRAM_ID = 'AvcjewwNBCZixHS8U222K5nt3pdpjKiichoy7j1sGxAM'
const TOKEN_PROGRAM_ID = 'GA4emuG1Ao2iJt2QbZiGL6B3pBPEU7XoVMrhfwYnKM4W'

@Component({
    selector: 'app-stream-controls',
    templateUrl: './stream-token-controls.component.html',
    styleUrls: ['./stream-token-controls.component.scss']
})
export class TokenControlsComponent {
    constructor(
        private dialogRef: MatDialogRef<TokenControlsComponent>,
        public channelService: ChannelService,
        public streamingService: StreamingService,
        public userService: UserService,
        public dialogService: DialogService
    ) {}

    async ngOnDestroy() {
        this.dialogRef.close()
    }

    incrementAmount(prop) {
        let component: any = document.getElementById('amount')
        component.value = parseInt(component.value) + parseInt(prop)
    }

    async transferTokens() {
        try {
            let amount: any = document.getElementById('amount')
            amount = parseInt(amount?.value)
            const wallet: any = window
            const provider: any = await wallet?.solana
            await provider.connect()
            const pubKey = provider.publicKey.toString()
            const network = 'https://api.devnet.solana.com'
            const connection = new Connection(network)
            console.log('p ', provider)
            const secondDestination = environment.serviceFeeWallet
            console.log('secondDestination ', secondDestination)
            var destination: any
            await this.userService
                .getUserById(this.channelService.currentChannel.user)
                .then((res) => {
                    destination = res?.walletAddress
                    console.log('destination', destination)
                })
            const mintPublicKey = new PublicKey(TOKEN_PROGRAM_ID)
            const mintToken = new spl_token.Token(
                connection,
                mintPublicKey,
                spl_token.TOKEN_PROGRAM_ID,
                provider.publicKey // the wallet owner will pay to transfer and to create recipients associated token account if it does not yet exist.
            )
            const fromTokenAccount = await mintToken.getOrCreateAssociatedAccountInfo(
                provider.publicKey
            )

            const destPublicKey = new PublicKey(destination)
            const secondDestPublicKey = new PublicKey(secondDestination) //  Destination wallet address

            const associatedDestinationTokenAddr = await spl_token.Token.getAssociatedTokenAddress(
                mintToken.associatedProgramId,
                mintToken.programId,
                mintPublicKey,
                destPublicKey
            )

            const secondAssociatedDestinationTokenAddr =
                await spl_token.Token.getAssociatedTokenAddress(
                    mintToken.associatedProgramId,
                    mintToken.programId,
                    mintPublicKey,
                    secondDestPublicKey
                )

            const receiverAccount = await connection.getAccountInfo(associatedDestinationTokenAddr)
            const secondReceiverAccount = await connection.getAccountInfo(
                secondAssociatedDestinationTokenAddr
            )

            const instructions: TransactionInstruction[] = []

            if (receiverAccount === null) {
                instructions.push(
                    spl_token.Token.createAssociatedTokenAccountInstruction(
                        mintToken.associatedProgramId,
                        mintToken.programId,
                        mintPublicKey,
                        associatedDestinationTokenAddr,
                        destPublicKey,
                        provider.publicKey
                    )
                )
            }

            if (secondReceiverAccount === null) {
                instructions.push(
                    spl_token.Token.createAssociatedTokenAccountInstruction(
                        mintToken.associatedProgramId,
                        mintToken.programId,
                        mintPublicKey,
                        secondAssociatedDestinationTokenAddr,
                        secondDestPublicKey,
                        provider.publicKey
                    )
                )
            }

            instructions.push(
                spl_token.Token.createTransferInstruction(
                    spl_token.TOKEN_PROGRAM_ID,
                    fromTokenAccount.address,
                    secondAssociatedDestinationTokenAddr,
                    provider.publicKey,
                    [],
                    amount * 0.05 * LAMPORTS_PER_SOL
                )
            )
            instructions.push(
                spl_token.Token.createTransferInstruction(
                    spl_token.TOKEN_PROGRAM_ID,
                    fromTokenAccount.address,
                    associatedDestinationTokenAddr,
                    provider.publicKey,
                    [],
                    amount * 0.95 * LAMPORTS_PER_SOL
                )
            )

            const transaction = new Transaction().add(...instructions)

            transaction.feePayer = await provider.publicKey

            let blockhashObj = await connection.getLatestBlockhash()

            transaction.recentBlockhash = await blockhashObj.blockhash

            let signature = await provider.signAndSendTransaction(transaction)

            console.log('signed ', signature)
            // await connection.confirmTransaction(signature)
            // alert('Transaction Signature : ' + signature?.signature)

            const dialogData: DialogData = {
                title: 'Notice',
                message: 'Transaction Signature : ' + signature?.signature,
                okText: 'OK'
            }
            this.dialogService.openDialog(dialogData)
        } catch (err) {
            // alert(err?.message)
            const dialogData: DialogData = {
                title: 'Notice',
                message: err?.message,
                okText: 'OK'
            }
            this.dialogService.openDialog(dialogData)
        }
    }
}
