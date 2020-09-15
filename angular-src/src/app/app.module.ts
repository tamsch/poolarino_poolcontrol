import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpConfigInterceptor } from './interceptor/httpconfig.interceptor';
import { JwtModule } from '@auth0/angular-jwt';

import { AppComponent } from './app.component';

import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/user/auth.service';

import Swal from 'sweetalert2';
import { RoundProgressModule, ROUND_PROGRESS_DEFAULTS } from 'angular-svg-round-progressbar';

export function tokenGetter() {
return localStorage.getItem("id_token");
}

@NgModule({
declarations: [
    AppComponent,
],
imports: [
    BrowserModule,
    AppRoutingModule,
    RoundProgressModule,
    HttpClientModule,
    JwtModule.forRoot({
        config: {
            tokenGetter: tokenGetter,
            throwNoTokenError: false,
            authScheme: '',
            allowedDomains: ['localhost:3000']
            //prod: whitelistedDomains: ['192.168.178.45:3000']
            //dev: whitelistedDomains: ['localhost:3000']
        }
    }),
    BrowserAnimationsModule
],
providers: [AuthService, AuthGuard, 
    {
    provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true
    },
    {
        provide: ROUND_PROGRESS_DEFAULTS,
        useValue: {
            color: '#f00',
            background: '#0f0'
        }
    }
],
bootstrap: [AppComponent]
})
export class AppModule { }
