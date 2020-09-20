/**
 * @author	Tammo Schimanski
 * @copyright	www.poolarino.de
 * @license	GPL https://www.gnu.org/licenses/gpl-3.0.de.html
 * @package	poolarino_poolcontrol
 */


import { Component, OnInit} from '@angular/core';
import { PoolcontrolService } from 'src/app/services/poolcontrol/poolcontrol.service';
import { StockChart } from 'angular-highcharts';
import { interval } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment';

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
    showLoaderTemps: Boolean = false;
    showLoaderChart: Boolean = false;
    noValues: Boolean = false;

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

    constructor(
        private poolControlService: PoolcontrolService
    ) { }

    ngOnInit() {

        if(environment.production) {
            this.getTempsAndRuntime();

            this.getDeviceLoad();
    
            this.refreshAllDevices();
        

            this.sub = interval(10000).subscribe(x => this.getDeviceLoad());
            this.subTemps = interval(10000).subscribe(x => this.getTempsAndRuntime());
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
            if(data.success) {
                for(let num of data.data) {
                    if(num.id === '28-0114329d55c5') {
                        this.tempLufttemperatur = num.t;
                        if(num.t >= 0 && num.t <= 5){
                            this.colorTempLufttemperatur = '#0e58cf';
                        } else if(num.t >= 5.1 && num.t <= 10){
                            this.colorTempLufttemperatur = '#3366FF';
                        } else if(num.t >= 10.1 && num.t <= 15){
                            this.colorTempLufttemperatur = '#7badf7';
                        } else if(num.t >= 15.1 && num.t <= 20){
                            this.colorTempLufttemperatur = '#f9bd25';
                        } else if(num.t >= 20.1 && num.t <= 25){
                            this.colorTempLufttemperatur = '#fc6400';
                        } else if(num.t >= 25.1 && num.t <= 30){
                            this.colorTempLufttemperatur = '#fc4700';
                        } else if(num.t >= 30.1){
                            this.colorTempLufttemperatur = '#ff2b2b';
                        }
                    } else if(num.id === '28-02131d69d7aa') {
                        this.tempSkimmer = num.t;
                        if(num.t >= 0 && num.t <= 5){
                            this.colorTempSkimmer = '#0e58cf';
                        } else if(num.t >= 5.1 && num.t <= 10){
                            this.colorTempSkimmer = '#3366FF';
                        } else if(num.t >= 10.1 && num.t <= 15){
                            this.colorTempSkimmer = '#7badf7';
                        } else if(num.t >= 15.1 && num.t <= 20){
                            this.colorTempSkimmer = '#f9bd25';
                        } else if(num.t >= 20.1 && num.t <= 25){
                            this.colorTempSkimmer = '#fc6400';
                        } else if(num.t >= 25.1 && num.t <= 30){
                            this.colorTempSkimmer = '#fc4700';
                        } else if(num.t >= 30.1){
                            this.colorTempSkimmer = '#ff2b2b';
                        }
                    } else if(num.id === '28-02131d4f0aaa') {
                        this.tempSwitchgehaeuse = num.t;
                        if(num.t >= 0 && num.t <= 5){
                            this.colorTempSwitchGehaeuse = '#0e58cf';
                        } else if(num.t >= 5.1 && num.t <= 10){
                            this.colorTempSwitchGehaeuse = '#3366FF';
                        } else if(num.t >= 10.1 && num.t <= 15){
                            this.colorTempSwitchGehaeuse = '#7badf7';
                        } else if(num.t >= 15.1 && num.t <= 20){
                            this.colorTempSwitchGehaeuse = '#f9bd25';
                        } else if(num.t >= 20.1 && num.t <= 25){
                            this.colorTempSwitchGehaeuse = '#fc6400';
                        } else if(num.t >= 25.1 && num.t <= 30){
                            this.colorTempSwitchGehaeuse = '#fc4700';
                        } else if(num.t >= 30.1){
                            this.colorTempSwitchGehaeuse = '#ff2b2b';
                        }
                    } else if(num.id === '28-02131d5ddeaa') {
                        this.tempGartenhuette = num.t;
                        if(num.t >= 0 && num.t <= 5){
                            this.colorTempGartenhuette = '#0e58cf';
                        } else if(num.t >= 5.1 && num.t <= 10){
                            this.colorTempGartenhuette = '#3366FF';
                        } else if(num.t >= 10.1 && num.t <= 15){
                            this.colorTempGartenhuette = '#7badf7';
                        } else if(num.t >= 15.1 && num.t <= 20){
                            this.colorTempGartenhuette = '#f9bd25';
                        } else if(num.t >= 20.1 && num.t <= 25){
                            this.colorTempGartenhuette = '#fc6400';
                        } else if(num.t >= 25.1 && num.t <= 30){
                            this.colorTempGartenhuette = '#fc4700';
                        } else if(num.t >= 30.1){
                            this.colorTempGartenhuette = '#ff2b2b';
                        }
                    } else if(num.id === '28-011432b48ee0') {
                        this.tempRaspberryGehaeuse = num.t;
                        if(num.t >= 0 && num.t <= 5){
                            this.colorTempRaspberryGehaeuse = '#0e58cf';
                        } else if(num.t >= 5.1 && num.t <= 10){
                            this.colorTempRaspberryGehaeuse = '#3366FF';
                        } else if(num.t >= 10.1 && num.t <= 15){
                            this.colorTempRaspberryGehaeuse = '#7badf7';
                        } else if(num.t >= 15.1 && num.t <= 20){
                            this.colorTempRaspberryGehaeuse = '#f9bd25';
                        } else if(num.t >= 20.1 && num.t <= 25){
                            this.colorTempRaspberryGehaeuse = '#fc6400';
                        } else if(num.t >= 25.1 && num.t <= 30){
                            this.colorTempRaspberryGehaeuse = '#fc4700';
                        } else if(num.t >= 30.1){
                            this.colorTempRaspberryGehaeuse = '#ff2b2b';
                        }
                    } else if(num.id === '28-02131d5f74aa') {
                        this.tempSolaranlage = num.t;
                        if(num.t >= 0 && num.t <= 5){
                            this.colorTempSolaranlage = '#0e58cf';
                        } else if(num.t >= 5.1 && num.t <= 10){
                            this.colorTempSolaranlage = '#3366FF';
                        } else if(num.t >= 10.1 && num.t <= 15){
                            this.colorTempSolaranlage = '#7badf7';
                        } else if(num.t >= 15.1 && num.t <= 20){
                            this.colorTempSolaranlage = '#f9bd25';
                        } else if(num.t >= 20.1 && num.t <= 25){
                            this.colorTempSolaranlage = '#fc6400';
                        } else if(num.t >= 25.1 && num.t <= 30){
                            this.colorTempSolaranlage = '#fc4700';
                        } else if(num.t >= 30.1){
                            this.colorTempSolaranlage = '#ff2b2b';
                        }
                    } else if(num.id === '28-02131d6d7faa') {
                        this.tempWarmesWasser = num.t;
                        if(num.t >= 0 && num.t <= 5){
                            this.colorTempWarmesWasser = '#0e58cf';
                        } else if(num.t >= 5.1 && num.t <= 10){
                            this.colorTempWarmesWasser = '#3366FF';
                        } else if(num.t >= 10.1 && num.t <= 15){
                            this.colorTempWarmesWasser = '#7badf7';
                        } else if(num.t >= 15.1 && num.t <= 20){
                            this.colorTempWarmesWasser = '#f9bd25';
                        } else if(num.t >= 20.1 && num.t <= 25){
                            this.colorTempWarmesWasser = '#fc6400';
                        } else if(num.t >= 25.1 && num.t <= 30){
                            this.colorTempWarmesWasser = '#fc4700';
                        } else if(num.t >= 30.1){
                            this.colorTempWarmesWasser = '#ff2b2b';
                        }
                    } else if(num.id === '28-011454301baa') {
                        this.tempHifiGehaeuse = num.t
                        if(num.t >= 0 && num.t < 5){
                            this.colorTempHifiGehaeuse = '#0e58cf';
                        } else if(num.t >= 5.1 && num.t <= 10){
                            this.colorTempHifiGehaeuse = '#3366FF';
                        } else if(num.t >= 10.1 && num.t <= 15){
                            this.colorTempHifiGehaeuse = '#7badf7';
                        } else if(num.t >= 15.1 && num.t <= 20){
                            this.colorTempHifiGehaeuse = '#f9bd25';
                        } else if(num.t >= 20.1 && num.t <= 25){
                            this.colorTempHifiGehaeuse = '#fc6400';
                        } else if(num.t >= 25.1 && num.t <= 30){
                            this.colorTempHifiGehaeuse = '#fc4700';
                        } else if(num.t >= 30.1){
                            this.colorTempHifiGehaeuse = '#ff2b2b';
                        }
                    }
                }

                this.tempDifferenz = this.tempWarmesWasser - this.tempSkimmer;
                this.tempHelper = Math.round(this.tempDifferenz * 100) / 100;
                if(this.tempHelper < 0) {
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
        for(let num of relays) {
            this.poolControlService.relayRuntime(num).subscribe(data => {
                if(data.success) {
                    if(data.data.relay === '0'){
                        this.relayZeroRuntime = data.data.runtime;
                    } else if(data.data.relay === '3'){
                        this.relayThreeRuntime = data.data.runtime;
                    }
                }
            })
        }        
    }

    toggleDevice(deviceId) {
        this.poolControlService.toggleDevice(deviceId).subscribe(data => {
            if(data.success) {
                if(deviceId === '0'){
                    if(data.data.ison) {
                        this.relayZeroIsOn = true;
                    } else {
                        this.relayZeroIsOn = false;
                    }
                } else if(deviceId === '1'){
                    if(data.data.ison) {
                        this.relayOneIsOn = true;
                    } else {
                        this.relayOneIsOn = false;
                    }
                } else if(deviceId === '2'){
                    if(data.data.ison) {
                        this.relayTwoIsOn = true;
                    } else {
                        this.relayTwoIsOn = false;
                    }
                } else if(deviceId === '3'){
                    if(data.data.ison) {
                        this.relayThreeIsOn = true;
                    } else {
                        this.relayThreeIsOn = false;
                    }
                }
            }
        })

        setTimeout(()=>{
            this.getDeviceLoad();
       }, 1000);

        this.refreshDevice(deviceId);
    }

    refreshDevice(deviceId){
        this.poolControlService.getDeviceStatus(deviceId).subscribe(data => {
            if(data.success) {
                if(deviceId === '0'){
                    if(data.data.ison) {
                        this.relayZeroIsOn = true;
                    } else {
                        this.relayZeroIsOn = false;
                    }
                } else if(deviceId === '1'){
                    if(data.data.ison) {
                        this.relayOneIsOn = true;
                    } else {
                        this.relayOneIsOn = false;
                    }
                } else if(deviceId === '2'){
                    if(data.data.ison) {
                        this.relayTwoIsOn = true;
                    } else {
                        this.relayTwoIsOn = false;
                    }
                } else if(deviceId === '3'){
                    if(data.data.ison) {
                        this.relayThreeIsOn = true;
                    } else {
                        this.relayThreeIsOn = false;
                    }
                }
            }
        })
    }

    refreshAllDevices(){
        let deviceIds = ['0', '1', '2', '3'];

        for(let num of deviceIds) {
            this.poolControlService.getDeviceStatus(num).subscribe(data => {
                if(data.success) {
                    if(num === '0'){
                        if(data.data.ison) {
                            this.relayZeroIsOn = true;
                        } else {
                            this.relayZeroIsOn = false;
                        }
                    } else if(num === '1'){
                        if(data.data.ison) {
                            this.relayOneIsOn = true;
                        } else {
                            this.relayOneIsOn = false;
                        }
                    } else if(num === '2'){
                        if(data.data.ison) {
                            this.relayTwoIsOn = true;
                        } else {
                            this.relayTwoIsOn = false;
                        }
                    } else if(num === '3'){
                        if(data.data.ison) {
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
            if(data.success){
                this.relayZeroWatt = data.data[0].power;
                this.relayOneWatt = data.data[1].power;
                this.relayTwoWatt = data.data[2].power;
                this.relayThreeWatt = data.data[3].power;
            }
        })

        this.poolControlService.getSolarState().subscribe(data => {
            if(data.success){
                if(data.data.isOn){
                    this.solarIsOn = true;
                } else {
                    this.solarIsOn = false;
                }
            }
        })
    }

    setSolar() {
        if(this.solarJustChanged) {
            
        } else {
            this.poolControlService.getSolar().subscribe(data => {
                if(data.success){
                    if(data.data[0].isOn){

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
                                    if(data.success) {
                                        this.solarIsOn = false;
                                        this.getDeviceLoad();
                                    }
                                })
                                setTimeout(()=>{
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
                                    if(data.success) {
                                        this.getDeviceLoad();
                                    }
                                })
                                setTimeout(()=>{
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

}
