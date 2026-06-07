import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-ridelog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ridelog.component.html',
  styleUrls: ['./ridelog.component.scss']
})
export class RidelogComponent implements OnInit {
  trips: any[] = [];
  isLoading = false;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.fetchTrips();
  }

  fetchTrips() {
    this.isLoading = true;
    const headers = { Authorization: `Bearer ${this.authService.accessToken}` };
    this.http.get<any[]>('http://localhost:8084/api/ridelog', { headers }).subscribe({
      next: (data) => {
        this.trips = data;
        this.isLoading = false;
        
        // If no real trips yet, show mocks for visual demo
        if (this.trips.length === 0) {
          this.showMockTrips();
        }
      },
      error: (err) => {
        console.error('Failed to fetch trips', err);
        this.showMockTrips();
        this.isLoading = false;
      }
    });
  }

  showMockTrips() {
    this.trips = [
      {
        id: 'trip_demo_1',
        startTime: new Date(Date.now() - 86400000).toISOString(),
        totalDistanceKm: 142.5,
        status: 'COMPLETED',
        analytics: {
          maxLeanAngle: 42.1,
          avgSpeed: 76.5,
          estimatedFuelCost: 10.25
        }
      }
    ];
  }
}
