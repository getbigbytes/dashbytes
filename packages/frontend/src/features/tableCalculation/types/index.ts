import { type CustomFormat } from '@bigbytes/common';
import { type UseFormReturnType } from '@mantine/form';

type TableCalculationFormInputs = {
    name: string;
    sql: string;
    format: CustomFormat;
};

export type TableCalculationForm = UseFormReturnType<
    TableCalculationFormInputs,
    (values: TableCalculationFormInputs) => TableCalculationFormInputs
>;
