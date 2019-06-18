//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SearchService } from '../../../services/search.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  page: any;
  fromPage: number;
  searchTerm: any;
  tabLink: any = [];
  paginationCheck: boolean;
  @Output() queryEvent = new EventEmitter<string>();
  @Input() responseData: any [];
  input: any;

  constructor( private searchService: SearchService, private route: ActivatedRoute, private router: Router ) {
    this.searchTerm = this.route.snapshot.params.input;
   }

  ngOnInit() {
    // If searchTerm is undefined, route doesn't work
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }
    this.page = this.searchService.pageNumber;

    // Subscribe to route input parameter
    this.input = this.route.params.subscribe(params => {
      const term = params.input;
      this.searchTerm = term;
      this.page = params.page;
      this.tabLink = params.tab;
      this.searchService.getInput(this.searchTerm);
    });

    // Check if http request is POST or GET
    this.paginationCheck = this.searchService.requestCheck;

    // Reset pagination
    this.page = this.searchService.pageNumber;

    // Pagination number
    this.fromPage = this.page * 10 - 10;
  }

  nextPage() {
    this.page++;
    this.fromPage = this.page * 10 - 10;
    // Send to search service
    this.searchService.getPageNumber(this.page);
    this.searchTerm = this.route.snapshot.params.input;
    // If searchTerm is undefined, route doesn't work
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }
    this.router.navigate(['results/', this.tabLink, this.searchTerm], { queryParams: { page: this.page } });
    this.paginationCheck = true;
  }

  previousPage() {
    this.page--;
    this.fromPage = this.fromPage - 10;
    this.searchService.getPageNumber(this.page);
    this.searchTerm = this.route.snapshot.params.input;
    // If searchTerm is undefined, route doesn't work
    if (this.searchTerm === undefined) {
      this.searchTerm = '';
    }
    this.router.navigate(['results/', this.tabLink, this.searchTerm], { queryParams: { page: this.page } });
    this.paginationCheck = true;
  }

}
