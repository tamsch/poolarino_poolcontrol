import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from 'process';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    constructor(
        private http: HttpClient
    ) { }

    loadAllSettings() {
        return this.http.get<data>(environment.serverUrl + '/settings/loadAllSettings');
    }

    saveSettings(settings) {
        return this.http.put<data>(environment.serverUrl + '/settings/saveSettings', settings);
    }

    checkVersion() {
        return this.http.get<data>(environment.serverUrl + '/settings/checkVersion');
    }

    loadSensorIcons(){
        return this.http.get<data>(environment.serverUrl + '/settings/loadSensorIcons');
    }

    loadRelayTitles(){
        return this.http.get<data>(environment.serverUrl + '/settings/loadRelayTitles');
    }

    getSolarAndSkimmerSensorIds(){
        return this.http.get<data>(environment.serverUrl + '/settings/getSolarAndSkimmerSensorIds');
    }
}

interface data {
    success: Boolean,
    msg: String,
    data: any,
    updateAvailable: Boolean,
    solarSensorId: String,
    skimmerSensorId: String
}
