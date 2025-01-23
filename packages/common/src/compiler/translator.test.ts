import { SupportedDbtAdapter } from '../types/dbt';
import { attachTypesToModels, convertTable } from './translator';
import {
    DBT_METRIC,
    DBT_METRIC_DERIVED,
    DBT_METRIC_WITH_CUSTOM_SQL,
    DBT_METRIC_WITH_FILTER,
    DBT_METRIC_WITH_SQL_FIELD,
    DBT_V9_METRIC,
    expectedModelWithType,
    BIGBYTES_TABLE_SQL_WHERE,
    BIGBYTES_TABLE_WITHOUT_AUTO_METRICS,
    BIGBYTES_TABLE_WITH_ADDITIONAL_DIMENSIONS,
    BIGBYTES_TABLE_WITH_CUSTOM_TIME_INTERVAL_DIMENSIONS,
    BIGBYTES_TABLE_WITH_DBT_METRICS,
    BIGBYTES_TABLE_WITH_DBT_V9_METRICS,
    BIGBYTES_TABLE_WITH_DEFAULT_TIME_INTERVAL_DIMENSIONS_BIGQUERY,
    BIGBYTES_TABLE_WITH_DEFAULT_TIME_INTERVAL_DIMENSIONS_SNOWFLAKE,
    BIGBYTES_TABLE_WITH_GROUP_BLOCK,
    BIGBYTES_TABLE_WITH_GROUP_LABEL,
    BIGBYTES_TABLE_WITH_METRICS,
    BIGBYTES_TABLE_WITH_OFF_TIME_INTERVAL_DIMENSIONS,
    model,
    MODEL_WITH_ADDITIONAL_DIMENSIONS,
    MODEL_WITH_CUSTOM_TIME_INTERVAL_DIMENSIONS,
    MODEL_WITH_DEFAULT_TIME_INTERVAL_DIMENSIONS,
    MODEL_WITH_GROUPS_BLOCK,
    MODEL_WITH_GROUP_LABEL,
    MODEL_WITH_METRIC,
    MODEL_WITH_NO_METRICS,
    MODEL_WITH_NO_TIME_INTERVAL_DIMENSIONS,
    MODEL_WITH_OFF_BOOLEAN_TIME_INTERVAL_DIMENSIONS,
    MODEL_WITH_OFF_TIME_INTERVAL_DIMENSIONS,
    MODEL_WITH_SQL_FILTER,
    MODEL_WITH_SQL_WHERE,
    MODEL_WITH_WRONG_METRIC,
    MODEL_WITH_WRONG_METRICS,
    warehouseSchema,
    warehouseSchemaWithMissingColumn,
    warehouseSchemaWithMissingTable,
    warehouseSchemaWithUpperCaseColumn,
} from './translator.mock';

describe('attachTypesToModels', () => {
    it('should return models with types', async () => {
        expect(attachTypesToModels([model], warehouseSchema, false)[0]).toEqual(
            expectedModelWithType,
        );
    });
    it('should return models with undefined type when is missing dataset or table or column', async () => {
        expect(attachTypesToModels([model], {}, false)[0]).toEqual(model);
        expect(
            attachTypesToModels(
                [model],
                warehouseSchemaWithMissingTable,
                false,
            )[0],
        ).toEqual(model);
        expect(
            attachTypesToModels(
                [model],
                warehouseSchemaWithMissingColumn,
                false,
            )[0],
        ).toEqual(model);
    });
    it('should throw when is missing dataset or table or column', async () => {
        expect(() => attachTypesToModels([model], {}, true)).toThrowError(
            'Model "myTable" was expected in your target warehouse at "myDatabase.mySchema.myTable". Does the table exist in your target data warehouse?',
        );
        expect(() =>
            attachTypesToModels([model], warehouseSchemaWithMissingTable, true),
        ).toThrowError(
            'Model "myTable" was expected in your target warehouse at "myDatabase.mySchema.myTable". Does the table exist in your target data warehouse?',
        );
        expect(() =>
            attachTypesToModels(
                [model],
                warehouseSchemaWithMissingColumn,
                true,
            ),
        ).toThrowError(
            'Column "myColumnName" from model "myTable" does not exist.\n "myTable.myColumnName" was not found in your target warehouse at myDatabase.mySchema.myTable. Try rerunning dbt to update your warehouse.',
        );
    });
    it('should throw an error when column has wrong case', async () => {
        expect(() =>
            attachTypesToModels(
                [model],
                warehouseSchemaWithUpperCaseColumn,
                true,
            ),
        ).toThrowError(
            'Column "myColumnName" from model "myTable" does not exist.\n "myTable.myColumnName" was not found in your target warehouse at myDatabase.mySchema.myTable. Try rerunning dbt to update your warehouse.',
        );
    });
    it('should match uppercase column names when case-sensitive is false', async () => {
        expect(
            attachTypesToModels(
                [model],
                warehouseSchemaWithUpperCaseColumn,
                true,
                false,
            )[0],
        ).toEqual(expectedModelWithType);
    });
});

