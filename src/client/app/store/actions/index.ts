
import { factory } from '@cinerino/api-javascript-client';
import { Action } from '@ngrx/store';
import { IDecodeResult, IReservation } from '../../model';

/**
 * Action types
 */
export enum ActionTypes {
    Delete = '[User] User',
    GetSellers = '[User] Get Sellers',
    GetSellersSuccess = '[User] Get Sellers Success',
    GetSellersFail = '[User] Get Sellers Fail',
    SelectSeller = '[User] Select Seller',
    SelectDate = '[User] Select Date',
    GetScreeningEvents = '[User] Get Screening Events',
    GetScreeningEventsSuccess = '[User] Get Screening Events Success',
    GetScreeningEventsFail = '[User] Get Screening Events Fail',
    GetScreeningEvent = '[User] Get Screening Event',
    GetScreeningEventSuccess = '[User] Get Screening Event Success',
    GetScreeningEventFail = '[User] Get Screening Event Fail',
    SelectScreeningEvent = '[User] Select Screening Event',
    GetScreeningEventReservations = '[User] Get Screening Reservations',
    GetScreeningEventReservationsSuccess = '[User] Get Screening Events Reservations Success',
    GetScreeningEventReservationsFail = '[User] Get Screening Events Reservations Fail',
    InitializeQrcodeToken = '[User] Initialize Qrcode Token',
    InitializeUsentList = '[User] Initialize Usent List',
    ConvertQrcodeToToken = '[User] Convert Qrcode To Token',
    ConvertQrcodeToTokenSuccess = '[User] Convert Qrcode To Token Success',
    ConvertQrcodeToTokenFail = '[User] Convert Qrcode To Token Fail',
    Admission = '[User] Admission',
    AdmissionSuccess = '[User] Admission Success',
    AdmissionFail = '[User] Admission Fail'
}

/**
 * Delete
 */
export class Delete implements Action {
    public readonly type = ActionTypes.Delete;
    constructor(public payload: {}) { }
}

/**
 * GetSellers
 */
export class GetSellers implements Action {
    public readonly type = ActionTypes.GetSellers;
    constructor(public payload: { params: factory.seller.ISearchConditions }) { }
}

/**
 * GetSellersSuccess
 */
export class GetSellersSuccess implements Action {
    public readonly type = ActionTypes.GetSellersSuccess;
    constructor(public payload: { sellers: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>[] }) { }
}

/**
 * GetSellersFail
 */
export class GetSellersFail implements Action {
    public readonly type = ActionTypes.GetSellersFail;
    constructor(public payload: { error: Error }) { }
}

/**
 * SelectSeller
 */
export class SelectSeller implements Action {
    public readonly type = ActionTypes.SelectSeller;
    constructor(public payload: { seller: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>> }) { }
}

/**
 * SelectDate
 */
export class SelectDate implements Action {
    public readonly type = ActionTypes.SelectDate;
    constructor(public payload: { date: string }) { }
}

/**
 * GetScreeningEvent
 */
export class GetScreeningEvent implements Action {
    public readonly type = ActionTypes.GetScreeningEvent;
    constructor(public payload: { params: { id: string; } }) { }
}

/**
 * GetScreeningEventSuccess
 */
export class GetScreeningEventSuccess implements Action {
    public readonly type = ActionTypes.GetScreeningEventSuccess;
    constructor(public payload: { screeningEvent: factory.chevre.event.screeningEvent.IEvent }) { }
}

/**
 * GetScreeningEventFail
 */
export class GetScreeningEventFail implements Action {
    public readonly type = ActionTypes.GetScreeningEventFail;
    constructor(public payload: { error: Error }) { }
}

/**
 * GetScreeningEvents
 */
export class GetScreeningEvents implements Action {
    public readonly type = ActionTypes.GetScreeningEvents;
    constructor(public payload: { params: factory.chevre.event.screeningEvent.ISearchConditions }) { }
}

/**
 * GetScreeningEventsSuccess
 */
export class GetScreeningEventsSuccess implements Action {
    public readonly type = ActionTypes.GetScreeningEventsSuccess;
    constructor(public payload: { screeningEvents: factory.chevre.event.screeningEvent.IEvent[] }) { }
}

