import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container animate-fade-up">
      <nav class="glass-panel navbar">
        <h2 class="text-gradient-primary">MotoNexus</h2>
        <div class="user-info" *ngIf="authService.identityClaims as user">
          <span>Welcome, {{ user['preferred_username'] || user['name'] }}</span>
          <button class="btn-primary" (click)="authService.logout()">Logout</button>
        </div>
      </nav>
      
      <main class="content">
        <div class="glass-panel card" (click)="router.navigate(['/garage'])">
          <h3>Your Digital Garage</h3>
          <p class="text-gradient">Manage your vehicles and documents securely.</p>
        </div>
        <div class="glass-panel card" (click)="router.navigate(['/ride'])">
          <h3>Ride & Fleet</h3>
          <p class="text-gradient">Real-time GPS tracking and emergency SOS.</p>
        </div>
        <div class="glass-panel card" (click)="router.navigate(['/ridelog'])">
          <h3>RideLog</h3>
          <p class="text-gradient">Track your expenses and trips automatically.</p>
        </div>
        <div class="glass-panel card" (click)="router.navigate(['/community'])">
          <h3>MotoFeed</h3>
          <p class="text-gradient">Connect with other riders and share your rides.</p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      margin-bottom: 3rem;
      border-radius: 100px;
    }
    .navbar h2 {
      font-weight: 700;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    .card {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      cursor: pointer;
      transition: var(--transition-fast);
    }
    .card:hover {
      transform: translateY(-5px);
      border-color: var(--color-primary);
    }
  `]
})
export class DashboardComponent {
  constructor(public authService: AuthService, public router: Router) {}
}
