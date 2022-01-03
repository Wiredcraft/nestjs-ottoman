import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Ottoman } from 'ottoman';

import { COUCHBASE_CONNECTIONS } from './couchbase.constants';
import {
  createCouchbaseAsyncConnectionProviders,
  createCouchbaseConnectionProviders,
} from './couchbase.providers';
import {
  CouchbaseConnectionConfig,
  CouchbaseModuleAsyncOptions,
} from './interfaces';

@Global()
@Module({})
export class CouchbaseCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(COUCHBASE_CONNECTIONS)
    private readonly connections: Map<string, Ottoman>,
  ) {}

  async onApplicationShutdown() {
    for (const conn of this.connections.values()) {
      conn && (await conn.close());
    }
  }

  static forRoot(
    config: CouchbaseConnectionConfig | CouchbaseConnectionConfig[],
  ): DynamicModule {
    const providers = createCouchbaseConnectionProviders(config);
    return {
      module: CouchbaseCoreModule,
      providers,
      exports: providers,
    };
  }

  static forRootAsync(options: CouchbaseModuleAsyncOptions): DynamicModule {
    const providers = createCouchbaseAsyncConnectionProviders(options);
    return {
      module: CouchbaseCoreModule,
      imports: options.imports,
      providers,
      exports: providers,
    };
  }
}