/**
 * GetScreeningEventsFail
 */
export class GetScreeningEventsFail implements Action {
    public readonly type = ActionTypes.GetScreeningEventsFail;
    constructor(public payload: { error: Error }) { }
}

/**
 * SelectScreeningEvent
 */
export class SelectScreeningEvent implements Action {
    public readonly type = ActionTypes.SelectScreeningEvent;
    constructor(public payload: { screeningEvent: factory.chevre.event.screeningEvent.IEvent }) { }
}

/**
 * GetScreeningEventReservations
 */
export class GetScreeningEventReservations implements Action {
    public readonly type = ActionTypes.GetScreeningEventReservations;
    constructor(public payload: {
        params: factory.chevre.reservation.ISearchConditions<factory.chevre.reservationType.EventReservation>
    }) { }
}

/**
 * GetScreeningEventReservationsSuccess
 */
export class GetScreeningEventReservationsSuccess implements Action {
    public readonly type = ActionTypes.GetScreeningEventReservationsSuccess;
    constructor(public payload: {
        screeningEventReservations: IReservation[]
    }) { }
}

/**
 * GetScreeningEventReservationsFail
 */
export class GetScreeningEventReservationsFail implements Action {
    public readonly type = ActionTypes.GetScreeningEventReservationsFail;
    constructor(public payload: { error: Error }) { }
}

/**
 * InitializeQrcodeToken
 */
export class InitializeQrcodeToken implements Action {
    public readonly type = ActionTypes.InitializeQrcodeToken;
    constructor(public payload?: {}) { }
}

/**
 * InitializeUsentList
 */
export class InitializeUsentList implements Action {
    public readonly type = ActionTypes.InitializeUsentList;
    constructor(public payload?: {}) { }
}

/**
 * ConvertQrcodeToToken
 */
export class ConvertQrcodeToToken implements Action {
    public readonly type = ActionTypes.ConvertQrcodeToToken;
    constructor(public payload: {
        params: {
            code: string;
            screeningEventReservations: IReservation[];
        }
    }) { }
}

/**
 * ConvertQrcodeToTokenSuccess
 */
export class ConvertQrcodeToTokenSuccess implements Action {
    public readonly type = ActionTypes.ConvertQrcodeToTokenSuccess;
    constructor(public payload: {
        token?: string;
        decodeResult?: IDecodeResult;
        availableReservation?: IReservation;
        checkTokenActions: factory.action.check.token.IAction[];
        isAvailable: boolean;
        statusCode: number;
    }) { }
}

/**
 * ConvertQrcodeToTokenFail
 */
export class ConvertQrcodeToTokenFail implements Action {
    public readonly type = ActionTypes.ConvertQrcodeToTokenFail;
    constructor(public payload: { error: Error }) { }
}


/**
 * Admission
 */
export class Admission implements Action {
    public readonly type = ActionTypes.Admission;
    constructor(public payload: { token: string; decodeResult: IDecodeResult }) { }
}

/**
 * AdmissionSuccess
 */
export class AdmissionSuccess implements Action {
    public readonly type = ActionTypes.AdmissionSuccess;
    constructor(public payload: { token: string; decodeResult: IDecodeResult }) { }
}

/**
 * AdmissionFail
 */
export class AdmissionFail implements Action {
    public readonly type = ActionTypes.AdmissionFail;
    constructor(public payload: { error: Error, token: string; decodeResult: IDecodeResult }) { }
}

/**
 * Actions
 */
export type Actions =
    | Delete
    | GetSellers
    | GetSellersSuccess
    | GetSellersFail
    | SelectSeller
    | SelectDate
    | GetScreeningEvent
    | GetScreeningEventSuccess
    | GetScreeningEventFail
    | GetScreeningEvents
    | GetScreeningEventsSuccess
    | GetScreeningEventsFail
    | SelectScreeningEvent
    | GetScreeningEventReservations
    | GetScreeningEventReservationsSuccess
    | GetScreeningEventReservationsFail
    | InitializeQrcodeToken
    | InitializeUsentList
    | ConvertQrcodeToToken
    | ConvertQrcodeToTokenSuccess
    | ConvertQrcodeToTokenFail
    | Admission
    | AdmissionSuccess
    | AdmissionFail;
