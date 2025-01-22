/**
 * Switch behaviour of database connector depending on environment
 */
import { Knex } from 'knex';
import path from 'path';
import { parse } from 'pg-connection-string';
import { clairdashConfig } from './config/clairdashConfig';

const CONNECTION = clairdashConfig.database.connectionUri
    ? parse(clairdashConfig.database.connectionUri)
    : {};

const development: Knex.Config<Knex.PgConnectionConfig> = {
    client: 'pg',
    connection: CONNECTION,
    pool: {
        min: clairdashConfig.database.minConnections || 0,
        max: clairdashConfig.database.maxConnections || 10,
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
