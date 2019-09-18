//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StaticDataService {
  majorFieldsOfScience = [
    {id: 1, label: 'Luonnontieteet', checked: false},
    {id: 2, label: 'Tekniikka', checked: false},
    {id: 3, label: 'Lääke- ja yritystieteet', checked: false},
    {id: 4, label: 'Maatalous- ja metsätieteet', checked: false},
    {id: 5, label: 'Yhteiskuntatieteet', checked: false},
    {id: 6, label: 'Humanistiset tieteet', checked: false},
    {id: 9, label: 'Muut tieteet', checked: false}
  ];

  publicationClass = [
    {id: 1, class: 'A', label: 'Vertaisarvioidut tieteelliset artikkelit', types: [
      {type: 'A1', label: 'Kirjoitus tieteellisessä aikakauslehdessä'},
      {type: 'A2', label: 'Kirjan tai muun kokoomateoksen osa'},
      {type: 'A3', label: 'Vertaisarvioimaton artikkeli konferenssijulkaisussa'},
      {type: 'A4', label: 'Artikkeli konferenssijulkaisussa'}
    ],
    checked: false
    },
    {id: 2, class: 'B', label: 'Vertaisarvioimattomat tieteelliset kirjoitukset', types: [
      {type: 'B1', label: 'Alkuperäisartikkeli tieteellisessä aikakauslehdessä'},
      {type: 'B2', label: 'Katsausartikkeli tieteellisessä aikakauslehdessä'},
      {type: 'B3', label: 'Kirjan tai muun kokoomateoksen osa'}
    ],
    checked: false
    },
    {id: 3, class: 'C', label: 'Tieteelliset kirjat (monografiat)', types: [
      {type: 'C1', label: 'Kustannettu tieteellinen erillisteos'},
      {type: 'C2', label: 'Toimitettu kirja, kokoomateos, konferenssijulkaisu tai lehden erikoisnumero'}
    ],
    checked: false
    },
    {id: 4, class: 'D', label: 'Ammattiyhteisölle suunnatut julkaisut', types: [
      {type: 'D1', label: 'Artikkeli ammattilehdessä'},
      {type: 'D2', label: 'Artikkeli ammatillisessa käsi- tai opaskirjassa, ammatillisessa tietojärjestelmässä tai oppikirja-aineisto'},
      {type: 'D3', label: 'Artikkeli ammatillisessa konferenssijulkaisussa'},
      {type: 'D4', label: 'Julkaistu kehittämis- tai tutkimusraportti taikka -selvitys'},
      {type: 'D5', label: 'Oppikirja, ammatillinen käsi- tai opaskirja taikka sanakirja'},
      {type: 'D6', label: 'Toimitettu ammatillinen teos'}
    ],
    checked: false
    },
    {id: 5, class: 'E', label: 'Suurelle yleisölle suunnatut julkaisut', types: [
      {type: 'E1', label: 'Yleistajuinen artikkeli, sanomalehtiartikkeli'},
      {type: 'E2', label: 'Yleistajuinen monografia'},
      {type: 'E3', label: 'Toimitettu yleistajuinen teos'}
    ],
    checked: false
    },
    {id: 6, class: 'F', label: 'Julkinen taiteellinen ja taideteollinen toiminta', types: [
      {type: 'F1', label: 'Erillisjulkaisu'},
      {type: 'F2', label: 'Julkinen taiteellinen teoksen osatoteutus'},
      {type: 'F3', label: 'Ei-taiteellisen julkaisun taiteellinen osa'}
    ],
    checked: false
    },
    {id: 7, class: 'G', label: 'Opinnäytteet', types: [
      {type: 'F1', label: 'Monografiaväitöskirja'},
      {type: 'F2', label: 'Artikkeliväitöskirja'}
    ]}
  ];

  constructor() { }
}
