import { Component, OnInit, Output, EventEmitter, Injector } from '@angular/core';
import { User } from '../_models/user';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker/ngx-bootstrap-datepicker';
import { BaseComponent } from '../base-component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent extends BaseComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();

  user: User;
  registerForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>; // Add the 'Partial' key so we can avoid implementing all methods

  constructor(injector: Injector,
    private formBuilder: FormBuilder) {
    super(injector);
  }

  ngOnInit() {
    // this.initRegisterForm();
    this.initRegisterFormViaFormBuilder();
    this.bsConfig = {
      containerClass: 'theme-red',
      maxDate: new Date()
    };
  }

  initRegisterForm() {
    this.registerForm = new FormGroup({ //First Manner
      username: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]),
      confirmPassword: new FormControl('', Validators.required)
    }, this.passwordMatchValidator);
  }

  initRegisterFormViaFormBuilder(): void { // Second Manner
    this.registerForm = this.formBuilder.group(
      {
        gender: ['male'],
        username: ['', Validators.required],
        knownAs: ['', Validators.required],
        dateOfBirth: [null, Validators.required],
        city: [null, Validators.required],
        country: [null, Validators.required],
        password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      {
        validator: this.passwordMatchValidator
      }
    );
  }
  passwordMatchValidator(g: FormGroup): object {
    return g.get('password').value === g.get('confirmPassword').value ? null : { mismatch: true };
  }


  register(): void {
    if (this.registerForm.valid === false) {
      return;
    }

    this.user = Object.assign({}, this.registerForm.value);

    this.authService.register(this.user).subscribe(
      () => {
        this.alertify.success('Registration successful');
      },
      error => {
        this.alertify.error(error);
      }, () => {

        this.authService.login(this.user).subscribe(() => {
          this.router.navigate(['/members']);
        });
      }
    );
  }

  cancel(): void {
    this.cancelRegister.emit(false);
  }

}
