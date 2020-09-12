import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { LocalStorageDataService } from '../localStorageData/local-storage-data.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { LoginResponseReturn } from '../login/LoginResponseReturn';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({
  providedIn: 'root'
})
export class TokenService  implements HttpInterceptor{
  isTokenRefreshing = false;
  refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor(private localStorageData:LocalStorageDataService,private httpClient: HttpClient,
    private localStorage:LocalStorageService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(this.localStorageData.getJwtToken()){
      this.addJwtTokenInRequest(req,this.localStorageData.getJwtToken());
    }

    return next.handle(req).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse
          && error.status === 403) {
          return this.sendRequestAgain(req, next);
      } else {
          return throwError(error);
      }
    }));
  }

  private sendRequestAgain(req:HttpRequest<any> , next: HttpHandler){
    if (!this.isTokenRefreshing) {
      this.isTokenRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.getNewRefreshToken().pipe(
          switchMap((refreshTokenResponse: LoginResponseReturn) => {
              this.isTokenRefreshing = false;
              this.refreshTokenSubject.next(refreshTokenResponse.jwtToken);
              return next.handle(this.addJwtTokenInRequest(req, refreshTokenResponse.jwtToken));
          })
      )
  } 
  }
  
  private addJwtTokenInRequest(req:HttpRequest<any>, jwtToken:string){
    return req.clone({
      headers: req.headers.set('Authorization',
          'Bearer ' + jwtToken)
    });
  }

  private getNewRefreshToken() {
    const refreshTokenPayload = {
      refreshToken: this.localStorageData.getRefreshToken(),
      username: this.localStorageData.getUserName()
    }
    return this.httpClient.post<LoginResponseReturn>('http://localhost:8080/api/auth/refresh/token',
      refreshTokenPayload)
      .pipe(tap(response => {
        this.localStorage.store('authenticationToken', response.jwtToken);
        this.localStorage.store('expiresAt', response.expiresAt);
      }));
  }
}
