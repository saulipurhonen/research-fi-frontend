import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-figure-filters',
  templateUrl: './figure-filters.component.html',
  styleUrls: ['./figure-filters.component.scss']
})
export class FigureFiltersComponent implements OnInit, OnChanges {
  @Output() clicked = new EventEmitter<boolean>();
  @Output() filterData = new EventEmitter<boolean>();
  @Input() filter: any;
  filterHasBeenClicked: boolean;

  filters = [
    {label: $localize`:@@showAll:Näytä kaikki`, filter: 'all'},
    {label: $localize`:@@showOnlyTKIfilter:Näytä vain TKI-tiekartan seurantamittarit`,
      info: $localize`:@@roadMapFilterInfo:Kansallinen tutkimuksen, kehittämisen ja innovaatioiden tiekartta <a href="https://minedu.fi/tki-tiekartta" target="_blank" class='external'>https://minedu.fi/tki-tiekartta <i class='fas fa-external-link-alt'></i></a>`,
      filter: 'roadmap'},
  ];

  constructor(private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.cdr.detectChanges();
  }

  // Navigate with params
  navigate(target) {
    this.filterHasBeenClicked = true;
    this.clicked.emit(true);
    this.router.navigate([], {queryParams: {filter: target}});
  }
}