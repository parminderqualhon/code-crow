// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,
    name: 'development',
    // hostUrl: 'http://dev.codecrow.io',
    // apiUrl: 'https://dev.api.codecrow.io',
    hostUrl: 'http://localhost:4200',
    apiUrl: 'http://localhost:8787',
    webSocketUrl: 'ws://localhost:8787',
    serviceFeeWallet: 'EoQb4mKYmxEPRi4i8kXyWuSXQXgevkuPUKE4FRdqdRAF'
}