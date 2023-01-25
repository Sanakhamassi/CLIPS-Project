import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { delay, map, Observable, filter, switchMap, of } from 'rxjs';
import Iuser from '../models/model.user'
import { Router } from '@angular/router';
import { ActivatedRoute, NavigationEnd } from '@angular/router';
import * as e from 'express';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userCollection: AngularFirestoreCollection<Iuser>
  public isAuth$: Observable<boolean>
  public isAuthwithDelay$: Observable<boolean>
  private redirect = false
  constructor(private auth: AngularFireAuth, private db: AngularFirestore, private router: Router, private route: ActivatedRoute) {
    this.userCollection = db.collection('users')
    this.isAuth$ = auth.user.pipe(
      map(user => !!user),
    )
    this.isAuthwithDelay$ = this.isAuth$.pipe(
      delay(1000)
    )
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => this.route.firstChild),
      switchMap(route => route?.data ?? of({})),


    ).subscribe(data => this.redirect = data.authOnly ?? false)
  }
  public async logout($event?: Event) {
    if ($event) {
      $event.preventDefault()
    }
    await this.auth.signOut()
    //navigateByurl returns a promise that's why we mentionned it await
    //it's used to redirect a user after logging out 
    if (this.redirect) {

      await this.router.navigateByUrl('/')
    }
  }
  public async createUser(userData: Iuser) {
    const userCredentials = await this.auth.createUserWithEmailAndPassword(
      userData.email as string, userData.password as string
    )

    await this.userCollection.doc(userCredentials.user?.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber
    })
    console.log(userCredentials.user?.getIdToken());

    await userCredentials.user?.updateProfile({
      displayName: userData.name
    })
  }
}
