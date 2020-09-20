import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/user/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    isCustomerDetails: Boolean = false;

    constructor(
        public router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {

        this.router.events.subscribe((val) => {
            if(this.router.url.includes('customers/details')) {
                this.isCustomerDetails = true;
            } else {
                this.isCustomerDetails = false;
            }
        });

        
    }

    logout() {
        this.authService.logout().subscribe(data => {
            if(data.success){
                localStorage.clear();
               // this.router.navigate(['login']);
            }
        })
    }


}
