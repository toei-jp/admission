import { factory } from '@cinerino/api-javascript-client';
import { IDecodeResult } from '../../model';
import { Actions, ActionTypes } from '../actions';


/**
 * State
 */
export interface IState {
    loading: boolean;
    error: string | null;
    movieTheaters: factory.organization.movieTheater.IOrganization[];
    movieTheater?: factory.organization.movieTheater.IOrganization;
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
    qrcodeTokenList: {
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
    movieTheaters: [],
    screeningEvents: [],
    screeningEventReservations: [],
    qrcodeTokenList: []
};

function getInitialState(): IState {
    const json = localStorage.getItem('state');
    if (json === undefined || json === null) {
        return initialState;
    }
    const data: { App: IState } = JSON.parse(json);
    return data.App;
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
        case ActionTypes.GetTheaters: {
            return { ...state, loading: true };
        }
        case ActionTypes.GetTheatersSuccess: {
            const movieTheaters = action.payload.movieTheaters;
            return { ...state, loading: false, error: null, movieTheaters };
        }
        case ActionTypes.GetTheatersFail: {
            const error = action.payload.error;
            return { ...state, loading: false, error: JSON.stringify(error) };
        }
        case ActionTypes.SelectTheater: {
            const movieTheater = action.payload.movieTheater;
            return { ...state, loading: false, error: null, movieTheater };
        }
        case ActionTypes.GetScreeningEvent: {
            return { ...state };
        }
        case ActionTypes.GetScreeningEventSuccess: {
            const screeningEvent = action.payload.screeningEvent;
            return { ...state, error: null, screeningEvent };
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
            return { ...state, loading: false, error: null, screeningEvents };
        }
        case ActionTypes.GetScreeningEventsFail: {
            const error = action.payload.error;
            return { ...state, loading: false, error: JSON.stringify(error) };
        }
        case ActionTypes.SelectScreeningEvent: {
            const screeningEvent = action.payload.screeningEvent;
            return { ...state, loading: false, error: null, screeningEvent };
        }
        case ActionTypes.GetScreeningEventReservations: {
            return { ...state, loading: true };
        }
        case ActionTypes.GetScreeningEventReservationsSuccess: {
            state.screeningEventReservations = action.payload.screeningEventReservations;
            return { ...state, loading: false, error: null };
        }
        case ActionTypes.GetScreeningEventReservationsFail: {
            const error = action.payload.error;
            return { ...state, loading: false, error: JSON.stringify(error) };
        }
        case ActionTypes.InitializeQrcodeToken: {
            const qrcodeToken = undefined;
            return { ...state, qrcodeToken };
        }
        case ActionTypes.InitializeQrcodeTokenList: {
            state.qrcodeTokenList = [];
            return { ...state };
        }
        case ActionTypes.ConvertQrcodeToToken: {
            return { ...state, loading: true, error: null };
        }
        case ActionTypes.ConvertQrcodeToTokenSuccess: {
            const qrcodeToken = action.payload;
            const qrcodeTokenList = state.qrcodeTokenList;
            if (qrcodeToken.isAvailable
                && qrcodeToken.token !== undefined
                && qrcodeToken.decodeResult !== undefined) {
                qrcodeTokenList.push({
                    token: qrcodeToken.token,
                    decodeResult: qrcodeToken.decodeResult
                });
            }
            return { ...state, loading: false, error: null, qrcodeToken, qrcodeTokenList };
        }
        case ActionTypes.ConvertQrcodeToTokenFail: {
            const error = action.payload.error;
            return { ...state, loading: false, error: JSON.stringify(error) };
        }
        case ActionTypes.Admission: {
            return { ...state, error: null };
        }
        case ActionTypes.AdmissionSuccess: {
            const token = action.payload.token;
            const decodeResult = action.payload.decodeResult;
            const qrcodeTokenList = state.qrcodeTokenList.filter((qrcode) => {
                return qrcode.token !== token && qrcode.decodeResult.iat !== decodeResult.iat;
            });
            return { ...state, error: null, qrcodeTokenList };
        }
        case ActionTypes.AdmissionFail: {
            const error = action.payload.error;
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
export const getMovieTheaters = (state: IState) => state.movieTheaters;
export const getMovieTheater = (state: IState) => state.movieTheater;
export const getScreeningEvents = (state: IState) => state.screeningEvents;
export const getScreeningEvent = (state: IState) => state.screeningEvent;
export const getScreeningEventReservations = (state: IState) => state.screeningEventReservations;
export const getQrcodeToken = (state: IState) => state.qrcodeToken;
export const getQrcodeTokenList = (state: IState) => state.qrcodeTokenList;
