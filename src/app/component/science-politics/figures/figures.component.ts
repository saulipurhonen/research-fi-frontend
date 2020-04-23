// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnDestroy,
         LOCALE_ID } from '@angular/core';
import { faInfoCircle, faSearch, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { DOCUMENT } from '@angular/common';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SearchService } from 'src/app/services/search.service';
import { Title } from '@angular/platform-browser';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-figures',
  templateUrl: './figures.component.html',
  styleUrls: ['./figures.component.scss']
})
export class FiguresComponent implements OnInit, AfterViewInit, OnDestroy {
  faIconCircle = faInfoCircle;
  faSearch = faSearch;
  faChartBar = faChartBar;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  navItems = [
    {id: 's1', labelFi: 'Tiede ja tutkimus lukuina', icon: this.faIconCircle, active: true},
    {id: 's2', labelFi: 'Tutkimuksen rahoitus', icon: this.faChartBar, active: false},
    {id: 's3', labelFi: 'Tutkimuksen henkilövoimavarat', icon: this.faChartBar, active: false},
    {id: 's4', labelFi: 'Julkaisutoiminta ja tieteellinen vaikuttavuus', icon: this.faChartBar, active: false},
  ];

  coLink = [
    {labelFi: 'Suomen Akatemia'},
    {labelFi: 'Tilastokeskus'},
    {labelFi: 'Vipunen'},
  ];

  allContent: any;

  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  link = 'test';
  currentSection: any;
  queryField: FormControl = new FormControl();
  queryResults: any[];
  combinedData: any;
  hasResults: boolean;
  queryTerm: any;
  @ViewChild('mainContent') mainContent: ElementRef;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  @ViewChild('searchInput') searchInput: ElementRef;
  dataSub: Subscription;
  resizeSub: Subscription;
  mobile: boolean;
  showMenu: boolean;
  focusSub: any;

  constructor( @Inject(DOCUMENT) private document: any, private cdr: ChangeDetectorRef, private searchService: SearchService,
               private titleService: Title, @Inject( LOCALE_ID ) protected localeId: string, private tabChangeService: TabChangeService,
               private resizeService: ResizeService ) {
    // Default to first segment
    this.currentSection = 's1';
    this.queryResults = [];
    this.queryTerm = '';
    this.hasResults = true;
   }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit(): void {
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Tiede ja tutkimus lukuina - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        // Todo: Translate
        this.setTitle('Tiede ja tutkimus lukuina - Research.fi');
        break;
      }
    }

    this.resizeSub = this.resizeService.onResize$.subscribe(_ => this.onResize());

    // Get data from assets
    this.dataSub = this.searchService.getFigures().pipe(map(data => data)).subscribe(data => {
      const key = 'content';
      this.allContent = data[key];
      const combined = [];
      // Combine all items
      this.allContent.forEach(segment => combined.push(segment.items));
      this.combinedData = [].concat.apply([], combined);
      // Subscribe to input changes
      this.queryField.valueChanges.pipe(
        distinctUntilChanged()
        )
        .subscribe(term => {
          this.queryTerm = term;
          this.queryResults = term.length > 0 ? this.combinedData.filter(item =>
            item.labelFi.toLowerCase().includes(term.toLowerCase())) : [];
          // Set results flag, used to show right template
          this.hasResults = this.queryResults.length === 0 && term.length > 0 ? false : true;
          // Highlight side nav item
          this.currentSection = this.queryResults.length > 0 ? '' : 's1';
      });
    });

  }

  ngAfterViewInit() {
    // Counte content width and set mobile true / false
    this.mobile = this.mainContent.nativeElement.offsetWidth > 991 ? false : true;
    // Show side menu on desktop
    this.showMenu = this.mobile ? false : true;
    this.cdr.detectChanges();

    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'search-input') {
        this.searchInput.nativeElement.focus();
      }
      if (target === 'main-link') {
        this.mainFocus.nativeElement.focus();
      }
    });
  }

  ngOnDestroy() {
    this.dataSub.unsubscribe();
    this.resizeSub.unsubscribe();
    this.tabChangeService.targetFocus('');
  }

  onSectionChange(sectionId: any) {
    this.currentSection = sectionId ? sectionId : 's1';
  }

  onResize() {
    this.mobile = this.mainContent.nativeElement.offsetWidth > 991 ? false : true;
    this.showMenu = this.mobile ? false : true;
  }
}
