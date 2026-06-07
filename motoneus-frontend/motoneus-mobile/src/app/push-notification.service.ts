import { Injectable } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor() { }

  async init() {
    // Request permission to use push notifications
    // iOS will prompt a user of an app to allow notifications
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }

    // On success, we should be able to receive notifications
    await PushNotifications.register();

    // Show us the notification payload if the app is open on our device
    await PushNotifications.addListener('pushNotificationReceived',
      (notification: any) => {
        alert('Push received: ' + notification.title);
      }
    );

    // Method called when tapping on a notification
    await PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: any) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }
}
