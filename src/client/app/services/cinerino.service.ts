import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as cinerino from '@cinerino/api-javascript-client';

@Injectable({
    providedIn: 'root'
})
export class CinerinoService {
    public auth: cinerino.IImplicitGrantClient;
    public event: cinerino.service.Event;
    public order: cinerino.service.Order;
    public seller: cinerino.service.Seller;
    public person: cinerino.service.Person;
    public ownershipInfo: cinerino.service.person.OwnershipInfo;
    public reservation: cinerino.service.Reservation;
    public task: cinerino.service.Task;
    public transaction: {
        placeOrder: cinerino.service.transaction.PlaceOrder,
        returnOrder: cinerino.service.transaction.ReturnOrder
    };
    public admin: {
        ownershipInfo: cinerino.service.OwnershipInfo
    };
    private endpoint: string;

    constructor(
        private http: HttpClient
    ) { }

    /**
     * getServices
     */
    public async getServices(): Promise<void> {
        try {
            const option = await this.createOption();
            this.event = new cinerino.service.Event(option);
            this.order = new cinerino.service.Order(option);
            this.seller = new cinerino.service.Seller(option);
            this.person = new cinerino.service.Person(option);
            this.ownershipInfo = new cinerino.service.person.OwnershipInfo(option);
            this.reservation = new cinerino.service.Reservation(option);
            this.task = new cinerino.service.Task(option);
            this.transaction = {
                placeOrder: new cinerino.service.transaction.PlaceOrder(option),
                returnOrder: new cinerino.service.transaction.ReturnOrder(option)
            };
            this.admin = {
                ownershipInfo: new cinerino.service.OwnershipInfo(option)
            };
        } catch (err) {
            console.error(err);
            throw new Error('getServices is failed');
        }
    }

    /**
     * @method createOption
     */
    public async createOption() {
        await this.authorize();
        return {
            endpoint: this.endpoint,
            auth: this.auth
        };
    }

    /**
     * @method authorize
     */
    public async authorize() {
        const url = '/api/authorize/getCredentials';
        const body = {
            // member: '0'
            member: '1'
        };
        const result = await this.http.post<{
            accessToken: string;
            userName: string;
            endpoint: string;
        }>(url, body).toPromise();
        const option = {
            domain: '',
            clientId: '',
            redirectUri: '',
            logoutUri: '',
            responseType: '',
            scope: '',
            state: '',
            nonce: null,
            tokenIssuer: ''
        };
        this.auth = cinerino.createAuthInstance(option);
        this.auth.setCredentials({ accessToken: result.accessToken });
        this.endpoint = result.endpoint;
    }

    /**
     * サインイン
     */
    public async signIn() {
        const url = '/api/authorize/signIn';
        const result = await this.http.get<any>(url, {}).toPromise();
        // console.log(result.url);
        location.href = result.url;
    }

    /**
     * サインアウト
     */
    public async signOut() {
        const url = '/api/authorize/signOut';
        const result = await this.http.get<any>(url, {}).toPromise();
        // console.log(result.url);
        location.href = result.url;
    }
}
