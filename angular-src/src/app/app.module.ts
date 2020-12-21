import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpConfigInterceptor } from './interceptor/httpconfig.interceptor';

import { AppComponent } from './app.component';

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
    BrowserAnimationsModule
],
providers: [ 
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
