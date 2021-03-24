import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClockService } from 'src/app/services/general/clock.service';
import { Subscription } from 'rxjs';
import { SettingsService } from 'src/app/services/settings/settings.service';
import { interval } from 'rxjs';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {

    private _clockSubscription: Subscription;
    time: Date;

    subVersion: any;

    updateAvailable: Boolean = false;

    versionInfo: String;

    constructor(
        private clockService: ClockService,
        private settingsService: SettingsService
    ) { }

    ngOnInit() {
        this._clockSubscription = this.clockService.getClock().subscribe(time => this.time = time);

        setTimeout(() => {
            this.checkVersion();
        }, 10000);

        this.subVersion = interval(3600000).subscribe(x => this.checkVersion());
    }

    ngOnDestroy(): void {
        this._clockSubscription.unsubscribe();
    }

    checkVersion() {
        this.settingsService.checkVersion().subscribe(data => {
            if (data.success) {
                if (data.updateAvailable) {
                    this.updateAvailable = true;
                } else {
                    this.updateAvailable = false;
                }

                this.versionInfo = data.data.versionInfo
            }
        })
    }


}
