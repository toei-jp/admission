import { factory } from '@cinerino/api-javascript-client';
import { IDecodeResult } from '../../model';
import { Actions, ActionTypes } from '../actions';


/**
 * State
 */
export interface IState {
    loading: boolean;
    error: string | null;
    admissionData: IAdmissionState;
}

export interface IAdmissionState {
    sellers: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>[];
    seller?: factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>;
    date?: string;
    screeningEvents: factory.chevre.event.screeningEvent.IEvent[];
    screeningEvent?: factory.chevre.event.screeningEvent.IEvent;
    screeningEventReservations: factory.chevre.reservation.event.IReservation<factory.chevre.event.screeningEvent.IEvent>[];
    qrcodeToken?: {
        token?: string;
        decodeResult?: IDecodeResult;
        availableReservation?: factory.chevre.reservation.event.ISearchConditions;
        checkTokenActions: factory.action.check.token.IAction[];
        isAvailable: boolean;
        statusCode: number;
    };
    usentList: {
        token: string;
        decodeResult: IDecodeResult;
    }[];
}

/**
 * Initial state
 */
export const initialState: IState = {
    loading: false,
    error: null,
    admissionData: {
        sellers: [],
        screeningEvents: [],
        screeningEventReservations: [],
        usentList: []
    }
};

function getInitialState(): IState {
    const json = localStorage.getItem('state');
    if (json === undefined || json === null) {
        return initialState;
    }
    const data: { App: IState } = JSON.parse(json);
    if (data.App.admissionData === undefined) {
        return initialState;
    }

    return Object.assign(initialState, data.App);
}

/**
 * Reducer
 * @param state
 * @param action
 */
export function reducer(
    state = getInitialState(),
    action: Actions
): IState {
    switch (action.type) {
        case ActionTypes.Delete: {
            return { ...state };
        }
        case ActionTypes.GetSellers: {
            return { ...state, loading: true };
        }
        case ActionTypes.GetSellersSuccess: {
            const sellers = action.payload.sellers;
            state.admissionData.sellers = sellers;
            return { ...state, loading: false, error: null };
        }
        case ActionTypes.GetSellersFail: {
            const error = action.payload.error;
            return { ...state, loading: false, error: JSON.stringify(error) };
        }
        case ActionTypes.SelectSeller: {
            const seller = action.payload.seller;
            state.admissionData.seller = seller;
            return { ...state, loading: false, error: null };
        }
        case ActionTypes.SelectDate: {
            const date = action.payload.date;
            state.admissionData.date = date;
            return { ...state, loading: false, error: null };
        }
        case ActionTypes.GetScreeningEvent: {
            return { ...state };
        }
        case ActionTypes.GetScreeningEventSuccess: {
            const screeningEvent = action.payload.screeningEvent;
            state.admissionData.screeningEvent = screeningEvent;
            return { ...state, error: null };
        }
        case ActionTypes.GetScreeningEventFail: {
            const error = action.payload.error;
            return { ...state, error: JSON.stringify(error) };
        }
        case ActionTypes.GetScreeningEvents: {
            return { ...state, loading: true };
        }
        case ActionTypes.GetScreeningEventsSuccess: {
            const screeningEvents = action.payload.screeningEvents;
            state.admissionData.screeningEvents = screeningEvents;
            return { ...state, loading: false, error: null };
        }
        case ActionTypes.GetScreeningEventsFail: {
            const error = action.payload.error;
            return { ...state, loading: false, error: JSON.stringify(error) };
        }
        case ActionTypes.SelectScreeningEvent: {
            const screeningEvent = action.payload.screeningEvent;
            state.admissionData.screeningEvent = screeningEvent;
            return { ...state, loading: false, error: null };
        }
        case ActionTypes.GetScreeningEventReservations: {
            return { ...state };
        }
        case ActionTypes.GetScreeningEventReservationsSuccess: {
            const screeningEventReservations = action.payload.screeningEventReservations;
            state.admissionData.screeningEventReservations = screeningEventReservations;
            return { ...state, error: null };
        }
        case ActionTypes.GetScreeningEventReservationsFail: {
            const error = action.payload.error;
            return { ...state, error: JSON.stringify(error) };
        }
        case ActionTypes.InitializeQrcodeToken: {
            const qrcodeToken = undefined;
            state.admissionData.qrcodeToken = qrcodeToken;
            return { ...state };
        }
        case ActionTypes.InitializeUsentList: {
            state.admissionData.usentList = [];
            return { ...state };
        }
        case ActionTypes.ConvertQrcodeToToken: {
            return { ...state, loading: true, error: null };
        }
        case ActionTypes.ConvertQrcodeToTokenSuccess: {
            const qrcodeToken = action.payload;
            state.admissionData.qrcodeToken = qrcodeToken;
            return { ...state, loading: false, error: null };
        }
        case ActionTypes.ConvertQrcodeToTokenFail: {
            const error = action.payload.error;
            return { ...state, loading: false, error: JSON.stringify(error) };
        }
        case ActionTypes.Admission: {
            return { ...state, error: null };
        }
        case ActionTypes.AdmissionSuccess: {
            const decodeResult = action.payload.decodeResult;
            const usentList = state.admissionData.usentList.filter(usent => usent.decodeResult.id !== decodeResult.id);
            state.admissionData.usentList = usentList;
            return { ...state, error: null };
        }
        case ActionTypes.AdmissionFail: {
            const error = action.payload.error;
            const token = action.payload.token;
            const decodeResult = action.payload.decodeResult;
            const findResult = state.admissionData.usentList.find(usent => usent.decodeResult.id === decodeResult.id);
            if (findResult === undefined) {
                state.admissionData.usentList.push({ token, decodeResult });
            }

            return { ...state, error: JSON.stringify(error) };
        }
        default: {
            return state;
        }
    }
}

/**
 * Selectors
 */
export const getLoading = (state: IState) => state.loading;
export const getError = (state: IState) => state.error;
export const getAdmissionData = (state: IState) => state.admissionData;
