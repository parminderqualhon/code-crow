import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testDir: './tests',
    timeout: 30 * 1000,
    expect: {
        timeout: 5000
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 4 : undefined,
    reporter: [['json', { outputFile: 'e2eresults.json' }]],
    use: {
        actionTimeout: 0,
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },

        {
            name: 'firefox',
            use: {
                ...devices['Desktop Firefox'],
            },
        },

        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
            },
        }
    ],
    webServer: {
        command: 'npm run dev',
        port: 4200,
    }
}

export default config
