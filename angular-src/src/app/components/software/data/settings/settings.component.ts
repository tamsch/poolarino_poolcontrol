import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SettingsService } from 'src/app/services/settings/settings.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, AfterViewInit {

    shellyConnected: string = '';
    shellyIp: string = '';

    shellyConnectedBoolean: Boolean = false;

    constructor(
        private settingsService: SettingsService
    ) { }

    ngOnInit() {
        

    }

    ngAfterViewInit(){
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

                let settings = {
                    shellyConnected: this.shellyConnectedBoolean,
                    shellyIp: this.shellyIp
                }

                this.settingsService.saveSettings(settings).subscribe(data => {
                    if(data.success){
                        this.loadSettings();
                    } else {
                        console.log('fehlgeschlagen');
                    }
                })
            }
          })
    }

    loadSettings(){
        this.settingsService.loadAllSettings().subscribe(data => {
            if(data.success){
                this.shellyConnectedBoolean = data.data.shellyConnected;
                this.shellyIp = data.data.shellyIp;

                if(this.shellyConnectedBoolean){
                    this.shellyConnected = 'yes';
                } else {
                    this.shellyConnected = 'no';
                }
            } else {

            }
        })
    }

}
