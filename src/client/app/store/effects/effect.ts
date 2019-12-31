import { Injectable } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { OK } from 'http-status';
import * as decode from 'jwt-decode';
import * as moment from 'moment';
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
    GetSellers,
    GetSellersFail,
    GetSellersSuccess
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
     * getSellers
     */
    @Effect()
    public getSellers = this.actions.pipe(
        ofType<GetSellers>(ActionTypes.GetSellers),
        map(action => action.payload),
        mergeMap(async (payload) => {
            // console.log(payload);
            try {
                await this.cinerino.getServices();
                const searchResult = await this.cinerino.seller.search(payload.params);
                const sellers = searchResult.data.filter(s => s.location !== undefined && s.location.branchCode !== undefined);
                return new GetSellersSuccess({ sellers });
            } catch (error) {
                return new GetSellersFail({ error: error });
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
                const params = payload.params;
                const limit = 100;
                let page = 1;
                let roop = true;
                let screeningEvents: factory.chevre.event.screeningEvent.IEvent[] = [];
                while (roop) {
                    params.page = page;
                    params.limit = limit;
                    const screeningEventsResult = await this.cinerino.event.searchScreeningEvents(params);
                    screeningEvents = screeningEvents.concat(screeningEventsResult.data);
                    const lastPage = Math.ceil(screeningEventsResult.totalCount / limit);
                    page++;
                    roop = !(page > lastPage);
                }
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
            const params = payload.params;
            try {
                await this.cinerino.getServices();
                let screeningEventReservations:
                    factory.chevre.reservation.IReservation<factory.chevre.reservationType.EventReservation>[] = [];
                const splitDay = 14;
                const splitCount =
                    Math.ceil(moment(params.bookingThrough).diff(moment(params.bookingFrom), 'days') / splitDay);
                for (let i = 0; i < splitCount; i++) {
                    const limit = 100;
                    let page = 1;
                    let roop = true;
                    const bookingThrough = moment(params.bookingThrough).add(-1 * splitDay * i, 'days').toDate();
                    const bookingFrom =
                        (moment(params.bookingThrough).add(-1 * splitDay * (i + 1), 'days').toDate() > moment(params.bookingFrom).toDate())
                            ? moment(params.bookingThrough).add(-1 * splitDay * (i + 1), 'days').toDate()
                            : moment(params.bookingFrom).toDate();
                    console.log(
                        moment(bookingFrom).format('YYYY/MM/DD HH:mm'),
                        moment(bookingThrough).format('YYYY/MM/DD HH:mm')
                    );
                    while (roop) {
                        params.page = page;
                        params.limit = limit;
                        const screeningEventReservationsResult =
                            await this.cinerino.reservation.search({ ...params, bookingThrough, bookingFrom });
                        screeningEventReservations =
                            screeningEventReservations.concat(screeningEventReservationsResult.data);
                        const lastPage = Math.ceil(screeningEventReservationsResult.totalCount / limit);
                        page++;
                        roop = !(page > lastPage);
                    }
                }

                const reservationsResult = screeningEventReservations.map((reservation) => {
                    return {
                        id: reservation.id,
                        reservationStatus: <factory.chevre.reservationStatusType>reservation.reservationStatus,
                        reservedTicket: reservation.reservedTicket
                    };
                });

                return new GetScreeningEventReservationsSuccess({ screeningEventReservations: reservationsResult });
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
