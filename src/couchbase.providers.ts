import { Provider } from '@nestjs/common';
import { Ottoman, set } from 'ottoman';
import { ConnectOptions } from 'ottoman/lib/types/ottoman/ottoman';

import {
  CouchbaseConnectionConfig,
  CouchbaseModuleAsyncOptions,
  OttomanModelDefinition,
} from './interfaces';
import {
  getConnectionsToken,
  getModelToken,
  getModuleOptionsToken,
} from './utils';

const createDBConnectionFactory = async (
  connOptions: ConnectOptions,
  debug?: boolean,
  scopeName?: string,
  collectionName?: string,
) => {
  // scopeName & collectionName passed to Constructor can be overrided by model
  const conn = new Ottoman({
    scopeName: scopeName || '_default',
    collectionName: collectionName || '_default',
  });
  await conn.connect(connOptions);
  if (debug) {
    set('DEBUG', true);
  }
  return conn;
};

const createConnections = (): Provider => {
  return {
    provide: getConnectionsToken(),
    useFactory: async (
      options: CouchbaseConnectionConfig | CouchbaseConnectionConfig[],
    ) => {
      const opts = Array.isArray(options) ? options : [options];
      const connections = new Map<string, Ottoman>();
      await Promise.all(
        opts.map(async (opt) => {
          connections.set(
            opt.connectionName,
            await createDBConnectionFactory(
              opt.ottomanConnectionOptions,
              opt.debug,
              opt.scopeName,
              opt.collectionName,
            ),
          );
        }),
      );
      return connections;
    },
    inject: [getModuleOptionsToken()],
  };
};

export const createCouchbaseConnectionProviders = (
  options: CouchbaseConnectionConfig | CouchbaseConnectionConfig[],
): Provider[] => {
  return [
    {
      provide: getModuleOptionsToken(),
      useValue: options,
    },
    createConnections(),
  ];
};

export const createCouchbaseAsyncConnectionProviders = (
  options: CouchbaseModuleAsyncOptions,
): Provider[] => {
  if (!options.useFactory) {
    throw new Error('only support useFactory');
  }
  return [
    {
      provide: getModuleOptionsToken(),
      useFactory: options.useFactory,
      inject: options.inject || [],
    },
    createConnections(),
  ];
};

export function createCouchbaseProviders(
  connectionName: string,
  options: OttomanModelDefinition[] = [],
): Provider[] {
  return options.reduce(
    (providers, option) => [
      ...providers,
      {
        provide: getModelToken(option.name),
        useFactory: async (connections: Map<string, Ottoman>) => {
          const connection: Ottoman = connections.get(connectionName);
          if (!connection) {
            throw new Error(`connectionName: ${connectionName} not found`);
          }
          const model = connection.model(
            option.name,
            option.schema,
            option.modelOptions,
          );
          await connection.ensureCollections();
          return model;
        },
        inject: [getConnectionsToken()],
      },
    ],
    [] as Provider[],
  );
}
