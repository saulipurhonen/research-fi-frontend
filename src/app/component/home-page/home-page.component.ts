//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { map } from 'rxjs/operators';
import { SearchBarComponent } from '../search-bar/search-bar.component';

@Component({
  providers: [SearchBarComponent],
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  allData: any [];
  publicationData: any [];
  personData: any [];
  fundingData: any [];
  errorMessage = [];
  status = false;
  myOps = {
    duration: 0.5
  };

  constructor( private searchService: SearchService, private searchBar: SearchBarComponent, private titleService: Title ) {
  }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit() {
    // Set title
    this.setTitle('Etusivu - Tutkimustietovaranto');

    // Get data for count ups
    this.getAllData();

    // Reset local storage
    localStorage.removeItem('Pagenumber');
    localStorage.setItem('Pagenumber', JSON.stringify(1));
  }

  getAllData() {
    this.searchService.getAll()
    .pipe(map(allData => [allData]))
    .subscribe(allData => this.allData = allData,
      error => this.errorMessage = error as any);
  }

}
