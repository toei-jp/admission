import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import jsqr from 'jsqr';
import * as moment from 'moment';
import { Observable, race } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { IDecodeResult } from '../../../model';
import {
    ActionTypes,
    Admission,
    ConvertQrcodeToToken,
    GetScreeningEvent,
    GetScreeningEventReservations
} from '../../../store/actions';
import * as reducers from '../../../store/reducers';
import { AlertModalComponent } from '../../parts/alert-modal/alert-modal.component';

@Component({
    selector: 'app-admission',
    templateUrl: './admission.component.html',
    styleUrls: ['./admission.component.scss']
})
export class AdmissionComponent implements OnInit, OnDestroy {
    public screeningEventReservations:
        Observable<factory.chevre.reservation.event.IReservation<factory.chevre.event.screeningEvent.IEvent>[]>;
    public screeningEvent: Observable<factory.chevre.event.screeningEvent.IEvent | undefined>;
    public qrcodeToken: Observable<{
        token?: string;
        decodeResult?: IDecodeResult;
        checkTokenActions: factory.action.check.token.IAction[];
        isAvailable: boolean;
        statusCode: number;
    } | undefined>;
    public usentList: Observable<{ token: string; decodeResult: IDecodeResult }[]>;
    public isLoading: Observable<boolean>;

    public stream: MediaStream | null;
    public isShowVideo: boolean;
    public video: HTMLVideoElement;
    public scanLoop: any;
    public updateLoop: any;
    public moment: typeof moment = moment;
    public inputCode: string;

    constructor(
        private store: Store<reducers.IState>,
        private actions: Actions,
        private router: Router,
        private modal: NgbModal
    ) { }

    public ngOnInit() {
        this.inputCode = '';
        this.stream = null;
        this.video = <HTMLVideoElement>document.getElementById('video');
        this.video.width = window.innerWidth;
        this.isLoading = this.store.pipe(select(reducers.getLoading));
        this.screeningEventReservations = this.store.pipe(select(reducers.getScreeningEventReservations));
        this.screeningEvent = this.store.pipe(select(reducers.getScreeningEvent));
        this.qrcodeToken = this.store.pipe(select(reducers.getQrcodeToken));
        this.usentList = this.store.pipe(select(reducers.getUsentList));
        this.getScreeningEventReservations();
        this.update();
    }

    public ngOnDestroy() {
        clearInterval(this.scanLoop);
        clearInterval(this.updateLoop);
    }

    @HostListener('document:keypress', ['$event'])
    public handleKeyboardEvent(event: KeyboardEvent) {
        const KEY_ENTER = 'Enter';
        const KEY_ESCAPE = 'Escape';
        if (event.key === KEY_ENTER && this.inputCode.length > 0) {
            // 読み取り完了
            this.convertQrcodeToToken(this.inputCode);
            this.inputCode = '';
        } else if (event.key !== KEY_ESCAPE) {
            this.inputCode += event.key;
        }
    }

