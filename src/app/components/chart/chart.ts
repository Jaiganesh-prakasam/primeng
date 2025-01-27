import {NgModule,Component,ElementRef,AfterViewInit,OnDestroy,Input,Output,EventEmitter,ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import * as Chart from 'chart.js';

@Component({
    selector: 'p-chart',
    template: `
        <div style="position:relative" [style.width]="responsive && !width ? null : width" [style.height]="responsive && !height ? null : height">
            <canvas [attr.width]="responsive && !width ? null : width" [attr.height]="responsive && !height ? null : height" (click)="onCanvasClick($event)"></canvas>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class UIChart implements AfterViewInit, OnDestroy {

    @Input() type: string;

    @Input() plugins: any[] = [];

    @Input() width: string;

    @Input() height: string;

    @Input() responsive: boolean = true;

    @Output() onDataSelect: EventEmitter<any> = new EventEmitter();

    initialized: boolean;

    _data: any;

    _options: any = {};

    chart: any;

    constructor(public el: ElementRef) {}

    @Input() get data(): any {
        return this._data;
    }

    set data(val:any) {
        this._data = val;
        this.reinit();
    }

    @Input() get options(): any {
        return this._options;
    }

    set options(val:any) {
        this._options = val;
        this.reinit();
    }

    ngAfterViewInit() {
        this.initChart();
        this.initialized = true;
    }

    onCanvasClick(event) {
        if (this.chart) {
            const element = this.chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
            const dataset = this.chart.getElementsAtEventForMode(event, 'dataset', { intersect: true }, false);

            if (element && element[0] && dataset) {
                this.onDataSelect.emit({originalEvent: event, element: element[0], dataset: dataset});
            }
        }
    }

    initChart() {
        let opts = this.options||{};
        opts.responsive = this.responsive;

        // allows chart to resize in responsive mode
        if (opts.responsive&&(this.height||this.width)) {
            opts.maintainAspectRatio = false;
        }

        import('chart.js/auto').then((module) => {
            if (module && module.default) {
                this.chart = new module.default(this.el.nativeElement.children[0].children[0], {
                    type: this.type,
                    data: this.data,
                    options: this.options
                });
            }
        });
    }

    getCanvas() {
        return this.el.nativeElement.children[0].children[0];
    }

    getBase64Image() {
        return this.chart.toBase64Image();
    }

    generateLegend() {
        if (this.chart) {
            return this.chart.generateLegend();
        }
    }

    refresh() {
        if (this.chart) {
            this.chart.update();
        }
    }

    reinit() {
        if (this.chart) {
            this.chart.destroy();
            this.initChart();
        }
    }

    ngOnDestroy() {
        if (this.chart) {
            this.chart.destroy();
            this.initialized = false;
            this.chart = null;
        }
    }
}

@NgModule({
    imports: [CommonModule],
    exports: [UIChart],
    declarations: [UIChart]
})
export class ChartModule { }
