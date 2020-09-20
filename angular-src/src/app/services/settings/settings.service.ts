import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    constructor(
        private http: HttpClient
    ) { }

    loadAllSettings(){
        return this.http.get<data>( environment.serverUrl + '/settings/loadAllSettings');
    }
}

interface data {
    success: Boolean,
    msg: String,
    data: any
}
