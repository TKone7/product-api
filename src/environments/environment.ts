// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase:{
    apiKey: "AIzaSyCb_id0EcyPNvYwDW40naE6T2Eaq4HzXxo",
    authDomain: "oshop-74b6f.firebaseapp.com",
    databaseURL: "https://oshop-74b6f.firebaseio.com",
    projectId: "oshop-74b6f",
    storageBucket: "oshop-74b6f.appspot.com",
    messagingSenderId: "129371604820",
    appId: "1:129371604820:web:abf9130075002f9c9deac1"
  },
  baseUrl: '/api',
  baseDomain: 'localhost:5000'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.
