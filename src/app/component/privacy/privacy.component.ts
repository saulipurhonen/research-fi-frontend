//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Inject, LOCALE_ID, AfterViewInit, OnDestroy, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PrivacyService } from 'src/app/services/privacy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { privacy, common } from 'src/assets/static-data/meta-tags.json'
import { UtilityService } from 'src/app/services/utility.service';


@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent implements OnInit, AfterViewInit, OnDestroy {
  focusSub: Subscription;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  title: string;
  locale: string;
  matomoUrl: string;
  consentStatus: string;
  consentStatusSub: any;
  routeSub: Subscription;
  selectedIndex: any;

  private currentLocale: string;
  private metaTags = privacy;
  private commonTags = common;



  constructor(private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, private tabChangeService: TabChangeService,
              @Inject(DOCUMENT) private document: any, @Inject(PLATFORM_ID) private platformId: object,
              private privacyService: PrivacyService, private snackBar: MatSnackBar, private route: ActivatedRoute,
              private router: Router, private utilityService: UtilityService) {
    this.locale = localeId;
    this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
    this.matomoUrl = 'https://rihmatomo-analytics.csc.fi/index.php?module=CoreAdminHome&action=optOut&language=' +
                      this.locale + '&backgroundColor=&fontColor=&fontSize=&fontFamily=Roboto, sans-serif';
   }

  ngOnInit(): void {
    // Open tab
    this.routeSub = this.route.params.subscribe(param => {
      this.selectedIndex = param.tab || 0;
    });

    this.utilityService.addMeta(this.metaTags['title' + this.currentLocale],
                                this.metaTags['description' + this.currentLocale],
                                this.commonTags['imgAlt' + this.currentLocale])


    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Tietosuoja - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle('Privacy - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle('Dataskydd och behandling av personuppgifter - Forskning.fi');
        break;
      }
    }
    // Hide skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(false);

    this.title = this.getTitle();

    // Get consent status
    this.consentStatusSub = this.privacyService.currentConsentStatus.subscribe(status => {
      this.consentStatus = localStorage.getItem('cookieConsent') ? localStorage.getItem('cookieConsent') : status;
    });
  }

  changeConsent(status) {
    switch (status) {
      case 'approved': {
        this.approve();
        break;
      }
      default: {
        this.decline();
      }
    }
    this.privacyService.hideConsentBar(true);
    this.privacyService.changeConsentStatus(status);
  }

  // Add params. Enables linking to tab
  navigate(event) {
    this.router.navigate(['privacy', event.index]);
  }

  decline() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookieConsent', 'declined');
      const node = this.document.createElement('script');
      node.type = 'text/javascript';
      node.innerHTML = `var _paq = window._paq || [];
      _paq.push(['optUserOut']);
      _paq.push(['forgetConsentGiven']);
      `;
      this.document.getElementsByTagName('head')[0].appendChild(node);
    }
    this.snackBar.open($localize`:@@cookiesDenied:Evästeet hylätty`);
  }

  approve() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookieConsent', 'approved');
      const node = this.document.createElement('script');
      node.id = 'matomo-consent';
      node.type = 'text/javascript';
      node.innerHTML = `var _paq = window._paq || [];
      _paq.push(['rememberConsentGiven']);
      `;
      this.document.getElementsByTagName('head')[0].appendChild(node);
    }
    this.snackBar.open($localize`:@@cookiesApproved:Evästeet hyväksytty`);
  }

  setTitle(title: string) {
    this.titleService.setTitle(title);
  }

  getTitle() {
    return this.titleService.getTitle().split('-').shift().trim();
  }

  ngAfterViewInit() {
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'main-link') {
        this.mainFocus.nativeElement.focus();
      }
    });
  }

  ngOnDestroy() {
    // Reset skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(true);
    this.tabChangeService.targetFocus('');
    this.consentStatusSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

}
