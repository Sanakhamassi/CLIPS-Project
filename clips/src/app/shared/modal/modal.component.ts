import { Component, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  //providers: [ModalService]
})
export class ModalComponent implements OnInit, OnDestroy {
  //input commes frm the parent component
  @Input() modalId = ''

  constructor(public modal: ModalService, public el: ElementRef) {


  }
  closeModal() {
    this.modal.toggleModal(this.modalId)
  }
  ngOnInit(): void {
    document.body.appendChild(this.el.nativeElement)
  }
  ngOnDestroy(): void {
    document.body.removeChild(this.el.nativeElement)
  }
}
