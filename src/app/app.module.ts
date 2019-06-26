import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { HomeComponent } from './home/home.component';
import { PlayerComponent } from './player/player.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: ':id',
    component: PlayerComponent,
  },
];

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AngularFireModule.initializeApp(environment.firebase, 'angularfire-test'),
    AngularFireAuthModule,
    RouterModule.forRoot(routes),
    BrowserTransferStateModule,
  ],
  declarations: [ AppComponent, HomeComponent, PlayerComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule {}
