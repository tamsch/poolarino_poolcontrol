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
    raspiConnected: string = ';'
    shellyIp: string = '';

    shellyConnectedBoolean: Boolean = false;
    raspiConnectedBoolean: Boolean = false;

    sensor1name: String;
    sensor1id: String;

    constructor(
        private settingsService: SettingsService
    ) { }

    ngOnInit() {
        this.loadSettings();

    }

    saveOptions(){
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
                if(this.shellyConnected == 'yes') {
                    this.shellyConnectedBoolean = true;
                } else {
                    this.shellyConnectedBoolean = false;
                }

                if(this.raspiConnected == 'yes') {
                    this.raspiConnectedBoolean = true;
                } else {
                    this.raspiConnectedBoolean = false;
                }

                let settings = {
                    shellyConnected: this.shellyConnectedBoolean,
                    raspberryPiConnected: this.raspiConnectedBoolean,
                    shellyIp: this.shellyIp,
                    sensors: [
                        {
                            sensor1name: this.sensor1name,
                            sensor1id: this.sensor1id
                        }
                    ]
                    
                }

                this.settingsService.saveSettings(settings).subscribe(data => {
                    if(data.success){
                        this.loadSettings();
                    } else {
                        
                    }
                })
            }
          })
    }

    loadSettings(){
        this.settingsService.loadAllSettings().subscribe(data => {
            if(data.success){
                this.shellyConnectedBoolean = data.data.shellyConnected;
                this.raspiConnectedBoolean = data.data.raspberryPiConnected;
                this.shellyIp = data.data.shellyIp;
                
                this.sensor1name = data.data.sensor1name;
                this.sensor1id = data.data.sensor1id;
                

                if(this.shellyConnectedBoolean){
                    this.shellyConnected = 'yes';
                } else {
                    this.shellyConnected = 'no';
                }

                if(this.raspiConnectedBoolean){
                    this.raspiConnected = 'yes';
                } else {
                    this.raspiConnected = 'no';
                }
            } else {

            }
        })
    }

}
