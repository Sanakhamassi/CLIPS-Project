import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import Iclip from '../models/clip.model';
import { of, switchMap, map, Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ClipService implements Resolve<Iclip | null>{
  public clipsCollection: AngularFirestoreCollection<Iclip>
  pageClips: Iclip[] = []
  pendingReq = false
  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = db.collection('clips')
  }
  async createClip(data: Iclip): Promise<DocumentReference<Iclip>> {
    return this.clipsCollection.add(data)
  }
  //quering the database
  getUserClips(sort$: BehaviorSubject<string>) {
    //user is an observable
    return combineLatest([this.auth.user, sort$]).pipe(
      switchMap(values => {
        //destruct an array
        const [user, sort] = values
        if (!user) {
          return of([])
        }
        const query = this.clipsCollection.ref.where(
          'uid', '==', user.uid
        ).orderBy(
          'timestamp',
          sort === '1' ? 'desc' : 'asc')
        //the value resolved by our promise will be a snapshot object
        return query.get()
      }),
      map(snapshot => (snapshot as QuerySnapshot<Iclip>).docs)
    )
  }
  updateClip(id: string, title: string) {
    //the doc functio return a ref to theclip based n it id
    return this.clipsCollection.doc(id).update({
      title
    })
  }
  async deleteClip(clip: Iclip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`)
    const scrrenshotRef = this.storage.ref(`screenshots/${clip.screensotFileName}`)
    await clipRef.delete()
    await scrrenshotRef.delete()
    await this.clipsCollection.doc(clip.docID).delete()
  }
  async getClips() {
    if (this.pendingReq) {
      return
    }
    this.pendingReq = true
    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6)
    const { length } = this.pageClips
    if (length) {
      const lastDocID = this.pageClips[length - 1].docID
      //get will return a snapshot
      const lastDoc = await this.clipsCollection.doc(lastDocID).get().toPromise()

      query = query.startAfter(lastDoc)
    }
    const snapshot = await query.get()
    snapshot.forEach(doc => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data()
      })
    })
    this.pendingReq = false
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollection.doc(route.params.id).get().pipe(
      map(snapshot => {
        const data = snapshot.data()
        if (!data) {
          this.router.navigate(['/'])
          return null
        }
        return data
      })
    )
  }
}
