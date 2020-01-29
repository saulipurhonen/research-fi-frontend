//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable  } from '@angular/core';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root'
})
export class SortService {
  sortMethod: string;
  currentTab: string;
  sort: any;
  yearField: string;
  sortColumn: string;
  sortDirection: boolean;
  searchTerm = '';

  constructor() { }

  // If term is available, default sort changes
  getTerm(term) {
    this.searchTerm = term;
  }

  // Get sort method
  updateSort(sortBy: string) {
    this.sortMethod = sortBy;
    this.updateSortParam(this.sortMethod, this.currentTab);
  }

  updateTab(tab: string) {
    this.currentTab = tab;
    this.updateSortParam(this.sortMethod, this.currentTab);
  }

  updateSortAndTab(sort: string, tab: string) {
    this.sortMethod = sort;
    this.currentTab = tab;
    this.updateSortParam(this.sortMethod, this.currentTab);
  }

  sortBy(sortBy: string, activeSort: string) {
    this.sortColumn = sortBy;
    this.sortDirection = sortBy === activeSort;
    return [this.sortColumn, this.sortDirection];
  }

  initSort(sort: string) {
    this.sortDirection = sort.slice(-4) === 'Desc';
    this.sortColumn = this.sortDirection ? sort.slice(0, -4) : sort;
  }

  private updateSortParam(sort: string, tab: string) {
    this.currentTab = tab;
    this.sortMethod = sort;
    this.initSort(sort || '');
    switch (this.currentTab) {
      case 'publications': {
        this.yearField = 'publicationYear';

        switch (this.sortColumn) {
          case 'name': {
            this.sort = [{'publicationName.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'author': {
            this.sort = [{'authorsText.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'medium': {
            this.sort = [{'journalName.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'year': {
            this.sort = [{publicationYear: {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          default: {
            this.sort = [
              {publicationYear: {order: this.sortDirection ? 'desc' : 'desc', unmapped_type : 'long'}},
              ...(this.searchTerm.length > 0 ?
                [{'publicationName.keyword': {order: this.sortDirection ? 'asc' : 'asc', unmapped_type : 'long'}}] : [])
            ];
            break;
          }
        }
        break;
      }
      case 'persons': {
        this.yearField = 'publicationYear'; // Change this according to index
        break;
      }
      case 'organizations': {
        this.yearField = 'publicationYear'; // Change this according to index
        switch (this.sortColumn) {
          case 'name': {
            this.sort = [{'nameFi.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'sector': {
            this.sort = [{'sectorNameFi.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          default: {
            this.sort = [];
            break;
          }
        }
        break;
      }
      case 'fundings': {
        this.yearField = 'fundingStartYear';
        switch (this.sortColumn) {
          case 'name': {
            this.sort = [{'projectNameFi.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'funder': {
            this.sort = [{'funderNameFi.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'funded': {
            this.sort = [{'fundedNameFi.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          case 'year': {
            this.sort = [{fundingStartYear: {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
            break;
          }
          default: {
            this.sort = [
              {fundingStartYear: {order: this.sortDirection ? 'desc' : 'desc', unmapped_type : 'long'}},
              ...(this.searchTerm.length > 0 ?
                [{'projectNameFi.keyword': {order: this.sortDirection ? 'asc' : 'asc', unmapped_type : 'long'}}] : [])
            ];
            break;
          }
        }
        break;
      }
    }
    return this.sort;
  }

}
