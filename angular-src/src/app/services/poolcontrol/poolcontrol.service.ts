import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PoolcontrolService {

    constructor(
        private http: HttpClient
    ) { }

    getTemperatureFromAllSensors() {
        return this.http.get<data>( environment.serverUrl + '/poolControl/getTemperatureFromAllSensors/');
    }

    toggleDevice(deviceId){
        return this.http.get<data>( environment.serverUrl + '/poolcontrol/toggleDevice/' + deviceId);
    }

    getDeviceStatus(deviceId){
        return this.http.get<data>( environment.serverUrl + '/poolcontrol/getDeviceStatus/' + deviceId);
    }

    getDeviceLoad() {
        return this.http.get<data>( environment.serverUrl + '/poolcontrol/getRelayLoad');
    }

    getSolar(){
        return this.http.get<data>( environment.serverUrl + '/poolcontrol/getSolar');
    }

    setSolar(solarValue) {
        return this.http.get<data>( environment.serverUrl + '/poolcontrol/solar/' + solarValue);
    }

    relayRuntime(relayId) {
        return this.http.get<data>( environment.serverUrl + '/poolcontrol/relayRuntime/' + relayId);
    }
}

interface data {
    relays: any;
    ison: Boolean;
    success: Boolean,
    msg: String,
    data: any,
    deviceId: String
}
