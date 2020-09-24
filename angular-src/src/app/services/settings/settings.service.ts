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

    addTemperatureSensors(temperatureSensors) {
        return this.http.post<data>(environment.serverUrl + '/settings/addTemperatureSensors', temperatureSensors)
    }

    loadTemperatureSensorData() {
        return this.http.get<data>(environment.serverUrl + '/settings/loadTemperatureSensorData');
    }

    checkVersion() {
        return this.http.get<data>(environment.serverUrl + '/settings/checkVersion');
    }
}

interface data {
    success: Boolean,
    msg: String,
    data: any,
    updateAvailable: Boolean
}
