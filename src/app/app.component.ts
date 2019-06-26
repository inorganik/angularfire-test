import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(private title: Title) {
    this.title.setTitle('server-side rendered ✅ if you see this title in source');
  }
}
