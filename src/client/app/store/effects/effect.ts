import { Injectable } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { OK } from 'http-status';
import * as decode from 'jwt-decode';
import { map, mergeMap } from 'rxjs/operators';
import { IDecodeResult } from '../../model';
import { CinerinoService } from '../../services';
import {
    ActionTypes,
    Admission,
    AdmissionFail,
    AdmissionSuccess,
    ConvertQrcodeToToken,
    ConvertQrcodeToTokenFail,
    ConvertQrcodeToTokenSuccess,
    GetScreeningEvent,
    GetScreeningEventFail,
    GetScreeningEventReservations,
    GetScreeningEventReservationsFail,
    GetScreeningEventReservationsSuccess,
    GetScreeningEvents,
    GetScreeningEventsFail,
    GetScreeningEventsSuccess,
    GetScreeningEventSuccess,
    GetTheaters,
    GetTheatersFail,
    GetTheatersSuccess
} from '../actions';

/**
 * Effects
 */
@Injectable()
export class Effects {

    constructor(
        private actions: Actions,
        private cinerino: CinerinoService,
    ) { }

    /**
     * getTheaters
     */
    @Effect()
    public getTheaters = this.actions.pipe(
        ofType<GetTheaters>(ActionTypes.GetTheaters),
        map(action => action.payload),
        mergeMap(async (payload) => {
            // console.log(payload);
            try {
                await this.cinerino.getServices();
                const movieTheatersResult = await this.cinerino.organization.searchMovieTheaters(payload.params);
                const movieTheaters = movieTheatersResult.data;
                return new GetTheatersSuccess({ movieTheaters });
            } catch (error) {
                return new GetTheatersFail({ error: error });
            }
        })
    );

    /**
     * getScreeningEvent
     */
    @Effect()
    public getScreeningEvent = this.actions.pipe(
        ofType<GetScreeningEvent>(ActionTypes.GetScreeningEvent),
        map(action => action.payload),
        mergeMap(async (payload) => {
            // console.log(payload);
            try {
                await this.cinerino.getServices();
                const screeningEvent = await this.cinerino.event.findScreeningEventById(payload.params);
                return new GetScreeningEventSuccess({ screeningEvent });
            } catch (error) {
                return new GetScreeningEventFail({ error: error });
            }
        })
    );

    /**
     * getScreeningEvents
     */
    @Effect()
    public getScreeningEvents = this.actions.pipe(
        ofType<GetScreeningEvents>(ActionTypes.GetScreeningEvents),
        map(action => action.payload),
        mergeMap(async (payload) => {
            // console.log(payload);
            try {
                await this.cinerino.getServices();
                const screeningEventsResult = await this.cinerino.event.searchScreeningEvents(payload.params);
                const screeningEvents = screeningEventsResult.data;
                return new GetScreeningEventsSuccess({ screeningEvents });
            } catch (error) {
                return new GetScreeningEventsFail({ error: error });
            }
        })
    );

    /**
     * getScreeningEventReservations
     */
    @Effect()
    public getScreeningEventReservations = this.actions.pipe(
        ofType<GetScreeningEventReservations>(ActionTypes.GetScreeningEventReservations),
        map(action => action.payload),
        mergeMap(async (payload) => {
            // console.log(payload);
            try {
                await this.cinerino.getServices();
                const screeningEventReservationsResult = await this.cinerino.reservation.searchScreeningEventReservations(payload.params);
                const screeningEventReservations = screeningEventReservationsResult.data;
                return new GetScreeningEventReservationsSuccess({ screeningEventReservations });
            } catch (error) {
                return new GetScreeningEventReservationsFail({ error: error });
            }
        })
    );

    /**
     * convertQrcodeToToken
     */
    @Effect()
    public convertQrcodeToToken = this.actions.pipe(
        ofType<ConvertQrcodeToToken>(ActionTypes.ConvertQrcodeToToken),
        map(action => action.payload),
        mergeMap(async (payload) => {
            // console.log(payload);
            try {
                await this.cinerino.getServices();
            } catch (error) {
                return new ConvertQrcodeToTokenFail({ error });
            }
            const code = payload.params.code;
            const screeningEventReservations = payload.params.screeningEventReservations;
            let token: string;
            try {
                const getTokenResult = await this.cinerino.admin.ownershipInfo.getToken({ code });
                token = getTokenResult.token;
            } catch (error) {
                const checkTokenActions: factory.action.check.token.IAction[] = [];
                const isAvailable = false;
                const statusCode = error.code;
                return new ConvertQrcodeToTokenSuccess({ checkTokenActions, isAvailable, statusCode });
            }
            try {
                const decodeResult = decode<IDecodeResult>(token);
                const checkTokenActionsResult = await this.cinerino.admin.ownershipInfo.searchCheckTokenActions({ id: decodeResult.id });
                const checkTokenActions = checkTokenActionsResult.data;
                // 利用可能判定
                const availableReservation = screeningEventReservations
                    .filter((r) => r.reservationStatus === factory.chevre.reservationStatusType.ReservationConfirmed)
                    .find((r) => r.id === decodeResult.typeOfGood.id);
                const isAvailable = availableReservation !== undefined;
                const statusCode = OK;
                return new ConvertQrcodeToTokenSuccess({
                    token, decodeResult, availableReservation, checkTokenActions, isAvailable, statusCode
                });
            } catch (error) {
                return new ConvertQrcodeToTokenFail({ error });
            }
        })
    );

    /**
     * Admission
     */
    @Effect()
    public Admission = this.actions.pipe(
        ofType<Admission>(ActionTypes.Admission),
        map(action => action.payload),
        mergeMap(async (payload) => {
            // console.log(payload);
            const token = payload.token;
            const decodeResult = payload.decodeResult;
            try {
                await this.cinerino.getServices();
                await this.cinerino.reservation.findScreeningEventReservationByToken({ token });

                return new AdmissionSuccess({ token, decodeResult });
            } catch (error) {
                return new AdmissionFail({ error, token, decodeResult });
            }
        })
    );
}
