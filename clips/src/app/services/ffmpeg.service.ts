import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {
  isRunning = false
  isReady = false
  private ffmpeg
  constructor() {
    this.ffmpeg = createFFmpeg({
      log: true
    })
  }
  //to load the webass file
  async initialise() {
    if (this.isReady) {
      return;
    }
    await this.ffmpeg.load()
    this.isReady = true
  }
  async getScreenshots(file: File) {
    this.isRunning = true
    //the fetchFile will convert the file into binary data
    const data = await fetchFile(file)
    //FS let us read write files in the system
    this.ffmpeg.FS('writeFile', file.name, data)
    const seconds = [1, 5, 9]
    const commands: string[] = []
    seconds.forEach(
      second => {
        commands.push(
          //input 
          '-i', file.name,
          //output options 
          '-ss', `00:00:0${second}`,
          '-frames:v', '1',
          '-filter:v', 'scale=-1:-1',
          //output 
          `output_0${second}.png`
        )
      }
    )
    await this.ffmpeg.run(
      ...commands
    )
    const screenshots: string[] = []
    seconds.forEach(second => {
      //convert the binary data into urls 
      const screenshotFile = this.ffmpeg.FS('readFile', `output_0${second}.png`)
      //blob will alows us to convert into url , is an obketc
      const screenshotBlob = new Blob(
        [screenshotFile.buffer], {
        type: 'image/png'
      }
      )
      const screenshotURL = URL.createObjectURL(screenshotBlob)
      screenshots.push(screenshotURL)
    })
    this.isRunning = false
    return screenshots
  }
  //create a blob from an url
  async blobFromURL(url: string) {
    //fetch a file from the url
    const res = await fetch(url)
    const blob = await res.blob()
    return blob
  }
}
