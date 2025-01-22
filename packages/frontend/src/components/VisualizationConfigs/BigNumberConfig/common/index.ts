import { CompactConfigMap } from '@clairdash/common';

export const StyleOptions = [
    { value: '', label: 'None' },
    ...Object.values(CompactConfigMap).map(({ compact, label }) => ({
        value: compact,
        label,
    })),
];
