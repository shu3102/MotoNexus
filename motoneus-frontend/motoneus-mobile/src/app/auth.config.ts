import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  // Url of the Identity Provider
  issuer: 'http://localhost:8080/realms/MotoNexus',

  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + '/dashboard',

  // The SPA's id. The SPA is registered with this id at the auth-server
  clientId: 'motoneus-mobile',

  // Just needed if your auth server demands a secret. In general, this
  // is a sign that the auth server is not configured with SPAs in mind
  // and it might not enforce further best practices vital for security
  // such applications.
  // dummyClientSecret: 'secret',

  responseType: 'code',

  // set the scope for the permissions the client should request
  scope: 'openid profile email',

  showDebugInformation: true,
  
  // requireHttps: false // Set to false for local dev
  requireHttps: false,
  strictDiscoveryDocumentValidation: false
};
