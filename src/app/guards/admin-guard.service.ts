
import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    CanLoad,
    Route,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { ROLE_ADMIN, URI_LOGIN } from '../app.config';
import { UserLoggedService } from '../services/user-logged.service';



@Injectable()
export class AdminGuard implements CanActivate, CanActivateChild, CanLoad {
    constructor(private userLoggedService: UserLoggedService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        //console.log('AdminGuard#canActivate called');
        const url: string = state.url;
        return this.checkLogin(url);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        //console.log('AdminGuard#canActivateChild called');
        return this.canActivate(route, state);
    }

    canLoad(route: Route): boolean {
        //console.log('AdminGuard#canLoad called');
        const navigation = this.router.getCurrentNavigation();
        let url = '/';

        if (navigation) {
            url = navigation.extractedUrl.toString();
        }
        return this.checkLogin(url);
    }

    checkLogin(url: string): boolean {
        const roles = this.userLoggedService.getRoles();
        if (roles.includes(ROLE_ADMIN)) {
            //console.log('checkLogin: true');
            return true;
        } else {
            console.error('checkLogin: false');
            this.userLoggedService.redirectUrl = url;
            this.userLoggedService.redirectUser = this.userLoggedService.getTokenUsername();
            console.log('AdminGuard attempted url: ' + url + ' tokenUsername: ' + this.userLoggedService.redirectUser);
            this.router.navigate([URI_LOGIN]);
            return false;
        }
    }

}
