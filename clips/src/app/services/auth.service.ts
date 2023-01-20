import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { delay, map, Observable } from 'rxjs';
import Iuser from '../models/model.user'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userCollection: AngularFirestoreCollection<Iuser>
  public isAuth$: Observable<boolean>
  public isAuthwithDelay$: Observable<boolean>
  constructor(private auth: AngularFireAuth, private db: AngularFirestore) {
    this.userCollection = db.collection('users')
    this.isAuth$ = auth.user.pipe(
      map(user => !!user),
    )
    this.isAuthwithDelay$ = this.isAuth$.pipe(
      delay(1000)
    )
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
