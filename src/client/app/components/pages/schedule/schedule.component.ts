import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import * as moment from 'moment';
import { SwiperComponent, SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import {
    ActionTypes,
    GetScreeningEvents,
    GetSellers,
    InitializeQrcodeToken,
    SelectDate,
    SelectScreeningEvent,
    SelectSeller
} from '../../../store/actions';
import * as reducers from '../../../store/reducers';

@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
    public admission: Observable<reducers.IAdmissionState>;
    public branchCode: string;
    public dates: string[];
    public selectedDate: string;
    public moment: typeof moment = moment;
    public swiperConfig: SwiperConfigInterface;
    @ViewChild(SwiperComponent) public componentRef: SwiperComponent;
    @ViewChild(SwiperDirective) public directiveRef: SwiperDirective;

    constructor(
        private store: Store<reducers.IState>,
        private actions: Actions,
        private router: Router
    ) { }

    public ngOnInit() {
        this.admission = this.store.pipe(select(reducers.getAdmissionData));
        this.dates = [];
        for (let i = 0; i < 7; i++) {
            this.dates.push(moment().add(i, 'days').format('YYYYMMDD'));
        }
        this.swiperConfig = {
            spaceBetween: 10,
            slidesPerView: 7,
            breakpoints: {
                320: { slidesPerView: 2 },
                767: { slidesPerView: 3 },
                1024: { slidesPerView: 5 }
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            }
        };
        this.admission.subscribe((admission) => {
            const findResult = this.dates.find((d) => d === admission.date);
            this.selectedDate = (admission.date === undefined || findResult === undefined)
                ? this.dates[0] : admission.date;
            this.getSellers();
        }).unsubscribe();
    }

    /**
     * resize
     */
    public resize() {
        this.directiveRef.update();
        this.directiveRef.setIndex(0, 0, false);
    }

    public getSellers() {
        this.store.dispatch(new GetSellers({ params: {} }));
        const success = this.actions.pipe(
            ofType(ActionTypes.GetSellersSuccess),
            tap(() => {
                this.admission.subscribe((admission) => {
                    let seller = admission.sellers[0];
                    if (admission.seller !== undefined) {
                        seller = admission.seller;
                    }
                    if (seller.location === undefined
                        || seller.location.branchCode === undefined) {
                        this.router.navigate(['/error']);
                        return;
                    }
                    this.branchCode = seller.location.branchCode;
                    this.getScreeningEvents(this.selectedDate);
                }).unsubscribe();
            })
        );

        const fail = this.actions.pipe(
            ofType(ActionTypes.GetSellersFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public getScreeningEvents(date: string) {
        this.selectedDate = date;
        this.admission.subscribe((admission) => {
            const seller = admission.sellers.find((s) => {
                return (s.location !== undefined
                    && s.location.branchCode !== undefined
                    && s.location.branchCode === this.branchCode);
            });
            if (seller === undefined) {
                this.router.navigate(['/error']);
                return;
            }
            this.store.dispatch(new SelectSeller({ seller }));
            this.store.dispatch(new SelectDate({ date }));
            this.store.dispatch(new GetScreeningEvents({
                params: {
                    typeOf: factory.chevre.eventType.ScreeningEvent,
                    eventStatuses: [factory.chevre.eventStatusType.EventScheduled],
                    startFrom: moment(this.selectedDate).toDate(),
                    startThrough: moment(this.selectedDate).add(1, 'days').toDate(),
                    superEvent: { locationBranchCodes: [this.branchCode] },
                    sort: { doorTime: factory.sortType.Ascending }
                }
            }));
        }).unsubscribe();
        const success = this.actions.pipe(
            ofType(ActionTypes.GetScreeningEventsSuccess),
            tap(() => { })
        );
        const fail = this.actions.pipe(
            ofType(ActionTypes.GetScreeningEventsFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public select(screeningEvent: factory.chevre.event.screeningEvent.IEvent) {
        this.store.dispatch(new SelectScreeningEvent({ screeningEvent }));
        this.store.dispatch(new InitializeQrcodeToken());
        this.router.navigate(['/admission']);
    }

}
