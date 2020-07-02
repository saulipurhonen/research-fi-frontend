// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Injectable } from '@angular/core';
import { Adapter } from './adapter.model';
import { PublicationVisual, PublicationVisualAdapter } from './publication-visual.model';

export interface VisualData {
    key: string,
    doc_count: number,
    data: {
        name: string,
        id?: string;
        doc_count: number,
    }[]
}


export class Visual {
    constructor(
        public publicationData: PublicationVisual,
    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class VisualAdapter implements Adapter<Visual> {
    constructor(private publicationVisualAdapter: PublicationVisualAdapter) {}
    adapt(item: any, tab?: string, categoryIdx?: number): Visual {

        let publicationData: PublicationVisual;

        switch (tab) {
            case 'publications':
                publicationData = this.publicationVisualAdapter.adapt(item, categoryIdx);
                break;
        }


        return new Visual(
            publicationData,
        );
    }
}