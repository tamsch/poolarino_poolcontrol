import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/services/settings/settings.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

    shellySelected: String;

    constructor(
        private settingsService: SettingsService
    ) { }

    ngOnInit() {
        this.shellySelected = 'no';
    }

    saveOptions(){
        console.log('test');
    }

}
