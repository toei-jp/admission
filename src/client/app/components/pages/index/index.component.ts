import { Component, OnInit } from '@angular/core';
import jsqr from 'jsqr';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
    public stream: MediaStream | null;
    public video: HTMLVideoElement;
    public code: string | null;
    public timer: any;
    constructor() { }

    public ngOnInit() {
        this.code = null;
        this.stream = null;
        this.video = <HTMLVideoElement>document.getElementById('video');
        this.video.width = 300;
        this.video.height = 300;
    }

    public async start() {
        try {
            const constraints = {
                audio: false,
                video: { facingMode: { exact: 'environment' } }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.stream = stream;
            this.video.srcObject = this.stream;
            const time = 500;
            this.timer = setInterval(() => {
                const code = this.scan();
                if (code !== null) {
                    this.code = code;
                    this.stop();
                }
            }, time);
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
    }

    public scan() {
        if (this.stream === null) {
            return null;
        }
        const canvas = <HTMLCanvasElement>document.getElementById('canvas');
        const context = <CanvasRenderingContext2D>canvas.getContext('2d');

        const width = this.video.offsetWidth;
        const height = this.video.offsetHeight;

        canvas.setAttribute('width', String(width));
        canvas.setAttribute('height', String(height));
        context.drawImage(this.video, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height);
        const qrcode = jsqr(imageData.data, width, height);
        if (qrcode === null) {
            return null;
        }
        return qrcode.data;
    }

}
