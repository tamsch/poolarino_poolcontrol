import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/services/settings/settings.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

    shellyConnected: string = '';
    raspiConnected: string = '';
    shellyIp: string = '';
    heartbeatDisabled: string = '';

    shellyConnectedBoolean: Boolean = false;
    raspiConnectedBoolean: Boolean = false;

    sensor1name: String;
    sensor1id: String;
    sensor2name: String;
    sensor2id: String;
    sensor3name: String;
    sensor3id: String;
    sensor4name: String;
    sensor4id: String;
    sensor5name: String;
    sensor5id: String;
    sensor6name: String;
    sensor6id: String;
    sensor7name: String;
    sensor7id: String;
    sensor8name: String;
    sensor8id: String;

    weatherCity: String;
    weatherCountryCode: String;
    weatherAppId: String;
    weatherName: String;

    hbDisabled: Boolean = false;

    hbDisabledSave: Boolean;


    constructor(
        private settingsService: SettingsService
    ) { }

    ngOnInit() {
        this.loadSettings();
    }

    saveOptions() {
        Swal.fire({
            title: 'Sicher?',
            text: "Einstellungen speichern?",
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Nein',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ja'
        }).then((result) => {
            if (result.value) {
                if (this.shellyConnected == 'yes') {
                    this.shellyConnectedBoolean = true;
                } else {
                    this.shellyConnectedBoolean = false;
                }

                if (this.raspiConnected == 'yes') {
                    this.raspiConnectedBoolean = true;
                } else {
                    this.raspiConnectedBoolean = false;
                }

                if (this.heartbeatDisabled == 'yes') {
                    if (this.heartbeatDisabled == 'yes' && this.hbDisabledSave == false) {

                        Swal.fire({
                            title: 'Heartbeat deaktivieren?',
                            html: "<span style='font-size:10pt'>Bitte beachte, dass Du damit nicht nur den Heartbeat, sondern auch die Updateinformationen deaktiverst. Du erhältst zukünftig keine Informationen mehr zu neuen Versionen. Der Heartbeat überträgt keinerlei personenbezogene Daten und dient uns lediglich zur Feststellung, wie häufig die Poolsteuerung zum Einsatz kommt. Weitere Informationen findest Du unter https://www.poolarino.de/heartbeat</span>",
                            icon: 'warning',
                            showCancelButton: true,
                            cancelButtonText: 'Nein',
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Ja'
                        }).then((result) => {
                            if (result.value) {
                                this.hbDisabled = true;

                                let settings = {
                                    shellyConnected: this.shellyConnectedBoolean,
                                    raspberryPiConnected: this.raspiConnectedBoolean,
                                    shellyIp: this.shellyIp,
                                    sensor1name: this.sensor1name,
                                    sensor1id: this.sensor1id,
                                    sensor2name: this.sensor2name,
                                    sensor2id: this.sensor2id,
                                    sensor3name: this.sensor3name,
                                    sensor3id: this.sensor3id,
                                    sensor4name: this.sensor4name,
                                    sensor4id: this.sensor4id,
                                    sensor5name: this.sensor5name,
                                    sensor5id: this.sensor5id,
                                    sensor6name: this.sensor6name,
                                    sensor6id: this.sensor6id,
                                    sensor7name: this.sensor7name,
                                    sensor7id: this.sensor7id,
                                    sensor8name: this.sensor8name,
                                    sensor8id: this.sensor8id,
                                    weatherCity: this.weatherCity,
                                    weatherName: this.weatherName,
                                    weatherAppId: this.weatherAppId,
                                    weatherCountryCode: this.weatherCountryCode,
                                    hbDisabled: this.hbDisabled
                                }

                                this.settingsService.saveSettings(settings).subscribe(data => {
                                    if (data.success) {
                                        this.loadSettings();
                                    } else {

                                    }
                                })
                            } else {
                                this.hbDisabled = false;
                                this.heartbeatDisabled = 'no';
                            }
                        })
                    } else {
                        this.hbDisabled = true;

                        let settings = {
                            shellyConnected: this.shellyConnectedBoolean,
                            raspberryPiConnected: this.raspiConnectedBoolean,
                            shellyIp: this.shellyIp,
                            sensor1name: this.sensor1name,
                            sensor1id: this.sensor1id,
                            sensor2name: this.sensor2name,
                            sensor2id: this.sensor2id,
                            sensor3name: this.sensor3name,
                            sensor3id: this.sensor3id,
                            sensor4name: this.sensor4name,
                            sensor4id: this.sensor4id,
                            sensor5name: this.sensor5name,
                            sensor5id: this.sensor5id,
                            sensor6name: this.sensor6name,
                            sensor6id: this.sensor6id,
                            sensor7name: this.sensor7name,
                            sensor7id: this.sensor7id,
                            sensor8name: this.sensor8name,
                            sensor8id: this.sensor8id,
                            weatherCity: this.weatherCity,
                            weatherName: this.weatherName,
                            weatherAppId: this.weatherAppId,
                            weatherCountryCode: this.weatherCountryCode,
                            hbDisabled: this.hbDisabled
                        }

                        this.settingsService.saveSettings(settings).subscribe(data => {
                            if (data.success) {
                                this.loadSettings();
                            } else {

                            }
                        })
                    }

                } else {
                    this.hbDisabled = false;

                    let settings = {
                        shellyConnected: this.shellyConnectedBoolean,
                        raspberryPiConnected: this.raspiConnectedBoolean,
                        shellyIp: this.shellyIp,
                        sensor1name: this.sensor1name,
                        sensor1id: this.sensor1id,
                        sensor2name: this.sensor2name,
                        sensor2id: this.sensor2id,
                        sensor3name: this.sensor3name,
                        sensor3id: this.sensor3id,
                        sensor4name: this.sensor4name,
                        sensor4id: this.sensor4id,
                        sensor5name: this.sensor5name,
                        sensor5id: this.sensor5id,
                        sensor6name: this.sensor6name,
                        sensor6id: this.sensor6id,
                        sensor7name: this.sensor7name,
                        sensor7id: this.sensor7id,
                        sensor8name: this.sensor8name,
                        sensor8id: this.sensor8id,
                        weatherCity: this.weatherCity,
                        weatherName: this.weatherName,
                        weatherAppId: this.weatherAppId,
                        weatherCountryCode: this.weatherCountryCode,
                        hbDisabled: this.hbDisabled
                    }

                    this.settingsService.saveSettings(settings).subscribe(data => {
                        if (data.success) {
                            this.loadSettings();
                        } else {

                        }
                    })
                }
            }
        })
    }

    loadSettings() {
        this.settingsService.loadAllSettings().subscribe(data => {
            if (data.success) {
                this.shellyConnectedBoolean = data.data.shellyConnected;
                this.raspiConnectedBoolean = data.data.raspberryPiConnected;
                this.shellyIp = data.data.shellyIp;

                this.sensor1name = data.data.sensor1name;
                this.sensor1id = data.data.sensor1id;
                this.sensor2name = data.data.sensor2name;
                this.sensor2id = data.data.sensor2id;
                this.sensor3name = data.data.sensor3name;
                this.sensor3id = data.data.sensor3id;
                this.sensor4name = data.data.sensor4name;
                this.sensor4id = data.data.sensor4id;
                this.sensor5name = data.data.sensor5name;
                this.sensor5id = data.data.sensor5id;
                this.sensor6name = data.data.sensor6name;
                this.sensor6id = data.data.sensor6id;
                this.sensor7name = data.data.sensor7name;
                this.sensor7id = data.data.sensor7id;
                this.sensor8name = data.data.sensor8name;
                this.sensor8id = data.data.sensor8id;
                this.weatherCity = data.data.weatherCity;
                this.weatherName = data.data.weatherName;
                this.weatherAppId = data.data.weatherAppId;
                this.weatherCountryCode = data.data.weatherCountryCode;
                this.hbDisabled = data.data.hbDisabled;
                this.hbDisabledSave = data.data.hbDisabled;



                if (this.shellyConnectedBoolean) {
                    this.shellyConnected = 'yes';
                } else {
                    this.shellyConnected = 'no';
                }

                if (this.raspiConnectedBoolean) {
                    this.raspiConnected = 'yes';
                } else {
                    this.raspiConnected = 'no';
                }

                if (this.hbDisabled) {
                    this.heartbeatDisabled = 'yes';
                } else {
                    this.heartbeatDisabled = 'no';
                }
            } else {

            }
        })
    }

}
