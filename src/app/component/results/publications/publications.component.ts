//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SortService } from '../../../services/sort.service';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit, OnDestroy {
  @Input() resultData: any [];
  expandStatus: Array<boolean> = [];
  sortColumn: string;
  sortDirection: boolean;

  faIcon = this.tabChangeService.tabData.filter(t => t.data === 'publications').map(t => t.icon).pop();
  documentLang: any;
  input: string;
  inputSub: any;

  constructor(private router: Router, private route: ActivatedRoute, private sortService: SortService,
              @Inject(DOCUMENT) private document: any, private tabChangeService: TabChangeService,
              private searchService: SearchService) {
                this.documentLang = this.document.documentElement.lang;
               }

  ngOnInit() {
    // Check url for sorting, default to empty
    this.sortService.initSort(this.route.snapshot.queryParams.sort || '');
    this.sortColumn = this.sortService.sortColumn;
    this.sortDirection = this.sortService.sortDirection;
    this.inputSub = this.searchService.currentInput.subscribe(input => {
      this.input = input;
    });
  }

  isReviewed(type: string) {
    if (!type) {return false; }
    return type[0] === 'A' || type[0] === 'C';
  }

  getOALink(publication) {
    if (publication.link) { return publication.link; }
    const fields = ['selfArchivedData.selfArchived.selfArchivedAddress', 'selfArchivedData.preprint.preprintAddress',
    'doi', 'doiHandle'];
    let link = '';
    for (const field of fields) {
      const test = publication[field];
      if (test && test.trim() !== '') {
        link = (field === 'doi' ? 'https://doi.org/' : '') + test;
        break;
      }
    }
    publication.link = link;
    return link;
  }

  sortBy(sortBy) {
    const activeSort = this.route.snapshot.queryParams.sort || '';
    const [sortColumn, sortDirection] = this.sortService.sortBy(sortBy, activeSort);
    let newSort = sortColumn + (sortDirection ? 'Desc' : '');
    // Reset sort
    if (activeSort.slice(-4) === 'Desc') { newSort = ''; }


    this.router.navigate([],
      {
        relativeTo: this.route,
        queryParams: { sort: newSort },
        queryParamsHandling: 'merge'
      }
    );
  }

  ngOnDestroy() {
    this.inputSub.unsubscribe();
  }
}
