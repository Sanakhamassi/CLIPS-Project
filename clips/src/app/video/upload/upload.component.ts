import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validator, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid'
import { last, switchMap, combineLatest, forkJoin } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app'
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';

import { FfmpegService } from 'src/app/services/ffmpeg.service';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
  file: File | null = null
  isDragover = false
  nextStep = false
  inSubmition = false
  showAlert = false
  alertMsg = 'The video is on submition'
  alertColor = 'blue'
  precentage = 0
  showPercentage = false
  task?: AngularFireUploadTask
  user: firebase.User | null = null
  screenshots: string[] = []
  selectedScreenshot = ''
  screenshotTask?: AngularFireUploadTask
  uploadForm = new FormGroup({
    title: new FormControl('', { validators: [Validators.required, Validators.minLength(3)], nonNullable: true })
  })
  constructor(private storage: AngularFireStorage, private auth: AngularFireAuth, private clipService: ClipService, private router: Router, public ffmpegService: FfmpegService) {
    auth.user.subscribe(user => this.user = user)
    this.ffmpegService.initialise()
  }
  ngOnDestroy(): void {
    this.task?.cancel()
  }
  async storeFile($event: Event) {
    if (this.ffmpegService.isRunning) {
      return
    }
    this.isDragover = false
    this.file = ($event as DragEvent).dataTransfer?.files.item(0) ?? null
    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }
    this.screenshots = await this.ffmpegService.getScreenshots(this.file)
    this.selectedScreenshot = this.screenshots[0]
    this.uploadForm.controls.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''))
    this.nextStep = true

  }
  async uploadFile() {
    this.uploadForm.disable()
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Please Wait! Your clip is being uploaded'
    this.inSubmition = true
    this.showPercentage = true
    const clipFileName = uuid()
    const clipPath = `clips/${clipFileName}.mp4`
    const screnshotBlob = await this.ffmpegService.blobFromURL(this.selectedScreenshot)
    const screenshotPath = `screenshots/${clipFileName}.png`
    const clipRef = this.storage.ref(clipPath)
    const screenShotRef = this.storage.ref(screenshotPath)
    this.screenshotTask = this.storage.upload(screenshotPath, screnshotBlob)
    this.task = this.storage.upload(clipPath, this.file)
    combineLatest([this.task.percentageChanges(),
    this.screenshotTask.percentageChanges()
    ]).subscribe((progress) => {
      //distracture the progress var
      const [clipProgress, scrreShotProgress] = progress
      if (!clipProgress || !scrreShotProgress) { return }
      const total = clipProgress + scrreShotProgress
      this.precentage = total as number / 200
    })
    forkJoin([this.task.snapshotChanges(),
    this.screenshotTask.snapshotChanges()
    ]).pipe(
      switchMap(() => forkJoin([clipRef.getDownloadURL(),
      screenShotRef.getDownloadURL()]))
    ).subscribe({
      next: async (urls) => {
        const [clipUrl, scrrenShotUrl] = urls
        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.uploadForm.controls.title.value,
          fileName: `${clipFileName}.mp4`,
          url: clipUrl,
          scrrenShotUrl,
          screensotFileName: `${clipFileName}.png`,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
        const clipDoc = await this.clipService.createClip(clip)
        this.alertColor = 'green',
          this.alertMsg = 'Sucess! Your clip is now ready to share with the world'
        this.showPercentage = false
        setTimeout(() => {
          this.router.navigate([
            'clip', clipDoc.id
          ])
        }, 1000)
      },
      error: (error) => {
        this.uploadForm.enable()
        this.alertColor = 'red',
          this.alertMsg = 'Upload failed'
        this.inSubmition = true
        this.showPercentage = false
        console.log(error);
      }
    });



  }
}
