import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import { Input } from '@angular/core';
import Iclip from 'src/app/models/clip.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: Iclip | null = null
  inSubmition = false
  showAlert = false
  alertMsg = 'Please wait Updating clip.'
  alertColor = 'blue'
  @Output() update = new EventEmitter()
  constructor(private modal: ModalService, private clipService: ClipService) {
  }
  editForm = new FormGroup({
    clipID: new FormControl('', { nonNullable: true }),
    title: new FormControl('', { validators: [Validators.required, Validators.minLength(3)], nonNullable: true })
  })
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeClip || !this.activeClip.docID) { return }
    this.inSubmition = false
    this.showAlert = false
    this.editForm.controls.clipID.setValue(this.activeClip.docID);
    this.editForm.controls.title.setValue(this.activeClip.title)


  }
  ngOnInit(): void {
    this.modal.register('editClip')
  }
  ngOnDestroy(): void {
    this.modal.unregister('editClip')
  }
  async submit() {
    if (!this.activeClip || !this.activeClip.title) { return }
    this.showAlert = true
    this.alertColor = 'blue'
    this.inSubmition = true
    this.alertMsg = 'Please wait! Updating clip'

    try {

      await this.clipService.updateClip(this.editForm.controls.clipID.value, this.editForm.controls.title.value)

    }
    catch (e) {
      console.log(e);

      this.alertColor = 'red'
      this.inSubmition = false
      this.alertMsg = 'An error occured'
      return
    }
    this.activeClip.title = this.editForm.controls.title.value
    this.update.emit(this.activeClip)
    this.inSubmition = false
    this.alertColor = 'green'
    this.alertMsg = 'Success'


  }
}
