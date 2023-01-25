import { Component, OnChanges } from '@angular/core';
//inject the service
import { ModalService } from '../services/modal.service';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  // create a property called modal
  constructor(public modal: ModalService, public auth: AuthService, private afAuth: AngularFireAuth) {

  }
  openModal($event: Event) {
    //to prevent the default behavior of the browser
    $event.preventDefault()
    this.modal.toggleModal('auth')
  }



}
