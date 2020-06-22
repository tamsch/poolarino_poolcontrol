import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClockService } from 'src/app/services/general/clock.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {

    subCustomer: Boolean = false;
    subFireTrucks: Boolean = false;
    subOperations: Boolean = false;
    subWaterIntakes: Boolean = false;
    subSettings: Boolean = false;

    private _clockSubscription: Subscription;
    time: Date;

    constructor(
        private clockService: ClockService
    ) { }

    ngOnInit() {
        this._clockSubscription = this.clockService.getClock().subscribe(time => this.time = time);
    }

    changeContent(submenu) {

        this.subCustomer = false;
        this.subFireTrucks = false;
        this.subOperations = false;
        this.subWaterIntakes = false;
        this.subSettings = false;

        this[submenu] = true;
    }

    ngOnDestroy(): void {
        this._clockSubscription.unsubscribe();
    }
    

}
