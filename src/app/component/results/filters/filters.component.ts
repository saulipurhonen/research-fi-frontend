//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, OnDestroy, Input, OnChanges, ViewChildren, QueryList,
  ChangeDetectorRef, Inject, TemplateRef, AfterContentChecked } from '@angular/core';
import { MatSelectionList, MatListOption } from '@angular/material/list';
import { Router, ActivatedRoute } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { ResizeService } from '../../../services/resize.service';
import { FilterService } from '../../../services/filter.service';
import { Subscription } from 'rxjs';
import { WINDOW } from 'src/app/services/window.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UtilityService } from 'src/app/services/utility.service';

import { PublicationFilters } from './publications';
import { PersonFilters } from './persons';
import { FundingFilters } from './fundings';
import { InfrastructureFilters } from './infrastructures';
import { OrganizationFilters } from './organizations';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit, OnDestroy, OnChanges, AfterContentChecked {
  @Input() responseData: any [];
  @Input() tabData: string;
  @ViewChildren('subFilterSelect') subFilterSelect: QueryList<MatSelectionList>;

  currentFilter: any[];
  currentSingleFilter: any[];
  panelOpenState: boolean;
  parentPanel: string;
  subPanel: string;
  expandStatus: Array<boolean> = [];
  height: number;
  clickCount: number;
  preSelection = [];
  filterSub: any;
  resizeSub: any;
  width = this.window.innerWidth;
  mobile = this.width < 992;
  modalRef: BsModalRef;
  selectedFilters: any;
  selectedOptions: string[] = [];
  activeFilters: any;
  queryParamSub: Subscription;
  maxHeight = 135;
  subFilters: MatSelectionList[];
  totalCount = 0;
  faSlidersH = faSlidersH;
  panelHeight = 'auto';
  panelArr = [];

  constructor( private cdr: ChangeDetectorRef, private router: Router, private filterService: FilterService,
               private resizeService: ResizeService, @Inject(WINDOW) private window: Window, private modalService: BsModalService,
               private route: ActivatedRoute, private utilityService: UtilityService, private sortService: SortService,
               private publicationFilters: PublicationFilters, private personFilters: PersonFilters,
               private fundingFilters: FundingFilters, private infrastructureFilters: InfrastructureFilters,
               private organizationFilters: OrganizationFilters ) {
                this.height = 135;
                this.clickCount = 0;
                this.selectedFilters = [];
                }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  closeModal() {
    this.modalRef.hide();
  }

  preventTab(event) {
    UtilityService.preventTab(event);
  }

  preventTabBack(event) {
    UtilityService.preventTabBack(event, this.utilityService.modalOpen);
  }

  ngOnInit() {
    // Subscribe to queryParams
    this.queryParamSub = this.route.queryParams.subscribe(params => {
      this.activeFilters = params;
      // Reset selected filters
      if (Object.entries(this.activeFilters).length === 0) {this.selectedFilters = []; }
    });

    // Switch default open panel by index
    switch (this.tabData) {
      case 'publications': {
        this.parentPanel = 'year';
        break;
      }
      case 'persons': {
        this.parentPanel = '';
        break;
      }
      case 'fundings': {
        this.parentPanel = 'year';
        break;
      }
      case 'infrastructures': {
        this.parentPanel = '';
        break;
      }
      case 'organizations': {
        this.parentPanel = 'sector';
        break;
      }
    }

    // Subscribe to filterService filters
    this.filterSub = this.filterService.filters.subscribe(filters => {
      // Get preselected filters from filterService
      this.preSelection = [];
      // this.internationalCollab = filters.internationalCollaboration.length > 0 ? true : false;
      Object.values(filters).flat().forEach(filter => this.preSelection.push(filter));
    });
    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  ngOnDestroy() {
    this.filterSub.unsubscribe();
    this.resizeSub.unsubscribe();
    this.queryParamSub.unsubscribe();
  }

  onResize(event) {
    this.width = event.width;
    if (this.width >= 992) {
      this.mobile = false;
      // Modal existence check
      // tslint:disable-next-line: no-unused-expression
      this.modalRef && this.closeModal();
    } else {
      this.mobile = true;
    }
  }

  ngAfterContentChecked() {
    // Prevents ExpressionChangedAfterItHasBeenCheckedError
    this.selectedOptions = this.selectedOptions;
    this.cdr.detectChanges();
  }

  ngOnChanges() {
    // Initialize data and set filter data by index
    this.responseData = this.responseData || [];
    if (this.responseData.length > 0) {

      // Set filters and shape data
      switch (this.tabData) {
        case 'publications': {
          this.currentFilter = this.publicationFilters.filterData;
          this.currentSingleFilter = this.publicationFilters.singleFilterData;
          this.publicationFilters.shapeData(this.responseData);
          break;
        }
        case 'persons': {
          this.currentFilter = this.personFilters.filterData;
          this.currentSingleFilter = this.personFilters.singleFilterData;
          this.personFilters.shapeData(this.responseData);
          break;
        }
        case 'fundings': {
          this.currentFilter = this.fundingFilters.filterData;
          this.currentSingleFilter = this.fundingFilters.singleFilterData;
          this.fundingFilters.shapeData(this.responseData);
          break;
        }
        case 'infrastructures': {
          this.currentFilter = this.infrastructureFilters.filterData;
          this.currentSingleFilter = this.infrastructureFilters.singleFilterData;
          this.infrastructureFilters.shapeData(this.responseData);
          break;
        }
        case 'organizations': {
          this.currentFilter = this.organizationFilters.filterData;
          this.currentSingleFilter = this.organizationFilters.singleFilterData;
          this.organizationFilters.shapeData(this.responseData);
          break;
        }
      }
    }
    this.cdr.detectChanges();
  }

  // Navigate
  selectionChange(filter, key) {
    // Key comes as an array from selectAll method, single selects are strings
    if (Array.isArray(key)) {
      this.selectedFilters[filter] = key;
      // this.selectedFilters[filter].length > 0 ? this.selectedFilters[filter].concat(key)
    } else {
      // Filters cause problems if different data types
      key = key.toString();
      // Transform single active filter into array
      if (this.activeFilters[filter] && !Array.isArray(this.activeFilters[filter])) {
        const transformed = [];
        transformed[filter] = [this.activeFilters[filter]];
        this.activeFilters = transformed;
        this.selectedFilters = this.activeFilters;
      }

      // Merge selection with active filters
      if (this.activeFilters[filter]) {
        const combined = this.activeFilters[filter].concat(this.selectedFilters[filter] ? this.selectedFilters[filter] : []);
        this.selectedFilters[filter] = [...new Set(combined)];
      }

      // Remove filter if selection exists
      if (this.selectedFilters[filter] && this.selectedFilters[filter].includes(key)) {
        this.selectedFilters[filter].splice(this.selectedFilters[filter].indexOf(key), 1);
      } else {
        // Add new filter
        if (this.selectedFilters[filter] && this.selectedFilters[filter].length > 0) {
          this.selectedFilters[filter].push(key);
        } else {
          this.selectedFilters[filter] = [key];
        }
      }
    }
    // Set sort and page
    this.selectedFilters.sort = this.sortService.sortMethod;
    this.selectedFilters.page = 1;

    this.router.navigate([],
      { queryParams: this.selectedFilters,
        queryParamsHandling: 'merge'
      });
  }

  selectAll(event, filter, subFilter) {
    const index = event.source.value;
    const arr = this.subFilterSelect.toArray();
    const itemArr = [];
    // Push filter items into array, this is used to remove filters from active
    subFilter.subData.forEach(item => {
      itemArr.push(item.key);
    });

    const options = [];
    let result = [];
    switch (event.checked) {
      case true: {
        arr[index].selectAll();
        arr[index].options.forEach(option => {
          options.push(option.value);
        });
        // Merge selected with active filters
        result = this.activeFilters[filter] ? this.activeFilters[filter].concat(options) : options;
        break;
      }
      case false: {
        arr[index].deselectAll();
        // Remove deselected filters
        result = this.activeFilters[filter].filter(val => !itemArr.includes(val));
        break;
      }
    }
    // Pass selection
    this.selectionChange(filter, result);
  }

  panelStatus(parent) {
    this.panelArr[parent] = !this.panelArr[parent];
  }

  setOpenStatus(parent) {
    this.currentFilter.find(item => item.field === parent).open = true;
  }

  closePanel(parent) {
    this.currentFilter.find(item => item.field === parent).open = false;
  }

  resetHeight() {
    this.height = this.maxHeight;
    this.clickCount = 0;
  }

  showMore(total) {
    this.clickCount++;
    total = total - 5 * this.clickCount;
    this.height = total < 5 ? this.height + total * 48 : this.height = this.height * 2;
  }


}
