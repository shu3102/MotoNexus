import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { Client } from '@stomp/stompjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-ride',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ride.component.html',
  styleUrls: ['./ride.component.scss']
})
export class RideComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  private marker!: L.Marker;
  private watchId: string | null = null;
  private stompClient: Client;
  
  isRiding = false;
  sosActive = false;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8083/ws/fleet',
      debug: (str) => { console.log(str); },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  }

  async ngOnInit() {
    this.initMap();
    this.stompClient.onConnect = (frame) => {
      console.log('Connected to Fleet WebSocket: ' + frame);
      this.stompClient.subscribe('/topic/locations', (message) => {
        // Here we could update other riders on the map!
        console.log("Fleet Update:", JSON.parse(message.body));
      });
      this.stompClient.subscribe('/topic/sos', (message) => {
        const sosData = JSON.parse(message.body);
        alert(`🚨 EMERGENCY SOS from Rider ${sosData.riderId}! Location: ${sosData.lat}, ${sosData.lng}`);
      });
    };
    this.stompClient.activate();
  }

  ngOnDestroy() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
    }
    this.stompClient.deactivate();
  }

  private async initMap() {
    let initialLat = 51.505;
    let initialLng = -0.09;

    const storedLoc = localStorage.getItem('last_known_location');
    if (storedLoc) {
      const loc = JSON.parse(storedLoc);
      initialLat = loc.lat;
      initialLng = loc.lng;
    }

    this.map = L.map('map').setView([initialLat, initialLng], 16);
    
    // Google Maps standard tiles
    L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '© Google Maps'
    }).addTo(this.map);

    // Fix for Leaflet not rendering tiles in dynamic Angular containers
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);

    // Get current location immediately upon opening map
    try {
      const position = await Geolocation.getCurrentPosition();
      this.updateLocation(position.coords.latitude, position.coords.longitude);
    } catch (e) {
      console.log("Could not fetch initial location", e);
    }
  }

  private currentTripId: string | null = null;

  async toggleRide() {
    this.isRiding = !this.isRiding;
    const headers = { Authorization: `Bearer ${this.authService.accessToken}` };

    if (this.isRiding) {
      // Start trip on backend for RideLog tracking
      this.http.post<any>('http://localhost:8084/api/ridelog/start', {}, { headers }).subscribe(trip => {
        this.currentTripId = trip.id;
        console.log('RideLog: Trip started', this.currentTripId);
      });

      const position = await Geolocation.getCurrentPosition();
      this.updateLocation(position.coords.latitude, position.coords.longitude);
      
      this.watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos) => {
        if (pos) {
          this.updateLocation(pos.coords.latitude, pos.coords.longitude);
          this.broadcastLocation(pos.coords.latitude, pos.coords.longitude);
        }
      });
    } else {
      // Stop trip and trigger AI analysis
      if (this.currentTripId) {
        this.http.post(`http://localhost:8084/api/ridelog/${this.currentTripId}/stop`, {}, { headers }).subscribe(() => {
          console.log('RideLog: Trip stopped', this.currentTripId);
          this.currentTripId = null;
        });
      }

      if (this.watchId) {
        Geolocation.clearWatch({ id: this.watchId });
        this.watchId = null;
      }
    }
  }

  private updateLocation(lat: number, lng: number) {
    localStorage.setItem('last_known_location', JSON.stringify({ lat, lng }));
    if (!this.marker) {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    } else {
      this.marker.setLatLng([lat, lng]);
    }
    this.map.setView([lat, lng], 16);
  }

  private broadcastLocation(lat: number, lng: number) {
    const headers = { Authorization: `Bearer ${this.authService.accessToken}` };
    this.http.post('http://localhost:8083/api/fleet/location', { lat, lng }, { headers }).subscribe();
  }

  async triggerSOS() {
    this.sosActive = true;
    const position = await Geolocation.getCurrentPosition();
    const headers = { Authorization: `Bearer ${this.authService.accessToken}` };
    
    this.http.post('http://localhost:8083/api/fleet/sos', { 
      lat: position.coords.latitude, 
      lng: position.coords.longitude,
      message: 'Rider down! Immediate assistance required.'
    }, { headers }).subscribe(() => {
      setTimeout(() => this.sosActive = false, 3000);
    });
  }
}
