/**
 * @author	Tammo Schimanski
 * @copyright	www.poolarino.de
 * @license	GPL https://www.gnu.org/licenses/gpl-3.0.de.html
 * @package	poolarino_poolcontrol
 */

import { Component } from '@angular/core';
import { Router, Event, NavigationStart } from '@angular/router';
import { AuthService } from './services/user/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    constructor(private router: Router, private authService: AuthService) {

        this.router.events.subscribe((event: Event) => {
            if(localStorage.getItem('id_token')) {
                if (event instanceof NavigationStart) {
                    this.authService.checkForRelog().subscribe(data => {
                        if(data.success) {
                            localStorage.clear();
                            //this.router.navigate(["login"]);
                        }
                    })
                }
            }
            
        });
    
        

   }

    title = 'Poolarino_Poolcontrol';
}
