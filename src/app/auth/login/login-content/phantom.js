export default async function Wallet() {
    async function getProvider() {
        const provider = window.solana
        if (provider.isPhantom) {
            try {
                const resp = await window.solana.connect()
                await window.solana.disconnect()
                // const resp = await window.solana.request({ method: "connect"});
                // return await resp.publicKey.toString()
                return await resp
            } catch (err) {
                // { code: 4001, message: 'User rejected the request.' }
                console.log('err ', err)
            }
        }
    }
    const isPhantomInstalled = window?.solana && window?.solana?.isPhantom
    return isPhantomInstalled
        ? getProvider()
        : (window.alert('Please install Phantom Wallet'),
          window.open('https://phantom.app/', '_blank'),
          false)
}
