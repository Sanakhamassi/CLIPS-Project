//to communicate with auth service we need to import it 
import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth"
//we will be able to inject services inside the class 
import { AsyncValidator, AbstractControl, ValidationErrors } from "@angular/forms";
@Injectable({
    providedIn: 'root'
})

export class EmailTaken implements AsyncValidator {
    constructor(private auth: AngularFireAuth) {

    }
    //returns a promise
    validate = (control: AbstractControl): Promise<ValidationErrors | null> => {
        console.log(control.value);

        return this.auth.fetchSignInMethodsForEmail(control.value).then(
            res => res.length ? { emailTaken: true } : null
        )
    }
}
