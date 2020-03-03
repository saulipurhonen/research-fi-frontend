//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ElementRef, ViewChild, OnDestroy, Inject, TemplateRef, LOCALE_ID } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../../services/single-item.service';
import { map } from 'rxjs/operators';
import { SearchService } from '../../../services/search.service';
import { SettingsService } from '../../../services/settings.service';
import { TabChangeService } from '../../../services/tab-change.service';
import { StaticDataService } from '../../../services/static-data.service';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import { faQuoteRight } from '@fortawesome/free-solid-svg-icons';
import { HttpHeaders } from '@angular/common/http';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-single-publication',
  templateUrl: './single-publication.component.html',
  styleUrls: ['./single-publication.component.scss']
})
export class SinglePublicationComponent implements OnInit, OnDestroy {
  public singleId: any;
  responseData: any [];
  searchTerm: string;
  pageNumber: any;
  tab = 'publications';
  tabQueryParams: any;

  infoFields = [
    // {label: 'Julkaisun nimi', field: 'publicationName'},
    {label: 'Julkaisuvuosi', field: 'publicationYear'},
    {label: 'Julkaisutyyppi', field: 'publicationTypeCode', typeLabel: ' '},
    {label: 'Tekijät', field: 'authorsText'}
  ];

  authorFields = [
    {label: 'Tekijöiden määrä', field: 'author[0].nameFiSector'}
  ];

  authorAndOrganization = [];

  organizationSubFields = [
    {label: 'Organisaatio', field: 'publicationOrgUnits'}
  ];

  mediumFields = [
    {label: 'Lehti', field: 'journalName', link: true, linkPath: '/results/publications/' /*, lang: true */},
    {label: 'Emojulkaisun nimi', field: 'parentPublicationName', link: true, linkPath: '/results/publications/'},
    {label: 'Konferenssi', field: 'conferenceName', link: true, linkPath: '/results/publications/' /*, lang: true */},
    {label: 'Kustantaja', field: 'publisherName', link: true, linkPath: '/results/publications/' /*, lang: true */},
    {label: 'Volyymi', field: 'volume', link: false},
    {label: 'Numero', field: 'issueNumber', link: false},
    {label: 'Sivut', field: 'pageNumberText', link: false},
    {label: 'ISSN', field: 'issn', link: true, linkPath: '/results/publications/'},
    {label: 'ISBN', field: 'isbn', link: true, linkPath: '/results/publications/'},
    // \u00AD soft hyphen, break word here if needed
    {label: 'Julkaisu\u00ADfoorumi', field: 'jufoCode', link: true, linkPath: 'https://www.tsv.fi/julkaisufoorumi/haku.php?issn='},
    {label: 'Julkaisu\u00ADfoorumitaso', field: 'jufoClassCode', link: true, linkPath: '/results/publications?page=1&juFo='},
  ];

  linksFields = [
    {label: 'DOI', field: 'doi', path: 'https://doi.org/'},
    {label: 'Pysyvä osoite', field: 'doiHandle'},
    {label: 'Rinnakkaistallennus', field: 'selfArchivedAddress'},
  ];

  otherFields  = [
    {label: 'Tieteenalat', field: 'fieldsOfScience'},
    {label: 'Avoin saatavuus', field: 'openAccessCode'},
    {label: 'Julkaisumaa', field: 'countries'},
    {label: 'Kieli', field: 'languages'},
    {label: 'Kansainvälinen yhteisjulkaisu', field: 'internationalCollaboration'},
    {label: 'Yhteisjulkaisu yrityksen kanssa', field: 'businessCollaboration'},
    {label: 'Avainsanat', field: 'keywords'}
  ];

  citationStyles = [
    {label: 'APA', cslStyle: 'apa'},
    {label: 'Chicago', cslStyle: 'chicago-author-date'},
    {label: 'MLA', cslStyle: 'mla'}
  ];

  documentLang = this.document.documentElement.lang;

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;
  juFoCode: any;

  faQuoteRight = faQuoteRight;
  faIcon = faFileAlt;
  publicationType: any;
  publicationTypeLabel: string;
  showSubUnits = false;
  hasSubUnits: boolean;