describe('convert tables from dbt models', () => {
    it('should convert dbt model without metrics to Bigbytes table without autogenerated metrics', () => {
        expect(
            convertTable(
                SupportedDbtAdapter.BIGQUERY,
                MODEL_WITH_NO_METRICS,
                [],
            ),
        ).toStrictEqual(BIGBYTES_TABLE_WITHOUT_AUTO_METRICS);
    });
    it('should convert dbt model with dbt metrics', () => {
        expect(
            convertTable(SupportedDbtAdapter.BIGQUERY, MODEL_WITH_NO_METRICS, [
                DBT_METRIC,
                DBT_METRIC_WITH_SQL_FIELD,
                DBT_METRIC_WITH_CUSTOM_SQL,
                DBT_METRIC_WITH_FILTER,
                DBT_METRIC_DERIVED,
            ]),
        ).toStrictEqual(BIGBYTES_TABLE_WITH_DBT_METRICS);
        // dbt 1.5 metrics
        expect(
            convertTable(SupportedDbtAdapter.BIGQUERY, MODEL_WITH_NO_METRICS, [
                DBT_V9_METRIC,
            ]),
        ).toStrictEqual(BIGBYTES_TABLE_WITH_DBT_V9_METRICS);
    });
    it('should convert dbt model with metrics in meta', () => {
        expect(
            convertTable(SupportedDbtAdapter.BIGQUERY, MODEL_WITH_METRIC, []),
        ).toStrictEqual(BIGBYTES_TABLE_WITH_METRICS);
    });
    it('should convert dbt model with dimension with default time intervals bigquery', () => {
        expect(
            convertTable(
                SupportedDbtAdapter.BIGQUERY,
                MODEL_WITH_DEFAULT_TIME_INTERVAL_DIMENSIONS,
                [],
            ),
        ).toStrictEqual(
            BIGBYTES_TABLE_WITH_DEFAULT_TIME_INTERVAL_DIMENSIONS_BIGQUERY,
        );
    });
    it('should convert dbt model with dimension with no time intervals bigquery', () => {
        expect(
            convertTable(
                SupportedDbtAdapter.BIGQUERY,
                MODEL_WITH_NO_TIME_INTERVAL_DIMENSIONS,
                [],
            ),
        ).toStrictEqual(
            BIGBYTES_TABLE_WITH_DEFAULT_TIME_INTERVAL_DIMENSIONS_BIGQUERY,
        );
    });
    it('should convert dbt model with dimension with default time intervals snowflake', () => {
        expect(
            convertTable(
                SupportedDbtAdapter.SNOWFLAKE,
                MODEL_WITH_DEFAULT_TIME_INTERVAL_DIMENSIONS,
                [],
            ),
        ).toStrictEqual(
            BIGBYTES_TABLE_WITH_DEFAULT_TIME_INTERVAL_DIMENSIONS_SNOWFLAKE,
        );
    });
    it('should convert dbt model with dimension with no time intervals snowflake', () => {
        expect(
            convertTable(
                SupportedDbtAdapter.SNOWFLAKE,
                MODEL_WITH_NO_TIME_INTERVAL_DIMENSIONS,
                [],
            ),
        ).toStrictEqual(
            BIGBYTES_TABLE_WITH_DEFAULT_TIME_INTERVAL_DIMENSIONS_SNOWFLAKE,
        );
    });
    it('should convert dbt model with dimension with off time intervals', () => {
        expect(
            convertTable(
                SupportedDbtAdapter.BIGQUERY,
                MODEL_WITH_OFF_TIME_INTERVAL_DIMENSIONS,
                [],
            ),
        ).toStrictEqual(BIGBYTES_TABLE_WITH_OFF_TIME_INTERVAL_DIMENSIONS);
    });
    it('should convert dbt model with dimension with off boolean time intervals', () => {
        expect(
            convertTable(
                SupportedDbtAdapter.BIGQUERY,
                MODEL_WITH_OFF_BOOLEAN_TIME_INTERVAL_DIMENSIONS,
                [],
            ),
        ).toStrictEqual(BIGBYTES_TABLE_WITH_OFF_TIME_INTERVAL_DIMENSIONS);
    });
    it('should convert dbt model with dimension with custom time intervals', () => {
        expect(
            convertTable(
                SupportedDbtAdapter.BIGQUERY,
                MODEL_WITH_CUSTOM_TIME_INTERVAL_DIMENSIONS,
                [],
            ),
        ).toStrictEqual(BIGBYTES_TABLE_WITH_CUSTOM_TIME_INTERVAL_DIMENSIONS);
    });
    it('should throw an error when metric and dimension have the same name', async () => {
        expect(() =>
            convertTable(
                SupportedDbtAdapter.BIGQUERY,
                MODEL_WITH_WRONG_METRIC,
                [],
            ),
        ).toThrowError(
            'Found a metric and a dimension with the same name: user_id',
        );
    });
    it('should throw an error when multiple metrics and dimensions have the same name', async () => {
        expect(() =>
            convertTable(
                SupportedDbtAdapter.BIGQUERY,
                MODEL_WITH_WRONG_METRICS,
                [],
            ),
        ).toThrowError(
            'Found multiple metrics and a dimensions with the same name: user_id,user_id2',
        );
    });

    it('should convert dbt model with group label', async () => {
        expect(
            convertTable(
                SupportedDbtAdapter.BIGQUERY,
                MODEL_WITH_GROUP_LABEL,
                [],
            ),
        ).toStrictEqual(BIGBYTES_TABLE_WITH_GROUP_LABEL);
    });

    // `sql_where` is an alias of `sql_filter`
    it('should convert dbt model with sql where', async () => {
        expect(
            convertTable(
                SupportedDbtAdapter.BIGQUERY,
                MODEL_WITH_SQL_WHERE,
                [],
            ),
        ).toStrictEqual(BIGBYTES_TABLE_SQL_WHERE);
    });

    it('should convert dbt model with sql filter', async () => {
        expect(
            convertTable(
                SupportedDbtAdapter.BIGQUERY,
                MODEL_WITH_SQL_FILTER,
                [],
            ),
        ).toStrictEqual(BIGBYTES_TABLE_SQL_WHERE);
    });

    it('should convert dbt model with dimension and additional dimensions', () => {
        expect(
            convertTable(
                SupportedDbtAdapter.POSTGRES,
                MODEL_WITH_ADDITIONAL_DIMENSIONS,
                [],
            ),
        ).toStrictEqual(BIGBYTES_TABLE_WITH_ADDITIONAL_DIMENSIONS);
    });

    it('should convert dbt model with groups meta block', async () => {
        expect(
            convertTable(
                SupportedDbtAdapter.BIGQUERY,
                MODEL_WITH_GROUPS_BLOCK,
                [],
            ),
        ).toStrictEqual(BIGBYTES_TABLE_WITH_GROUP_BLOCK);
    });
});
