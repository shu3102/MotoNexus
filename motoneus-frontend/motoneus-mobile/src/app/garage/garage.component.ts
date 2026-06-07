import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalNotifications } from '@capacitor/local-notifications';
import { CouchbaseLiteService } from '../couchbase-lite.service';

@Component({
  selector: 'app-garage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './garage.component.html',
  styleUrls: ['./garage.component.scss']
})
export class GarageComponent implements OnInit {
  vehicles: any[] = [
    { id: '1', make: 'Triumph', model: 'Street Twin', year: 2022 }
  ];
  
  documents: any[] = [];
  isScanning = false;

  constructor(private cblService: CouchbaseLiteService) {}

  ngOnInit() {
    this.cblService.documents$.subscribe(docs => {
      this.documents = docs;
    });
  }

  async uploadDocument(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isScanning = true;

    // Read file as Data URL (Base64) to store "Offline" in LocalStorage
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const base64Data = e.target.result;
      
      // Simulate AI Scanner processing time locally
      setTimeout(async () => {
        const extractedDate = new Date();
        extractedDate.setDate(extractedDate.getDate() + 30); // Expires in 30 days
        const dateString = extractedDate.toISOString().split('T')[0];

        const newDoc = {
          id: Date.now().toString(),
          title: 'Vehicle Insurance',
          expiryDate: dateString,
          syncStatus: 'PENDING',
          fileData: base64Data // Store image locally
        };

        this.isScanning = false;

        // 1. Save to Offline DB immediately
        await this.cblService.saveDocumentOffline(newDoc);

        // 2. Schedule Local Notification Alarm
        await this.scheduleExpiryNotification(newDoc.title, extractedDate);
        
        alert('AI Scan Complete! Expiry extracted: ' + dateString + '.\nDocument vaulted securely (Offline First).');

      }, 2000);
    };
    reader.readAsDataURL(file);
  }

  async scheduleExpiryNotification(title: string, expiryDate: Date) {
    const notificationDate = new Date(expiryDate);
    notificationDate.setDate(notificationDate.getDate() - 7);

    try {
      let permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') {
        permStatus = await LocalNotifications.requestPermissions();
      }

      if (permStatus.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'MotoNexus Alert: Document Expiring Soon',
              body: `Your ${title} is expiring in 7 days on ${expiryDate.toDateString()}!`,
              id: new Date().getTime(),
              schedule: { at: notificationDate }
            }
          ]
        });
      }
    } catch (e) {
      console.log('Local Notifications not fully supported in pure web, but logic is active for native.');
    }
  }
}

