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
    public admission: Observable<reducers.IAdmissionState>;
    public isLoading: Observable<boolean>;

    public stream: MediaStream | null;
    public isShowVideo: boolean;
    public video: HTMLVideoElement;
    public scanLoop: any;
    public updateLoop: any;
    public moment: typeof moment = moment;
    public inputCode: string;
    public updateTime: number;

    constructor(
        private store: Store<reducers.IState>,
        private actions: Actions,
        private router: Router,
        private modal: NgbModal
    ) { }

    public ngOnInit() {
        this.updateTime = 30000; // 更新は30000msごと
        this.admission = this.store.pipe(select(reducers.getAdmissionData));
        this.inputCode = '';
        this.stream = null;
        this.video = <HTMLVideoElement>document.getElementById('video');
        this.video.width = window.innerWidth;
        this.isLoading = this.store.pipe(select(reducers.getLoading));
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
        this.admission.subscribe((admission) => {
            if (admission.screeningEvent === undefined) {
                this.router.navigate(['/error']);
                return;
            }
            this.store.dispatch(new GetScreeningEventReservations({
                params: {
                    typeOf: factory.chevre.reservationType.EventReservation,
                    reservationStatuses: [
                        factory.chevre.reservationStatusType.ReservationConfirmed
                    ],
                    reservationFor: {
                        typeOf: factory.chevre.eventType.ScreeningEvent,
                        id: admission.screeningEvent.id
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
        this.admission.subscribe((admission) => {
            const screeningEventReservations = admission.screeningEventReservations;
            this.store.dispatch(new ConvertQrcodeToToken({ params: { code, screeningEventReservations } }));
        }).unsubscribe();

        const success = this.actions.pipe(
            ofType(ActionTypes.ConvertQrcodeToTokenSuccess),
            tap(() => {
                this.admission.subscribe((admission) => {
                    if (admission.qrcodeToken === undefined
                        || !admission.qrcodeToken.isAvailable) {
                        return;
                    }
                    this.admissionProcess();
                }).unsubscribe();
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
        clearInterval(this.updateLoop);
        this.updateLoop = setInterval(() => {
            this.getScreeningEventReservations();
            this.admissionAll();
            this.getScreeningEvent();
        }, this.updateTime);
    }

    public getScreeningEvent() {
        this.admission.subscribe((admission) => {
            if (admission.screeningEvent === undefined) {
                this.router.navigate(['/error']);
                return;
            }
            const id = admission.screeningEvent.id;
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

    public admissionProcess() {
        this.admission.subscribe((admission) => {
            if (admission.qrcodeToken === undefined
                || admission.qrcodeToken.token === undefined
                || admission.qrcodeToken.decodeResult === undefined) {
                return;
            }
            const token = admission.qrcodeToken.token;
            const decodeResult = admission.qrcodeToken.decodeResult;
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
        this.admission.subscribe((admission) => {
            admission.usentList.forEach((usent) => {
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
