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

    tempGartenhuette: number;
    tempSkimmer: number;
    tempSwitchgehaeuse: number;
    tempRaspberryGehaeuse: number;
    tempLufttemperatur: number;
    tempSolaranlage: number;
    tempWarmesWasser: number;
    tempDifferenz: number;
    tempHelper: number;
    tempHifiGehaeuse: number;

    colorCodeProg: String = 'primary';

    colorTempLufttemperatur: String = '#fff';
    colorTempGartenhuette: String = '#fff';
    colorTempRaspberryGehaeuse: String = '#fff';
    colorTempSwitchGehaeuse: String = '#fff';
    colorTempHifiGehaeuse: String = '#fff';
    colorTempSkimmer: String = '#fff';
    colorTempSolaranlage: String = '#fff';
    colorTempWarmesWasser: String = '#fff';
    colorTempDifferenz: String = '#fff';

    combHelperGartenhuette: any = [];
    combHelperSkimmer: any = [];
    combHelperLufttemperatur: any = [];
    combHelperSwitchgehaeuse: any = [];
    combHelperRaspberryGehaeuse: any = [];
    combHelperSolaranlage: any = [];
    combHelperWarmesWasser: any = [];

    finiHelperGartenhuette: any = [];
    finiHelperSkimmer: any = [];
    finiHelperLufttemperatur: any = [];
    finiHelperSwitchgehaeuse: any = [];
    finiHelperRaspberryGehaeuse: any = [];
    finiHelperSolaranlage: any = [];
    finiHelperWarmesWasser: any = [];

    relayZeroIsOn: Boolean;
    relayOneIsOn: Boolean;
    relayTwoIsOn: Boolean;
    relayThreeIsOn: Boolean;

    relayZeroWatt: String;
    relayOneWatt: String;
    relayTwoWatt: String;
    relayThreeWatt: String;

    relayOneRuntime: Number;
    relayZeroRuntime: Number;
    relayThreeRuntime: Number;

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


            this.sub = interval(10000).subscribe(x => this.getDeviceLoad());
            this.subTemps = interval(60000).subscribe(x => this.getTempsAndRuntime());
        } else {
            this.envBoolean = false;
        }

    }

    getTempsAndRuntime() {
        this.showLoaderTemps = true;
        this.noValues = false;

        this.colorTempLufttemperatur = '#d8d8d8';
        this.colorTempGartenhuette = '#d8d8d8';
        this.colorTempRaspberryGehaeuse = '#d8d8d8';
        this.colorTempSwitchGehaeuse = '#d8d8d8';
        this.colorTempHifiGehaeuse = '#d8d8d8';
        this.colorTempSkimmer = '#d8d8d8';
        this.colorTempSolaranlage = '#d8d8d8';
        this.colorTempWarmesWasser = '#d8d8d8';
        this.colorTempDifferenz = '#d8d8d8';
        this.poolControlService.getTemperatureFromAllSensors().subscribe(data => {
            if (data.success) {
                for (let num of data.data) {
                    if (num.id === this.sensor7id) {
                        this.tempLufttemperatur = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorTempLufttemperatur = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorTempLufttemperatur = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorTempLufttemperatur = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorTempLufttemperatur = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorTempLufttemperatur = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorTempLufttemperatur = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorTempLufttemperatur = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor6id) {
                        this.tempSkimmer = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorTempSkimmer = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorTempSkimmer = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorTempSkimmer = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorTempSkimmer = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorTempSkimmer = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorTempSkimmer = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorTempSkimmer = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor4id) {
                        this.tempSwitchgehaeuse = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorTempSwitchGehaeuse = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorTempSwitchGehaeuse = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorTempSwitchGehaeuse = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorTempSwitchGehaeuse = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorTempSwitchGehaeuse = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorTempSwitchGehaeuse = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorTempSwitchGehaeuse = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor2id) {
                        this.tempGartenhuette = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorTempGartenhuette = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorTempGartenhuette = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorTempGartenhuette = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorTempGartenhuette = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorTempGartenhuette = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorTempGartenhuette = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorTempGartenhuette = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor3id) {
                        this.tempRaspberryGehaeuse = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorTempRaspberryGehaeuse = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorTempRaspberryGehaeuse = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorTempRaspberryGehaeuse = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorTempRaspberryGehaeuse = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorTempRaspberryGehaeuse = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorTempRaspberryGehaeuse = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorTempRaspberryGehaeuse = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor1id) {
                        this.tempSolaranlage = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorTempSolaranlage = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorTempSolaranlage = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorTempSolaranlage = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorTempSolaranlage = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorTempSolaranlage = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorTempSolaranlage = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorTempSolaranlage = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor8id) {
                        this.tempWarmesWasser = num.t;
                        if (num.t >= 0 && num.t <= 5) {
                            this.colorTempWarmesWasser = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorTempWarmesWasser = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorTempWarmesWasser = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorTempWarmesWasser = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorTempWarmesWasser = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorTempWarmesWasser = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorTempWarmesWasser = '#ff2b2b';
                        }
                    } else if (num.id === this.sensor5id) {
                        this.tempHifiGehaeuse = num.t
                        if (num.t >= 0 && num.t < 5) {
                            this.colorTempHifiGehaeuse = '#0e58cf';
                        } else if (num.t >= 5.1 && num.t <= 10) {
                            this.colorTempHifiGehaeuse = '#3366FF';
                        } else if (num.t >= 10.1 && num.t <= 15) {
                            this.colorTempHifiGehaeuse = '#7badf7';
                        } else if (num.t >= 15.1 && num.t <= 20) {
                            this.colorTempHifiGehaeuse = '#f9bd25';
                        } else if (num.t >= 20.1 && num.t <= 25) {
                            this.colorTempHifiGehaeuse = '#fc6400';
                        } else if (num.t >= 25.1 && num.t <= 30) {
                            this.colorTempHifiGehaeuse = '#fc4700';
                        } else if (num.t >= 30.1) {
                            this.colorTempHifiGehaeuse = '#ff2b2b';
                        }
                    }
                }

                this.tempDifferenz = this.tempWarmesWasser - this.tempSkimmer;
                this.tempHelper = Math.round(this.tempDifferenz * 100) / 100;
                if (this.tempHelper < 0) {
                    this.tempHelper = 0.0;
                }
                this.showLoaderTemps = false;
                this.noValues = false;

            } else {
                this.showLoaderTemps = false;
                this.noValues = true;
            }
        })

        let relays = ['0', '3'];
        for (let num of relays) {
            this.poolControlService.relayRuntime(num).subscribe(data => {
                if (data.success) {
                    if (data.data.relay === '0') {
                        this.relayZeroRuntime = data.data.runtime;
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
                    if (num === '0') {
                        if (data.data.ison) {
                            this.relayZeroIsOn = true;
                        } else {
                            this.relayZeroIsOn = false;
                        }
                    } else if (num === '1') {
                        if (data.data.ison) {
                            this.relayOneIsOn = true;
                        } else {
                            this.relayOneIsOn = false;
                        }
                    } else if (num === '2') {
                        if (data.data.ison) {
                            this.relayTwoIsOn = true;
                        } else {
                            this.relayTwoIsOn = false;
                        }
                    } else if (num === '3') {
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
            }
        })

        this.poolControlService.getSolarState().subscribe(data => {
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
                    if (data.data[0].isOn) {

                        Swal.fire({
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
                                    }
                                })
                                setTimeout(() => {
                                    this.solarJustChanged = false;
                                }, 35000);
                            }
                        })

                    } else {

                        Swal.fire({
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
            console.log(data);
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
}
