import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PushNotificationService } from './push-notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class AppComponent {
  constructor(private pushService: PushNotificationService) {
    this.pushService.init().catch(err => console.log('Push init failed (expected in browser)', err));
  }
}
