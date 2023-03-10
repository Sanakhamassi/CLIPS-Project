import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import {
  environment
} from './environments/environment';

if (environment.production) {
  enableProdMode()
}
//connect our app to firebase
firebase.initializeApp(environment.firebase)
let appInit = false
firebase.auth().onAuthStateChanged(() => {
  if (!appInit) {
    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch(err => console.error(err));
  }
  appInit = true
})

