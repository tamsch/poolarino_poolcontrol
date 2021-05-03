/**
 * @author	Tammo Schimanski
 * @copyright	www.poolarino.de
 * @license	GPL https://www.gnu.org/licenses/gpl-3.0.de.html
 * @package	poolarino_poolcontrol
 */


import { Component, OnInit } from '@angular/core';
import { PoolcontrolService } from 'src/app/services/poolcontrol/poolcontrol.service';
import { StockChart } from 'angular-highcharts';
import { interval } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment';
import { SettingsService } from 'src/app/services/settings/settings.service';

@Component({
    selector: 'app-pool-control',
    templateUrl: './pool-control.component.html',
    styleUrls: ['./pool-control.component.css']
})
export class PoolControlComponent implements OnInit {

    stock: StockChart;
    solarIsOn: Boolean;
    sub: any;
    subTemps: any;
    subVersion: any;
    showLoaderTemps: Boolean = false;
    showLoaderChart: Boolean = false;
    noValues: Boolean = false;

    sensor1icon: String = '';
    sensor2icon: String = '';
    sensor3icon: String = '';
    sensor4icon: String = '';
    sensor5icon: String = '';
    sensor6icon: String = '';
    sensor7icon: String = '';
    sensor8icon: String = '';

    tempSensor1: number;
    tempSensor2: number;
    tempSensor3: number;
    tempSensor4: number;
    tempSensor5: number;
    tempSensor6: number;
    tempSensor7: number;
    tempSensor8: number;
    tempDifferenz: number;
    tempHelper: number;

    colorCodeProg: String = 'primary';

    colorSensor1: String = '#fff';
    colorSensor2: String = '#fff';
    colorSensor3: String = '#fff';
    colorSensor4: String = '#fff';
    colorSensor5: String = '#fff';
    colorSensor6: String = '#fff';
    colorSensor7: String = '#fff';
    colorSensor8: String = '#fff';
    colorTempDifferenz: String = '#fff';

    relayZeroIsOn: Boolean;
    relayOneIsOn: Boolean;
    relayTwoIsOn: Boolean;
    relayThreeIsOn: Boolean;

    relayZeroWatt: string;
    relayOneWatt: string;
    relayTwoWatt: string;
    relayThreeWatt: string;

    relayOneRuntime: number;
    relayZeroRuntime: number;
    relayTwoRuntime: number;
    relayThreeRuntime: number;

    solarJustChanged: Boolean = false;

    newDegreeInput: Number;

    upper: any;

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

    envBoolean: Boolean = false;

    shellyRelay0Name: String;
    shellyRelay1Name: String;
    shellyRelay2Name: String;


    constructor(
        private poolControlService: PoolcontrolService,
        private settingsService: SettingsService
    ) { }

    ngOnInit() {

        if (environment.production) {

            this.envBoolean = true;

            this.getTempsAndRuntime();

            this.getDeviceLoad();

            this.refreshAllDevices();

            this.loadTemperatureSensorData();

            this.loadSensorIcons();

            this.loadRelayTitles();

            this.sub = interval(10000).subscribe(x => this.getDeviceLoad());
            this.subTemps = interval(60000).subscribe(x => this.getTempsAndRuntime());
        } else {
            this.envBoolean = false;
        }

    }