    public async start() {
        try {
            this.inputCode = '';
            const constraints = {
                audio: false,
                video: { facingMode: { exact: 'environment' } }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.stream = stream;
            this.video.srcObject = this.stream;
            const scanLoopTime = 500;
            this.scanLoop = setInterval(() => {
                const code = this.scan();
                if (this.inputCode === code) {
                    return;
                }
                if (code !== null) {
                    this.inputCode = code;
                    // 読み取り完了
                    this.convertQrcodeToToken(code);
                }
            }, scanLoopTime);
            this.isShowVideo = true;
        } catch (error) {
            console.error(error);
        }
    }

    public stop() {
        if (this.stream === null) {
            return;
        }
        this.stream.getVideoTracks().forEach((track) => {
            track.stop();
        });
        this.stream = null;
        this.isShowVideo = false;
    }

    public scan() {
        if (this.stream === null) {
            return null;
        }
        // キャンバスへ反映
        const canvas = <HTMLCanvasElement>document.getElementById('canvas');
        const context = <CanvasRenderingContext2D>canvas.getContext('2d');
        const width = this.video.offsetWidth;
        const height = this.video.offsetHeight;
        canvas.setAttribute('width', String(width));
        canvas.setAttribute('height', String(height));
        context.drawImage(this.video, 0, 0, width, height);
        // QRコードデコード
        const imageData = context.getImageData(0, 0, width, height);
        const qrcode = jsqr(imageData.data, width, height);
        if (qrcode === null) {
            return null;
        }
        return qrcode.data;
    }

    public getScreeningEventReservations() {
        this.screeningEvent.subscribe((screeningEvent) => {
            if (screeningEvent === undefined) {
                this.router.navigate(['/error']);
                return;
            }
            this.store.dispatch(new GetScreeningEventReservations({
                params: {
                    sort: { reservationNumber: factory.chevre.sortType.Ascending },
                    reservationStatuses: [
                        factory.chevre.reservationStatusType.ReservationConfirmed
                        // factory.chevre.reservationStatusType.ReservationCancelled,
                        // factory.chevre.reservationStatusType.ReservationHold,
                        // factory.chevre.reservationStatusType.ReservationPending
                    ],
                    reservationFor: {
                        typeOf: factory.chevre.eventType.ScreeningEvent,
                        id: screeningEvent.id
                    }
                }
            }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(ActionTypes.GetScreeningEventReservationsSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(ActionTypes.GetScreeningEventReservationsFail),
            tap(() => {
                this.router.navigate(['/error']);
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    /**
     * QRコードをトークンへ変換
     * @param {string} code
     */
    public convertQrcodeToToken(code: string) {
        this.screeningEventReservations.subscribe((screeningEventReservations) => {
            this.store.dispatch(new ConvertQrcodeToToken({ params: { code, screeningEventReservations } }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(ActionTypes.ConvertQrcodeToTokenSuccess),
            tap(() => {
                this.admission();
            })
        );

        const fail = this.actions.pipe(
            ofType(ActionTypes.ConvertQrcodeToTokenFail),
            tap(() => {
                this.openAlert({
                    title: 'エラー',
                    body: '読み込みに失敗しました。'
                });
            })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public update() {
        const loopTime = 60000; // 1分に一回
        clearInterval(this.updateLoop);
        this.updateLoop = setInterval(() => {
            this.getScreeningEventReservations();
            this.admissionAll();
            this.getScreeningEvent();
        }, loopTime);
    }

    public getScreeningEvent() {
        this.screeningEvent.subscribe((screeningEvent) => {
            if (screeningEvent === undefined) {
                this.router.navigate(['/error']);
                return;
            }
            const id = screeningEvent.id;
            this.store.dispatch(new GetScreeningEvent({ params: { id } }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(ActionTypes.GetScreeningEventSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(ActionTypes.GetScreeningEventFail),
            tap(() => { })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public admission() {
        this.qrcodeToken.subscribe((qrcodeToken) => {
            if (qrcodeToken === undefined
                || qrcodeToken.token === undefined
                || qrcodeToken.decodeResult === undefined) {
                return;
            }
            const token = qrcodeToken.token;
            const decodeResult = qrcodeToken.decodeResult;
            this.store.dispatch(new Admission({ token, decodeResult }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(ActionTypes.AdmissionSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(ActionTypes.AdmissionFail),
            tap(() => { })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public admissionAll() {
        this.usentList.subscribe((usentList) => {
            usentList.forEach((usent) => {
                const token = usent.token;
                const decodeResult = usent.decodeResult;
                this.store.dispatch(new Admission({ token, decodeResult }));
            });
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(ActionTypes.AdmissionSuccess),
            tap(() => { })
        );

        const fail = this.actions.pipe(
            ofType(ActionTypes.AdmissionFail),
            tap(() => { })
        );
        race(success, fail).pipe(take(1)).subscribe();
    }

    public openAlert(args: {
        title: string;
        body: string;
    }) {
        const modalRef = this.modal.open(AlertModalComponent, {
            centered: true
        });
        modalRef.componentInstance.title = args.title;
        modalRef.componentInstance.body = args.body;
    }

}
