import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Routes, RouterModule} from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';

const routes:Routes=[
  {path: 'signup', component:SignupComponent},
  {path: 'login' ,component:LoginComponent}
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports:[RouterModule]
})
export class AppRoutingModule { }