    getTempsAndRuntime() {
        this.showLoaderTemps = true;
        this.noValues = false;

        this.colorSensor1 = '#d8d8d8';
        this.colorSensor2 = '#d8d8d8';
        this.colorSensor3 = '#d8d8d8';
        this.colorSensor4 = '#d8d8d8';
        this.colorSensor5 = '#d8d8d8';
        this.colorSensor6 = '#d8d8d8';
        this.colorSensor7 = '#d8d8d8';
        this.colorSensor8 = '#d8d8d8';
        this.colorTempDifferenz = '#d8d8d8';

        this.poolControlService.getTemperatureFromAllSensors().subscribe(data => {
            if (data.success) {
                for (let num of data.data) {
                    if (num.id === this.sensor1id) {
                        this.tempSensor1 = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorSensor1 = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorSensor1 = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorSensor1 = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorSensor1 = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorSensor1 = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorSensor1 = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorSensor1 = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor2id) {
                        this.tempSensor2 = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorSensor2 = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorSensor2 = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorSensor2 = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorSensor2 = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorSensor2 = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorSensor2 = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorSensor2 = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor3id) {
                        this.tempSensor3 = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorSensor3 = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorSensor3 = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorSensor3 = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorSensor3 = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorSensor3 = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorSensor3 = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorSensor3 = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor4id) {
                        this.tempSensor4 = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorSensor4 = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorSensor4 = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorSensor4 = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorSensor4 = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorSensor4 = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorSensor4 = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorSensor4 = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor5id) {
                        this.tempSensor5 = num.t
                        if (num.t >= 0 && num.t < 5) {
                            this.colorSensor5 = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorSensor5 = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorSensor5 = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorSensor5 = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorSensor5 = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorSensor5 = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorSensor5 = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor6id) {
                        this.tempSensor6 = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorSensor6 = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorSensor6 = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorSensor6 = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorSensor6 = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorSensor6 = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorSensor6 = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorSensor6 = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor7id) {
                        this.tempSensor7 = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorSensor7 = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorSensor7 = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorSensor7 = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorSensor7 = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorSensor7 = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorSensor7 = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorSensor7 = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor8id) {
                        this.tempSensor8 = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorSensor8 = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorSensor8 = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorSensor8 = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorSensor8 = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorSensor8 = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorSensor8 = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorSensor8 = '#ff2b2b';
                        }
                    }
                }

                this.settingsService.getSolarAndSkimmerSensorIds().subscribe(data => {
                    if(data.success){
                        this.tempDifferenz = this[data.solarSensorId] - this[data.skimmerSensorId];
                        this.tempHelper = Math.round(this.tempDifferenz * 100) / 100;
                        if (this.tempHelper < 0) {
                            this.tempHelper = 0.0;
                        }
                        this.showLoaderTemps = false;
                        this.noValues = false;
                    }
                })
            } else {
                this.showLoaderTemps = false;
                this.noValues = true;
            }
        })

        let relays = ['0', '1', '2', '3'];
        for (let num of relays) {
            this.poolControlService.relayRuntime(num).subscribe(data => {
                if (data.success) {
                    if (data.data.relay === '0') {
                        this.relayZeroRuntime = data.data.runtime;
                    } else if (data.data.relay === '1') {
                        this.relayOneRuntime = data.data.runtime;
                    } else if (data.data.relay === '2') {
                        this.relayTwoRuntime = data.data.runtime;
                    } else if (data.data.relay === '3') {
                        this.relayThreeRuntime = data.data.runtime;
                    }
                }
            })
        }
    }

    toggleDevice(deviceId) {
        this.poolControlService.toggleDevice(deviceId).subscribe(data => {
            if (data.success) {
                if (deviceId === '0') {
                    if (data.data.ison) {
                        this.relayZeroIsOn = true;
                    } else {
                        this.relayZeroIsOn = false;
                    }
                } else if (deviceId === '1') {
                    if (data.data.ison) {
                        this.relayOneIsOn = true;
                    } else {
                        this.relayOneIsOn = false;
                    }
                } else if (deviceId === '2') {
                    if (data.data.ison) {
                        this.relayTwoIsOn = true;
                    } else {
                        this.relayTwoIsOn = false;
                    }
                } else if (deviceId === '3') {
                    if (data.data.ison) {
                        this.relayThreeIsOn = true;
                    } else {
                        this.relayThreeIsOn = false;
                    }
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    heightAuto: false,
                    title: 'Umschaltung fehlgeschlagen',
                    text: data.msg,
                })
            }
        })

        setTimeout(() => {
            this.getDeviceLoad();
        }, 1000);

