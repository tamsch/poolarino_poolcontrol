import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClockService } from 'src/app/services/general/clock.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {

    private _clockSubscription: Subscription;
    time: Date;

    constructor(
        private clockService: ClockService
    ) { }

    ngOnInit() {
        this._clockSubscription = this.clockService.getClock().subscribe(time => this.time = time);
    }

    ngOnDestroy(): void {
        this._clockSubscription.unsubscribe();
    }
    

}
