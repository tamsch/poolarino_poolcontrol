/**
 * @author	Tammo Schimanski
 * @copyright	www.poolarino.de
 * @license	GPL https://www.gnu.org/licenses/gpl-3.0.de.html
 * @package	poolarino_poolcontrol
 */

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SettingsService } from 'src/app/services/settings/settings.service';
import { WeatherforecastService } from 'src/app/services/weatherforecast/weatherforecast.service';

@Component({
    selector: 'app-weather-forecast',
    templateUrl: './weather-forecast.component.html',
    styleUrls: ['./weather-forecast.component.css']
})
export class WeatherForecastComponent implements OnInit, AfterViewInit {

    forecasts: any = [];
    forecastsDate: any = [];
    completeDates: any = [];
    completeTimes: any = [];
    forecastsIcons: Array<String> = [];

    weatherIcon0: String = '';
    weatherIcon1: String = '';
    weatherIcon2: String = '';
    weatherIcon3: String = '';
    weatherIcon4: String = '';
    weatherIcon5: String = '';
    weatherIcon6: String = '';
    weatherIcon7: String = '';

    dateHelper0: String = '';
    dateHelper1: String = '';
    dateHelper2: String = '';
    dateHelper3: String = '';
    dateHelper4: String = '';
    dateHelper5: String = '';
    dateHelper6: String = '';
    dateHelper7: String = '';
    

    iconUrl: String = 'http://openweathermap.org/img/w/';
    fileType: String = '.png';

    weatherName: String;

    constructor(
        private weatherforecastService: WeatherforecastService,
        private settingsService: SettingsService
    ) { }

    ngOnInit() {

        this.settingsService.loadAllSettings().subscribe(data => {
            if(data.success){
                this.weatherName = data.data.weatherName
            }
        })

        this.weatherforecastService.loadForecast().subscribe(data => {

            if(data.success && data.data.cod == "200"){
                for(let num of data.data.list){
                    this.forecasts.push(num);
                    this.forecastsDate.push(num.dt_txt)
                }

                this.weatherIcon0 = this.iconUrl + this.forecasts[0].weather[0].icon + this.fileType;
                this.weatherIcon1 = this.iconUrl + this.forecasts[1].weather[0].icon + this.fileType;
                this.weatherIcon2 = this.iconUrl + this.forecasts[2].weather[0].icon + this.fileType;
                this.weatherIcon3 = this.iconUrl + this.forecasts[3].weather[0].icon + this.fileType;
                this.weatherIcon4 = this.iconUrl + this.forecasts[4].weather[0].icon + this.fileType;
                this.weatherIcon5 = this.iconUrl + this.forecasts[5].weather[0].icon + this.fileType;
                this.weatherIcon6 = this.iconUrl + this.forecasts[6].weather[0].icon + this.fileType;
                this.weatherIcon7 = this.iconUrl + this.forecasts[7].weather[0].icon + this.fileType;



                for(let num of this.forecastsDate){
                    let dateHelper = num.split(' ', 2);
                    let dateSplitter = dateHelper[0];
                    let day = dateSplitter.slice(-2);
                    let month = dateSplitter.substring(5, 7);
                    let timeHelper = dateHelper[1];
                    timeHelper = timeHelper.slice(0, -3);

                    let completeDate = day + '.' + month;
                    let completeTime = timeHelper;

                    this.completeDates.push(completeDate);
                    this.completeTimes.push(completeTime);
                }
            } else if(data.success && (data.data.cod == "400" || data.data.cod == "404")){
                console.log(data.data.message);
            } else {

            }
        })
    }

    ngAfterViewInit() {

    }

}
