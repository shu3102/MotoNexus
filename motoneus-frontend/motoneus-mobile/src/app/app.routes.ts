import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GarageComponent } from './garage/garage.component';
import { RideComponent } from './ride/ride.component';
import { RidelogComponent } from './ridelog/ridelog.component';
import { CommunityComponent } from './community/community.component';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [async () => {
      const authService = inject(AuthService);
      const router = inject(Router);
      
      await authService.initialAuthFinished;
      
      if (authService.isLoggedIn) {
        return true;
      }
      return router.createUrlTree(['/login']);
    }]
  },
  { 
    path: 'garage', 
    component: GarageComponent,
    canActivate: [async () => {
      const authService = inject(AuthService);
      const router = inject(Router);
      await authService.initialAuthFinished;
      if (authService.isLoggedIn) return true;
      return router.createUrlTree(['/login']);
    }]
  },
  { 
    path: 'ride', 
    component: RideComponent,
    canActivate: [async () => {
      const authService = inject(AuthService);
      const router = inject(Router);
      await authService.initialAuthFinished;
      if (authService.isLoggedIn) return true;
      return router.createUrlTree(['/login']);
    }]
  },
  { 
    path: 'ridelog', 
    component: RidelogComponent,
    canActivate: [async () => {
      const authService = inject(AuthService);
      const router = inject(Router);
      await authService.initialAuthFinished;
      if (authService.isLoggedIn) return true;
      return router.createUrlTree(['/login']);
    }]
  },
  { 
    path: 'community', 
    component: CommunityComponent,
    canActivate: [async () => {
      const authService = inject(AuthService);
      const router = inject(Router);
      await authService.initialAuthFinished;
      if (authService.isLoggedIn) return true;
      return router.createUrlTree(['/login']);
    }]
  }
];
