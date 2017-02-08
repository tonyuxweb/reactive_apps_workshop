import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges} from "@angular/core";
import { Product, WineComSearchResult, WineComService } from "../../services/wineCom.service";
import {FormControl} from "@angular/forms";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Component({
    selector: "wine-search",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="form-group has-feedback" [class.has-success]="control.valid">
            <label for="searchInput" class="col-sm-4 control-label">
                Name (*)
            </label>
            <div class="col-sm-8">
                <input type="text" class="form-control input-lg" id="searchInput" [formControl]="control"
                    autocomplete="off" placeholder="Name"/>
                <span *ngIf="control.valid" class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>
                <ul class="wine-search-results">
                    <li *ngFor="let item of winesToShow$|async" (click)="onSelectWine(item)">
                        <img src="{{item.labels[0].url}}" alt=""/> {{item.name}} 
                    </li>
                </ul>
            </div>
        </div>
    `
})
export class WineSearchContainer implements OnChanges {
    @Input() name: string;
    @Output() selectWine = new EventEmitter<Product>();
    control = new FormControl("");

    private showResults$ = new BehaviorSubject(true);

    private clear$ = this.showResults$.filter(val => !val)
        .map(() => []);

    winesToShow$ = this.control.valueChanges
        .do((value: string) => this.showResults$.next(false)) // user types, hide the results
        .filter(value => value.length > 2)
        .debounceTime(300)
        .switchMap(value => this.wineComService.search(value))
        .map((res: WineComSearchResult) => res.products.list)
        .merge(this.clear$)
        .distinctUntilChanged();

    constructor(private wineComService: WineComService) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.control.setValue(this.name, {emitEvent: false}); // don't call valuechanges again
    }

    onSelectWine(wine: Product): void {
        this.selectWine.emit(wine);
        this.showResults$.next(false);
    }
}