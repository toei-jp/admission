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
    GetTheaters,
    InitializeQrcodeToken,
    InitializeQrcodeTokenList,
    SelectScreeningEvent
} from '../../../store/actions';
import * as reducers from '../../../store/reducers';

@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.component.html',
    styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
    public screeningEvents: Observable<factory.chevre.event.screeningEvent.IEvent[]>;
    public movieTheaters: Observable<factory.organization.movieTheater.IOrganization[]>;
    public theaterCode: string;
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
        this.screeningEvents = this.store.pipe(select(reducers.getScreeningEvents));
        this.movieTheaters = this.store.pipe(select(reducers.getMovieTheaters));
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
        this.selectedDate = this.dates[0];
        this.getTheaters();
    }

    /**
     * resize
     */
    public resize() {
        this.directiveRef.update();
        this.directiveRef.setIndex(0, 0, false);
    }

    public getTheaters() {
        this.store.dispatch(new GetTheaters({ params: {} }));

        const success = this.actions.pipe(
            ofType(ActionTypes.GetTheatersSuccess),
            tap(() => {
                this.store.pipe(select(reducers.getMovieTheaters)).subscribe((movieTheaters) => {
                    this.theaterCode = movieTheaters[0].location.branchCode;
                }).unsubscribe();
                this.getScreeningEvents(this.selectedDate);
            })
        );

        const fail = this.actions.pipe(
            ofType(ActionTypes.GetTheatersFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public getScreeningEvents(date: string) {
        this.selectedDate = date;
        this.store.dispatch(new GetScreeningEvents({
            params: {
                eventStatuses: [factory.chevre.eventStatusType.EventScheduled],
                startFrom: moment(this.selectedDate).toDate(),
                startThrough: moment(this.selectedDate).add(1, 'days').toDate(),
                superEvent: {
                    locationBranchCodes: [this.theaterCode]
                },
                sort: {
                    doorTime: factory.sortType.Ascending
                }
            }
        }));

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
        this.store.dispatch(new InitializeQrcodeTokenList());
        this.router.navigate(['/admission']);
    }

}
