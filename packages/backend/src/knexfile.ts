/**
 * Switch behaviour of database connector depending on environment
 */
import { Knex } from 'knex';
import path from 'path';
import { parse } from 'pg-connection-string';
import { bigbytesConfig } from './config/bigbytesConfig';

const CONNECTION = bigbytesConfig.database.connectionUri
    ? parse(bigbytesConfig.database.connectionUri)
    : {};

const development: Knex.Config<Knex.PgConnectionConfig> = {
    client: 'pg',
    connection: CONNECTION,
    pool: {
        min: bigbytesConfig.database.minConnections || 0,
        max: bigbytesConfig.database.maxConnections || 10,
    },
    migrations: {
        directory: path.join(__dirname, './database/migrations'),
        tableName: 'knex_migrations',
        extension: 'ts',
        loadExtensions: ['.ts'],
    },
    seeds: {
        directory: './database/seeds/development',
        loadExtensions: ['.ts'],
    },
};

const production: Knex.Config<Knex.PgConnectionConfig> = {
    ...development,
    migrations: {
        ...development.migrations,
        loadExtensions: ['.js'],
    },
    seeds: {
        ...development.seeds,
        loadExtensions: ['.js'],
    },
};

export default {
    development,
    production,
};