        this.refreshDevice(deviceId);
    }

    refreshDevice(deviceId) {
        this.poolControlService.getDeviceStatus(deviceId).subscribe(data => {
            if (data.success) {
                if (deviceId === '0') {
                    if (data.data.ison) {
                        this.relayZeroIsOn = true;
                    } else {
                        this.relayZeroIsOn = false;
                    }
                } else if (deviceId === '1') {
                    if (data.data.ison) {
                        this.relayOneIsOn = true;
                    } else {
                        this.relayOneIsOn = false;
                    }
                } else if (deviceId === '2') {
                    if (data.data.ison) {
                        this.relayTwoIsOn = true;
                    } else {
                        this.relayTwoIsOn = false;
                    }
                } else if (deviceId === '3') {
                    if (data.data.ison) {
                        this.relayThreeIsOn = true;
                    } else {
                        this.relayThreeIsOn = false;
                    }
                }
            }
        })
    }

    refreshAllDevices() {
        let deviceIds = ['0', '1', '2', '3'];

        for (let num of deviceIds) {
            this.poolControlService.getDeviceStatus(num).subscribe(data => {
                if (data.success) {
                    if (data.deviceId === '0') {
                        if (data.data.ison) {
                            this.relayZeroIsOn = true;
                        } else {
                            this.relayZeroIsOn = false;
                        }
                    } else if (data.deviceId === '1') {
                        if (data.data.ison) {
                            this.relayOneIsOn = true;
                        } else {
                            this.relayOneIsOn = false;
                        }
                    } else if (data.deviceId === '2') {
                        if (data.data.ison) {
                            this.relayTwoIsOn = true;
                        } else {
                            this.relayTwoIsOn = false;
                        }
                    } else if (data.deviceId === '3') {
                        if (data.data.ison) {
                            this.relayThreeIsOn = true;
                        } else {
                            this.relayThreeIsOn = false;
                        }
                    }
                }
            })
        }

    }

    getDeviceLoad() {
        this.poolControlService.getDeviceLoad().subscribe(data => {
            if (data.success) {
                this.relayZeroWatt = data.data[0].power;
                this.relayOneWatt = data.data[1].power;
                this.relayTwoWatt = data.data[2].power;
                this.relayThreeWatt = data.data[3].power;

                this.relayZeroIsOn = data.relays[0].ison;
                this.relayOneIsOn = data.relays[1].ison;
                this.relayTwoIsOn = data.relays[2].ison;
                this.relayThreeIsOn = data.relays[3].ison;
            }
        })

        this.poolControlService.getSolar().subscribe(data => {
            if (data.success) {
                if (data.data.isOn) {
                    this.solarIsOn = true;
                } else {
                    this.solarIsOn = false;
                }
            }
        })
    }

    setSolar() {
        if (this.solarJustChanged) {

        } else {
            this.poolControlService.getSolar().subscribe(data => {
                if (data.success) {
                    if (data.data.isOn) {

                        Swal.fire({
                            heightAuto: false,
                            title: 'Sicher?',
                            text: "Solar wirklich abschalten?",
                            icon: 'warning',
                            showCancelButton: true,
                            cancelButtonText: 'Nein',
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Ja'
                        }).then((result) => {
                            if (result.value) {
                                this.solarJustChanged = true;
                                this.poolControlService.setSolar('off').subscribe(data => {
                                    if (data.success) {
                                        this.solarIsOn = false;
                                        this.getDeviceLoad();
                                    } else {
                                        Swal.fire({
                                            icon: 'error',
                                            heightAuto: false,
                                            title: 'Umschaltung fehlgeschlagen',
                                            text: data.msg,
                                        })

                                        this.solarJustChanged = false;
                                    }
                                    
                                })
                                setTimeout(() => {
                                    this.solarJustChanged = false;
                                }, 35000);
                            }
                        })

                    } else {

                        Swal.fire({
                            heightAuto: false,
                            title: 'Sicher?',
                            text: "Solar wirklich anschalten?",
                            icon: 'warning',
                            showCancelButton: true,
                            cancelButtonText: 'Nein',
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Ja'
                        }).then((result) => {
                            if (result.value) {
                                this.solarJustChanged = true;
                                this.poolControlService.setSolar('on').subscribe(data => {
                                    if (data.success) {
                                        this.getDeviceLoad();
                                    } else {
                                        Swal.fire({
                                            icon: 'error',
                                            heightAuto: false,
                                            title: 'Umschaltung fehlgeschlagen',
                                            text: data.msg,
                                        })

                                        this.solarJustChanged = false;
                                    }
                                })
                                setTimeout(() => {
                                    this.solarJustChanged = false;
                                }, 35000);
                            }
                        })
                    }
                } else {
                    console.log('Server timeout!');
                }
            })
        }

    }

    loadTemperatureSensorData() {
        this.settingsService.loadAllSettings().subscribe(data => {
            if (data.success) {
                this.sensor1id = data.data.sensor1id;
                this.sensor1name = data.data.sensor1name;
                this.sensor2id = data.data.sensor2id;
                this.sensor2name = data.data.sensor2name;
                this.sensor3id = data.data.sensor3id;
                this.sensor3name = data.data.sensor3name;
                this.sensor4id = data.data.sensor4id;
                this.sensor4name = data.data.sensor4name;
                this.sensor5id = data.data.sensor5id;
                this.sensor5name = data.data.sensor5name;
                this.sensor6id = data.data.sensor6id;
                this.sensor6name = data.data.sensor6name;
                this.sensor7id = data.data.sensor7id;
                this.sensor7name = data.data.sensor7name;
                this.sensor8id = data.data.sensor8id;
                this.sensor8name = data.data.sensor8name;

            }
        })
    }

    loadSensorIcons(){
        this.settingsService.loadSensorIcons().subscribe(data => {
            if(data.success){
                this.sensor1icon = data.data.sensor1icon;
                this.sensor2icon = data.data.sensor2icon;
                this.sensor3icon = data.data.sensor3icon;
                this.sensor4icon = data.data.sensor4icon;
                this.sensor5icon = data.data.sensor5icon;
                this.sensor6icon = data.data.sensor6icon;
                this.sensor7icon = data.data.sensor7icon;
                this.sensor8icon = data.data.sensor8icon;
            }
        })
    }
    
    loadRelayTitles(){
        this.settingsService.loadRelayTitles().subscribe(data => {
            if(data.success){
                this.shellyRelay0Name = data.data.shellyRelay0Name;
                this.shellyRelay1Name = data.data.shellyRelay1Name;
                this.shellyRelay2Name = data.data.shellyRelay2Name;
            }
        })
    }
}
