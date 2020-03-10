import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { isDigit } from '../../../utils/timepicker.utils';
import { TimeUnit } from '../../../models/time-unit.enum';
import { TimeParserPipe } from '../../../pipes/time-parser.pipe';

@Component({
    selector: 'ngx-timepicker-time-control',
    templateUrl: './ngx-timepicker-time-control.component.html',
    styleUrls: ['./ngx-timepicker-time-control.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TimeParserPipe]
})

export class NgxTimepickerTimeControlComponent implements OnChanges {

    @Input() time: number;
    @Input() min: number;
    @Input() max: number;
    @Input() increment: number;
    @Input() placeholder: string;
    @Input() timeUnit: TimeUnit;
    @Input() disabled: boolean;
    @Input() isDefaultTimeSet: boolean;

    @Output() timeChanged = new EventEmitter<number>();

    isFocused: boolean;

    private previousTime: number;

    constructor(private timeParser: TimeParserPipe) {
        this.increment = this.increment ? this.increment : 1;
    }


    ngOnChanges(changes: SimpleChanges): void {
        const timeChanges = changes['time'];
        const isTimeNotProvided = timeChanges && timeChanges.isFirstChange() && !this.isDefaultTimeSet;

        if (isTimeNotProvided) {
            this.time = null;
        }
    }

    onKeydown(event: any): void {
        if (!isDigit(event)) {
            event.preventDefault();
        }

        const time = concatTime(String(this.time), event.key);

        this.changeTimeIfValid(time);

        switch (event.key) {
            case 'ArrowUp':
                this.increase();
                break;
            case 'ArrowDown':
                this.decrease();
                break;
        }
    }

    increase(): void {
        if (!this.disabled) {
            let nextTime = +this.time + this.increment;

            if (nextTime > this.max) {
                nextTime = this.min;
            }

            this.timeChanged.emit(nextTime);
        }
    }

    decrease(): void {
        if (!this.disabled) {
            let previousTime = +this.time - this.increment;

            if (previousTime < this.min) {
                previousTime = this.max;
            }

            this.timeChanged.emit(previousTime);
        }
    }

    onFocus(): void {
        this.isFocused = true;
        this.previousTime = this.time;
    }

    onBlur(): void {
        this.isFocused = false;

        if (this.previousTime !== this.time) {
            this.changeTimeIfValid(+this.time);
        }
    }

    onModelChange(value: string): void {
        this.time = +this.timeParser.transform(value, this.timeUnit);
    }

    private changeTimeIfValid(value: number | undefined) {
        if (!isNaN(value)) {
            this.time = value;

            if (this.time > this.max) {
                const timeString = String(value);
                this.time = +timeString[timeString.length - this.increment];
            }

            if (this.time < this.min) {
                this.time = this.min;
            }

            this.timeChanged.emit(this.time);
        }
    }
}

function concatTime(currentTime: string, nextTime: string): number {
    const isNumber = /\d/.test(nextTime);

    if (isNumber) {
        const time = currentTime + nextTime;
        return +time;
    }
}

