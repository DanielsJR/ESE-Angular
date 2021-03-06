import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../../services/local-storage.service';
import { SessionStorageService } from '../../services/session-storage.service';
import { API_BACKEND_SERVER, URI_TOKEN_AUTH } from '../../app.config';
import { Token } from '../../models/token';


@Injectable()
export class LoginService {
    private endpoint = API_BACKEND_SERVER + URI_TOKEN_AUTH;

    constructor(
        private localStorageService: LocalStorageService,
        private sessionStorageService: SessionStorageService,
        private httpCli: HttpClient
    ) { }


    login(username: string, password: string): Observable<Token> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            })
        };
        return this.httpCli.post<Token>(this.endpoint, null, httpOptions);
    }

    logout(): void {
        this.localStorageService.clearLocalStorage();
        this.sessionStorageService.clearSessionStorage();
    }


}
