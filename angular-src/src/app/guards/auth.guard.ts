import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../services/user/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) {

    }
    canActivate() {
        // Prüfung ob der Benutzer eingeloggt ist durch isTokenExpired. Die Antwort muss
        // natürlich false sein. isTokenExpired = false heißt, dass der Benutzer noch 
        // über ein gültiges Token verfügt und somit eingeloggt ist. 
        if (!this.authService.loggedIn()) {
            return true;
        }

       // this.router.navigate(['/login']);
        return false;
    }

}
