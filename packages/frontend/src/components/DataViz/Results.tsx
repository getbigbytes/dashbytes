import { type RawResultRow, type VizColumn } from '@clairdash/common';

export type ResultsAndColumns = {
    results: RawResultRow[];
    columns: VizColumn[];
};
