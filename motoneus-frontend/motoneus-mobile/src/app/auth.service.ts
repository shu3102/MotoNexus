import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth.config';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public errorMsg = '';
  private authFinishedResolver!: (value: boolean) => void;
  public initialAuthFinished = new Promise<boolean>((resolve) => {
    this.authFinishedResolver = resolve;
  });

  constructor(private oauthService: OAuthService, private router: Router) {
    this.configure();
  }

  private configure() {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(res => {
      if (this.oauthService.hasValidIdToken() && this.oauthService.hasValidAccessToken()) {
        this.errorMsg = 'Login Success!';
        if (this.router.url.startsWith('/login')) {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.errorMsg = 'No valid tokens found. Are we missing a step?';
      }
      this.authFinishedResolver(true);
    }).catch(err => {
      this.errorMsg = 'Login Error: ' + JSON.stringify(err);
      this.authFinishedResolver(false);
    });
  }

  public login() {
    this.oauthService.initCodeFlow();
  }

  public logout() {
    this.oauthService.logOut();
  }

  public get identityClaims() {
    return this.oauthService.getIdentityClaims();
  }

  public get accessToken() {
    return this.oauthService.getAccessToken();
  }

  public get isLoggedIn() {
    return this.oauthService.hasValidAccessToken();
  }
}
