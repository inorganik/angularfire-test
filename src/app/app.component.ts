import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="afAuth.user | async as user; else showLogin">
      <h1>Hello {{ user.displayName }}!</h1>
      <button (click)="logout()">Logout</button>
    </div>
    <ng-template #showLogin>
      <p>Please login.</p>
      <button (click)="login()">Login with Google</button>
    </ng-template>
    <p>Here is some test text that doesn't rely on any external code.</p>
  `,
})
export class AppComponent {
  constructor(public afAuth: AngularFireAuth, private title: Title) {
    this.title.setTitle('prerendered ✅ if you see this title in source');
  }
  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }
  logout() {
    this.afAuth.auth.signOut();
  }
}
