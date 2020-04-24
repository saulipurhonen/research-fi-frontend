//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { FilterMethodService } from '../../../services/filter-method.service';
import { StaticDataService } from '../../../services/static-data.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })

export class OrganizationFilters {
  filterData = [
    {field: 'sector', labelFi: 'Organisaatio', hasSubFields: false, limitHeight: false, open: true},
  ];

  singleFilterData = [
    // {field: 'internationalCollaboration', labelFi: 'Kansainvälinen yhteisjulkaisu'}
  ];

  infoData = [
    {id: '1', tooltipFi: 'Yliopistolaissa mainitut 13 yliopistoa sekä Maanpuolustuskorkeakoulu toimittavat tietoja tiedejatutkimus.fi &#8209;palveluun.'},
    {id: '2', tooltipFi: 'OKM:n hallinnonalalle kuuluvat 22 ammattikorkeakoulua sekä Poliisiammattikorkeakoulu toimittavat tietoja tiedejatutkimus.fi &#8209;palveluun.'},
    {id: '3', tooltipFi: 'Eri hallinnonalojen alaiset tutkimuslaitokset, jotka ovat toimittaneet tietoja tiedejatutkimus.fi &#8209;palveluun.'},
    {id: '4', tooltipFi: 'Suomessa on viisi asetuksella säädettyä yliopistollisen sairaalan erityisvastuualuetta. Kaikki toimittavat julkaisutietojaan tiedejatutkimus.fi &#8209;palveluun.'},
    {id: '5', tooltipFi: 'Tutkimusrahoittajat, jotka ovat toimittaneet rahoituspäätösten tietoja tiedejatutkimus.fi &#8209;palveluun.'}
  ];

  constructor( private filterMethodService: FilterMethodService, private staticDataService: StaticDataService) {}

  shapeData(data) {
    const source = data[0].aggregations;
    source.sector.buckets = this.sector(source.sector.buckets);
    source.shaped = true;
    return source;
  }

  sector(data) {
    const result = data.map(item => item = {
      key: item.key,
      label: item.sectorId.buckets[0].key,
      doc_count: item.doc_count,
      tooltipFi: this.infoData.find(el => el.id === item.key).tooltipFi
    });
    return result;
  }


  getSingleAmount(data) {
    if (data.length > 0) {
      return data.filter(x => x.key === 1);
    }
  }
}
