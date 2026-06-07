import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CouchbaseLiteService {
  
  // In a real device environment, this interfaces with @capacitor-community/couchbase-lite
  // For web development and immediate testing, we simulate the CBL Database using IndexedDB/LocalStorage
  private LOCAL_DB_KEY = 'motonexus_cbl_offline_store';
  private BACKEND_URL = 'http://localhost:8082/api/garage';

  public documents$ = new BehaviorSubject<any[]>([]);
  public vehicles$ = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadLocalData();
    
    // Listen for network status to trigger background sync
    window.addEventListener('online', () => this.syncWithCloud());
  }

  private loadLocalData() {
    const raw = localStorage.getItem(this.LOCAL_DB_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      this.documents$.next(data.documents || []);
      this.vehicles$.next(data.vehicles || []);
    }
  }

  private saveLocalData(documents: any[], vehicles: any[]) {
    localStorage.setItem(this.LOCAL_DB_KEY, JSON.stringify({ documents, vehicles }));
    this.documents$.next(documents);
    this.vehicles$.next(vehicles);
  }

  public async saveDocumentOffline(doc: any) {
    // 1. Save to local Couchbase Lite instance (Offline First!)
    const currentDocs = this.documents$.value;
    doc.syncStatus = 'PENDING'; // Needs to be pushed to cloud
    currentDocs.push(doc);
    this.saveLocalData(currentDocs, this.vehicles$.value);

    // 2. Attempt to sync immediately if online
    if (navigator.onLine) {
      await this.syncWithCloud();
    }
  }

  public async syncWithCloud() {
    console.log("Couchbase Sync Gateway: Starting bidirectional sync...");
    
    const docs = this.documents$.value;
    const pendingDocs = docs.filter(d => d.syncStatus === 'PENDING');

    for (const doc of pendingDocs) {
      try {
        // Prepare multipart form data for the backend API
        const formData = new FormData();
        formData.append('title', doc.title);
        
        // Convert Base64 back to Blob
        if (doc.fileData) {
           const byteString = atob(doc.fileData.split(',')[1]);
           const mimeString = doc.fileData.split(',')[0].split(':')[1].split(';')[0];
           const ab = new ArrayBuffer(byteString.length);
           const ia = new Uint8Array(ab);
           for (let i = 0; i < byteString.length; i++) {
             ia[i] = byteString.charCodeAt(i);
           }
           const blob = new Blob([ab], { type: mimeString });
           formData.append('file', blob, 'scan.jpg');
        } else {
           const emptyBlob = new Blob(['dummy'], { type: 'image/jpeg' });
           formData.append('file', emptyBlob, 'scan.jpg');
        }

        const headers = {
          Authorization: `Bearer ${this.authService.accessToken}`
        };

        // Push to Spring Boot backend
        const response = await firstValueFrom(
          this.http.post(`${this.BACKEND_URL}/documents/upload`, formData, { headers })
        );

        // Mark as synced
        doc.syncStatus = 'SYNCED';
        doc.cloudId = (response as any).id;

      } catch (error) {
        console.error("Sync failed for document", doc.title, error);
        // If it failed due to Expiry Date validation (HTTP 400), we should probably delete it or alert the user
      }
    }

    this.saveLocalData(docs, this.vehicles$.value);
    console.log("Couchbase Sync Gateway: Sync complete.");
  }
}
