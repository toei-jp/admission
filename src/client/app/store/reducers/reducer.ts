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
    movieTheaters: [],
    screeningEvents: [],
    screeningEventReservations: [],
    usentList: []
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
            return { ...state };
        }
        case ActionTypes.GetScreeningEventReservationsSuccess: {
            state.screeningEventReservations = action.payload.screeningEventReservations;
            return { ...state, error: null };
        }
        case ActionTypes.GetScreeningEventReservationsFail: {
            const error = action.payload.error;
            return { ...state, error: JSON.stringify(error) };
        }
        case ActionTypes.InitializeQrcodeToken: {
            const qrcodeToken = undefined;
            return { ...state, qrcodeToken };
        }
        case ActionTypes.InitializeUsentList: {
            state.usentList = [];
            return { ...state };
        }
        case ActionTypes.ConvertQrcodeToToken: {
            return { ...state, loading: true, error: null };
        }
        case ActionTypes.ConvertQrcodeToTokenSuccess: {
            const qrcodeToken = action.payload;

            return { ...state, loading: false, error: null, qrcodeToken };
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
            const usentList = state.usentList.filter(usent => usent.decodeResult.id !== decodeResult.id);
            state.usentList = usentList;
            return { ...state, error: null };
        }
        case ActionTypes.AdmissionFail: {
            const error = action.payload.error;
            const token = action.payload.token;
            const decodeResult = action.payload.decodeResult;
            const findResult = state.usentList.find(usent => usent.decodeResult.id === decodeResult.id);
            if (findResult === undefined) {
                state.usentList.push({ token, decodeResult });
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
export const getMovieTheaters = (state: IState) => state.movieTheaters;
export const getMovieTheater = (state: IState) => state.movieTheater;
export const getScreeningEvents = (state: IState) => state.screeningEvents;
export const getScreeningEvent = (state: IState) => state.screeningEvent;
export const getScreeningEventReservations = (state: IState) => state.screeningEventReservations;
export const getQrcodeToken = (state: IState) => state.qrcodeToken;
export const getUsentList = (state: IState) => state.usentList;
