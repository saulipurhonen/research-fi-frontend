//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';
import { FilterService } from './filter.service';
import { SortService } from '../sort.service';
import { SettingsService } from '../settings.service';
import { StaticDataService } from '../static-data.service';
import { AggregationService } from '../filters/aggregation.service';
import { LOCALE_ID } from '@angular/core';

describe('FilterService', () => {
    let filterService: FilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                SortService,
                SettingsService,
                StaticDataService,
                AggregationService,
                {provide: LOCALE_ID, useValue: 'fi'}
            ]
        });

        filterService = TestBed.inject(FilterService);
    });

    it('should be created', () => {
        expect(filterService).toBeDefined();
    });

    it('#rangeFilter should work as expected', () => {
        // Empty
        expect(filterService.rangeFilter([], [])).toEqual([]);
        // From
        expect(JSON.stringify(filterService.rangeFilter(['f2005'], []))).toContain('"gte":2005');
        // To
        expect(JSON.stringify(filterService.rangeFilter([], ['t2006']))).toContain('"lte":2006');
        // Both
        expect(JSON.stringify(filterService.rangeFilter(['f2007'], ['t2012']))).toContain('"gte":2007,"lte":2012');
    })

});
