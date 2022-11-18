// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  firebase: {
    projectId: 'code-crow',
    appId: '1:144486335907:web:e823a81d256c125becc616',
    storageBucket: 'code-crow.appspot.com',
    apiKey: 'AIzaSyDo5BGEHjySPUxV93ldcn9RTH1Wp90bWSA',
    authDomain: 'code-crow.firebaseapp.com',
    messagingSenderId: '144486335907',
    measurementId: 'G-WYYTJK5T8R',
  },
    production: false,
    name: 'local',
    hostUrl: 'http://localhost:4200',
    apiUrl: 'http://localhost:8787',
    webSocketUrl: 'ws://localhost:8787',
    serviceFeeWallet: 'EoQb4mKYmxEPRi4i8kXyWuSXQXgevkuPUKE4FRdqdRAF'
}