  citations = [];
  hasDoi = false;
  modalRef: BsModalRef;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, public searchService: SearchService,
               private titleService: Title, private tabChangeService: TabChangeService, @Inject(DOCUMENT) private document: any,
               private settingsService: SettingsService, private staticDataService: StaticDataService,
               private modalService: BsModalService, public utilityService: UtilityService, @Inject(LOCALE_ID) private localeId ) {
                 // Capitalize first letter of locale
                 this.localeId = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
   }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.singleService.currentId.subscribe(id => this.getData(id));
    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.pageNumber = this.searchService.pageNumber || 1;
    this.tabQueryParams = this.tabChangeService.tabQueryParams.publications;
    this.searchTerm = this.searchService.singleInput;
  }

  ngOnDestroy() {
    this.idSub.unsubscribe();
  }

  openModal(template: TemplateRef<any>) {
    // Get the citations if they aren't loaded yet
    if (this.citations.length < this.citationStyles.length) {
      this.getCitations();
    }
    this.modalRef = this.modalService.show(template);
  }

  closeModal() {
    this.modalRef.hide();
  }

  getCitations() {
    const source = this.responseData[0].hits.hits[0]._source;
    // Check if the doi exists (the field is filtered on init if it doesn't)
    const doi = this.linksFields.filter(x => x.label === 'DOI').shift();
    // Flag needed for template
    this.hasDoi = !!doi;
    // tslint:disable-next-line: curly
    if (!this.hasDoi) return;
    const doiUrl = source.doi;
    const url = doi.path + doiUrl;

    this.citationStyles.forEach(style => {
      const options = {
        headers: new HttpHeaders({
          Accept: 'text/x-bibliography; style=' + style.cslStyle
        }),
        responseType: 'text'
      };
      this.searchService.getFromUrl(url, options).subscribe(res => {
        this.citations.push(res);
      });
    });
  }

  getData(id: string) {
    this.singleService.getSinglePublication(id)
    .pipe(map(responseData => [responseData]))
    .subscribe(responseData => {
      this.responseData = responseData;
      if (this.responseData[0].hits.hits[0]) {
        this.setTitle(this.responseData[0].hits.hits[0]._source.publicationName + ' - Julkaisut - Haku - Tutkimustietovaranto');
        this.srHeader.nativeElement.innerHTML = this.titleService.getTitle().split(' - ', 1);
        // juFoCode is used for exact search
        this.juFoCode = this.responseData[0].hits.hits[0]._source.jufoCode;
        this.shapeData();
        this.filterData();
      }
    },
      error => this.errorMessage = error as any);
  }

  filterData() {
    // Helper function to check if the field exists and has data
    const checkEmpty = (item: {field: string} ) =>  {
      return this.responseData[0].hits.hits[0]._source[item.field] !== '-1' &&
             this.responseData[0].hits.hits[0]._source[item.field] !== undefined &&
             this.responseData[0].hits.hits[0]._source[item.field] !== 'undefined' &&
             this.responseData[0].hits.hits[0]._source[item.field].length !== 0 &&
             JSON.stringify(this.responseData[0].hits.hits[0]._source[item.field]) !== '["undefined"]' &&
             this.responseData[0].hits.hits[0]._source[item.field] !== ' ';
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter(item => checkEmpty(item));
    this.authorFields = this.authorFields.filter(item => checkEmpty(item));
    this.organizationSubFields = this.organizationSubFields.filter(item => checkEmpty(item));
    this.mediumFields = this.mediumFields.filter(item => checkEmpty(item));
    this.linksFields = this.linksFields.filter(item => checkEmpty(item));
    this.otherFields = this.otherFields.filter(item => checkEmpty(item));
  }

  shapeData() {
    const source = this.responseData[0].hits.hits[0]._source;
    const fieldsOfScience = source.fields_of_science;
    const countries = source.countries;
    const languages = source.languages;
    const keywords = source.keywords;
    const author = source.author;
    // const subUnits = source.publicationOrgUnits;
    const selfArchived = source.selfArchivedData;

    if (fieldsOfScience && fieldsOfScience.length > 0) {
      // Remove fields where ID is 0. ToDo: Recheck when document with more than one field of science is found
      for (const [i, item] of fieldsOfScience.entries()) {
        if ( item.fieldIdScience === 0) {
          fieldsOfScience.splice(i, 1);
        }
      }
      source.fieldsOfScience = fieldsOfScience.map(x => x.nameFiScience.trim()).join(', ');
    }

    if (countries && countries.length > 0) {
      const key = 'country' + this.localeId;
      source.countries = countries.map(x => x[key]);
    }

    if (languages && languages.length > 0) {
      const key = 'language' + this.localeId;
      source.languages = languages.map(x => x[key]);
    }

    if (keywords && keywords.length > 0) {
      source.keywords = keywords.map(x => x.keyword.trim()).join(', ');
    }

    // if (subUnits && subUnits.length > 0) {
    //   source.publicationOrgUnits = subUnits.map(x => x.organizationUnitNameFi.trim()).join(', ');
    // }

    // Extract self archived address from selfArchivedData array
    if (selfArchived && selfArchived.length > 1) {
      source.selfArchivedAddress = selfArchived[0].selfArchived[0].selfArchivedAddress;
    }

    // Get authors per organization
    if (author && author.length > 0) {
      author.forEach(org => {
        const authorArr = [];
        org.organization[0].organizationUnit.forEach(subUnit => {
          subUnit.person.forEach(person => {
            // Add author if name is available
            if ((person.authorLastName + ' ' + person.authorFirstNames).trim().length > 0) {
              authorArr.push({
                author: (person.authorLastName + ' ' + person.authorFirstNames).trim(),
                orcid: person.authorOrcid.length > 10 ? person.authorOrcid : false,
                subUnit: subUnit.organizationUnitNameFi
              });
            }
          });
        });
        this.authorAndOrganization.push({orgName: org.organization[0].OrganizationNameFi.trim(), orgId: org.organization[0].organizationId,
          authors: authorArr});
      });
      // Default subUnits checks to false and check if any authors have sub units. Show button if sub units
      this.hasSubUnits = false;
      this.authorAndOrganization[0].authors.forEach(item => {
        if (item.subUnit !== ' ') {this.hasSubUnits = true; }
      });
    }

    source.internationalCollaboration = source.internationalCollaboration ? 'Kyllä' : 'Ei';
    source.businessCollaboration = source.businessCollaboration ? 'Kyllä' : 'Ei';
    // Open Access can be added from multiple fields
    if ((source.openAccessCode === 1 || source.openAccessCode === 2) || source.selfArchivedCode === 1) {
      source.openAccessCode = 'Kyllä';
    } else if (source.openAccessCode === 0  && source.selfArchivedCode === 0) {
      source.openAccessCode = 'Ei';
    } else {
      source.openAccessCode = 'Ei tietoa';
    }

    // Get & set publication type label
    this.publicationType = this.staticDataService.publicationClass.find(val => val.class === source.publicationTypeCode.slice(0, 1));
    this.publicationTypeLabel = this.publicationType.label;
  }

  navigate(field) {
    this.settingsService.strictFields(field);
  }
}
