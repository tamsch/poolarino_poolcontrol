import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SoftwareComponent } from './software.component';

const routes: Routes = [
    {
        path: '',
        component: SoftwareComponent,
        children: [
            {
                path: 'poolControl',
                children: [
                    {
                        path: '',
                        loadChildren: './data/pool-control/pool-control.module#PoolControlModule' 
                    },
                    {
                        path: 'poolControlOverview',
                        loadChildren: './data/pool-control/pool-control-overview/pool-control-overview.module#PoolControlOverviewModule'
                    }
                ]
            },
            {
                path: 'weatherForecast',
                children: [
                    {
                        path: '',
                        loadChildren: './data/weather-forecast/weather-forecast.module#WeatherForecastModule' 
                    }
                ]
            },
            {
                path: 'settings',
                children: [
                    {
                        path: '',
                        loadChildren: './data/settings/settings.module#SettingsModule'
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SoftwareRoutingModule { }
