import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { API_GENERIC_URI, LOCAL_STORAGE_TOKEN_KEY } from '../app.config';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import { LocalStorageService } from '../shared/services/local-storage.service';

@Injectable()
export class HTTPService {

    constructor(private http: Http, private localStorageService: LocalStorageService) { }

    get(endpoint: string, headers?: Headers, params?: URLSearchParams): Observable<any> {
        const options: RequestOptions = this.setOptions(headers, params);
        endpoint = this.getFullEndpoint(endpoint);
        return this.http.get(endpoint, options).map(this.extractData).catch(this.handleError);
    }

    post(endpoint: string, body?: Object, headers?: Headers, params?: URLSearchParams): Observable<any> {
        const options: RequestOptions = this.setOptions(headers, params);
        endpoint = this.getFullEndpoint(endpoint);
        return this.http.post(endpoint, body, options).map(this.extractData).catch(this.handleError);
    }

    put(endpoint: string, body?: Object, headers?: Headers, params?: URLSearchParams): Observable<any> {
        const options: RequestOptions = this.setOptions(headers, params);
        endpoint = this.getFullEndpoint(endpoint);
        return this.http.put(endpoint, body, options).map(this.extractData).catch(this.handleError);
    }

    patch(endpoint: string, body?: Object, headers?: Headers, params?: URLSearchParams): Observable<any> {
        const options: RequestOptions = this.setOptions(headers, params);
        endpoint = this.getFullEndpoint(endpoint);
        return this.http.patch(endpoint, body, options).map(this.extractData).catch(this.handleError);
    }

    delete(endpoint: string, headers?: Headers, params?: URLSearchParams): Observable<any> {
        const options: RequestOptions = this.setOptions(headers, params);
        endpoint = this.getFullEndpoint(endpoint);
        return this.http.delete(endpoint, options).map(this.extractData).catch(this.handleError);
    }

    private setOptions(headers: Headers, params: URLSearchParams): RequestOptions {
        const requestHeaders: Headers = headers || new Headers();
        requestHeaders.append('X-Requested-With', 'XMLHttpRequest');
        if (!requestHeaders.has('Authorization')) {
            const sessionString: string = this.localStorageService.getItem(LOCAL_STORAGE_TOKEN_KEY);
            const parsedSession = JSON.parse(sessionString);
            if (parsedSession) {
                const base64Token: string = btoa(`${parsedSession.token}:`);
                requestHeaders.append('Authorization', `Basic ${base64Token}`);
            }
        }
        const options: RequestOptions = new RequestOptions({ headers: requestHeaders, params: params });
        if (requestHeaders.has('Accept') && requestHeaders.get('Accept') === 'application/pdf') {
            options.responseType = ResponseContentType.Blob;
        }
        return options;
    }

    private getFullEndpoint(endpoint: string): string {
        return endpoint.startsWith('api/') ? endpoint : API_GENERIC_URI + endpoint;
    }

    private extractData(res: Response): any {
        if (res.text()) {
            if (res.headers.get('content-type').indexOf('application/pdf') !== -1) {
                return res.blob();
            } else if (res.headers.get('content-type').indexOf('application/json') !== -1) {
                return res.json();
            } else {
                return res.text();
            }
        } else {
            return res;
        }
    }

    private handleError(error: Response): any {
        try {
            JSON.parse(error['_body']);
            return Observable.throw(error.json());
        } catch (e) {
            return Observable.throw(error);
        }
    }

}
