import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoftwareRoutingModule } from './software-routing.module';

import { SoftwareComponent } from './software.component';
import { MenuComponent } from './menu/menu.component';
import { DataComponent } from './data/data.component';



@NgModule({
    declarations: [
        SoftwareComponent,
        MenuComponent,
        DataComponent
    ],
    imports: [
        CommonModule,
        SoftwareRoutingModule
    ]
})
export class SoftwareModule { }
