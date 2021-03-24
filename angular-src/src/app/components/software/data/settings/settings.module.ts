import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';


import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        SettingsComponent
    ],
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatInputModule,
        MatTabsModule,
        FormsModule,
        SettingsRoutingModule,
        NgxMaterialTimepickerModule.setLocale('de-DE')
    ]
})
export class SettingsModule { }
