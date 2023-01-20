import { Component } from '@angular/core';
//allows us to register a nw form
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import Iuser from 'src/app/models/model.user';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  constructor(private auth: AuthService) {
  }
  inSubmition = false
  showAlert = false
  alertMsg = 'Please wait your account is being created'
  alertColor = 'blue'
  registerForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    age: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(18),
      Validators.max(120)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
    ]),
    confirm_password: new FormControl('', [
      Validators.required
    ]),
    phoneNumber: new FormControl('', [
      Validators.required,
      Validators.minLength(15),
      Validators.maxLength(15)
    ])
  })
  async register() {
    this.showAlert = true
    this.alertMsg = 'Please wait your account is being created'
    this.alertColor = 'blue'
    this.inSubmition = true

    try {
      await this.auth.createUser(this.registerForm.value as Iuser)
    }
    catch (e) {
      console.log(e);
      this.alertMsg = 'An unexpected error occured please try again later'
      this.alertColor = 'red'
      this.inSubmition = false

      return
    }
    this.alertMsg = 'Success ! account has been created'
    this.alertColor = 'green'
  }
}
