import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    reporter: [['json', { outputFile: 'e2eresults.json' }]],
    webServer: {
        command: 'npm run dev',
        port: 4200,
    },
    workers: process.env.CI ? 4 : undefined,
}

export default config
