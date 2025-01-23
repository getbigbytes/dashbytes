import { type RawResultRow, type VizColumn } from '@bigbytes/common';

export type ResultsAndColumns = {
    results: RawResultRow[];
    columns: VizColumn[];
};
