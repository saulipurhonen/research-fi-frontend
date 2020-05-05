//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  @Input() responseData: any [];
  @Input() tab: any;
  @Input() tabName: any;
  @Input() resultNameField: any;
  @Input() type: any;
  @Input() title: any;
  @Input() queryParams: any;
  resultType: string;
  searchTerm: any;
  pageNumber: number;

  constructor( private searchService: SearchService) {
    this.searchTerm = this.searchService.singleInput;
    this.pageNumber = this.searchService.pageNumber || 1;
  }

  ngOnInit() {
  }
}