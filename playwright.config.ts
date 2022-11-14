import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    reporter: [['json', { outputFile: 'e2eresults.json' }]],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:4200/',
        timeout: 240000,
        reuseExistingServer: !process.env.CI,
    },
    use: {
        baseURL: 'http://localhost:4200/',
    },
    workers: process.env.CI ? 4 : undefined,
}

export default config
