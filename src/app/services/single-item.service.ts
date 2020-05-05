import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Search, SearchAdapter } from '../models/search.model';
import { Subject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SearchService} from './search.service';
import { AppConfigService } from './app-config-service.service';
import { SettingsService } from './settings.service';


@Injectable({
  providedIn: 'root'
})
export class SingleItemService {
  apiUrl: any;
  publicationApiUrl = '';
  fundingApiUrl = '';
  organizationApiUrl = '';
  infrastructureApiUrl = '';
  private getIdSubject = new Subject<string>();
  currentId = this.getIdSubject.asObservable();
  resultId: string;

  constructor( private http: HttpClient, private searchService: SearchService, private appConfigService: AppConfigService,
               private settingsService: SettingsService, private searchAdapter: SearchAdapter ) {
    this.apiUrl = this.appConfigService.apiUrl;
    this.publicationApiUrl = this.apiUrl + 'publication/_search';
    this.fundingApiUrl = this.apiUrl + 'funding/_search';
    this.organizationApiUrl = this.apiUrl + 'organization/_search';
    this.infrastructureApiUrl = this.apiUrl + 'infrastructure/_search';
  }

  updateId(singleId: string) {
    this.resultId = singleId;
    this.getIdSubject.next(singleId);
  }

  constructPayload(field, term) {
    const res = {
      query: {
        match: {
          [field]: term
        }
      },
      size: 1
    };
    return res;
  }

  getSinglePublication(id): Observable<Search> {
    return this.http.post<Search>(this.publicationApiUrl, this.constructPayload('publicationId', id))
                    .pipe(map((data: any) => this.searchAdapter.adapt(data, 'publications')));
  }

  getSingleFunding(id): Observable<Search> {
    return this.http.post<Search>(this.fundingApiUrl, this.constructPayload('projectId', id))
                    .pipe(map((data: any) => this.searchAdapter.adapt(data, 'fundings')));
  }

  getSingleOrganization(id): Observable<Search> {
    return this.http.post<Search>(this.organizationApiUrl, this.constructPayload('organizationId', id))
                    .pipe(map((data: any) => this.searchAdapter.adapt(data, 'organizations')));
  }

  getSingleInfrastructure(id): Observable<Search> {
    return this.http.post<Search>(this.infrastructureApiUrl, this.constructPayload('name', id))
                    .pipe(map((data: any) => this.searchAdapter.adapt(data, 'infrastructures')));
  }

  // Testing purposes only
  getCount(tab, id, filters): Observable<any> {
    id = id || 0;
    let queryOps = {};
    switch (tab) {
      case 'publications': {
        const organizationFilters = []
        filters.organizations?.forEach(value => {
          organizationFilters.push({ term : { organizationId : value } });
        });
        // Use: should: organizationFilters when functionality is specified
        queryOps = {
          query: {
            bool: {
              should: {term: {ORGID: id}}
            }
          }
        };
        break;
      }
      case 'organizations': {
        queryOps = {
          query: {
            bool: {
              should: [
                {nested: {path: 'author', query: {bool: {should: [{term: {'author.organization.organizationId.keyword': id}}]}}}}
              ]
            }
          }
        };
        break;
      }
    }
    const aggs = {
      size: 0,
      aggs: {
        _index: {
          filters: {
            filters: {
              persons: {
                match: {
                  _index: 'person'
                }
              },
              publications: {
                match: {
                  _index: 'publication'
                }
              },
              fundings: {
                match: {
                  _index: 'funding'
                }
              },
              infrastructures: {
                match: {
                  _index: 'infrastructure'
                }
              },
              organizations: {
                match: {
                  _index: 'organization'
                }
              }
            }
          }
        }
      }
    };
    const payLoad = {...queryOps, ...aggs};
    return this.http.post(this.apiUrl + this.settingsService.indexList + this.settingsService.aggsOnly, payLoad);
  }

  joinEntries(field, subField) {
    // Delete empty entries
    field.map(x => (x[subField].trim() === '') && delete x[subField] );
    // Remove empty objects
    const checkedArr = field.filter(value => Object.keys(value).length !== 0);
    return checkedArr.length > 1 ? checkedArr.map(x => x[subField]).trim().join(', ') : checkedArr[0][subField];
  }
}