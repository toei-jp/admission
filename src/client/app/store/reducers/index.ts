import {
    createFeatureSelector,
    createSelector
} from '@ngrx/store';
import * as reducer from './reducer';

/**
 * State and reducer
 */
export { IState, reducer } from './reducer';

/**
 * Selectors
 */
export const getFeatureState = createFeatureSelector<reducer.IState>('App');
export const getLoading = createSelector(getFeatureState, reducer.getLoading);
export const getError = createSelector(getFeatureState, reducer.getError);
export const getMovieTheaters = createSelector(getFeatureState, reducer.getMovieTheaters);
export const getMovieTheater = createSelector(getFeatureState, reducer.getMovieTheater);
export const getScreeningEvents = createSelector(getFeatureState, reducer.getScreeningEvents);
export const getScreeningEvent = createSelector(getFeatureState, reducer.getScreeningEvent);
export const getScreeningEventReservations = createSelector(getFeatureState, reducer.getScreeningEventReservations);
export const getQrcodeToken = createSelector(getFeatureState, reducer.getQrcodeToken);
export const getQrcodeTokenList = createSelector(getFeatureState, reducer.getQrcodeTokenList);
