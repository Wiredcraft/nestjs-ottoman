import { DynamicModule, Module } from '@nestjs/common';

import { createCouchbaseProviders } from './couchbase.providers';
import { CouchbaseCoreModule } from './couchbase-core.module';
import {
  CouchbaseConnectionConfig,
  CouchbaseModuleAsyncOptions,
} from './interfaces';

@Module({})
export class CouchbaseModule {
  static forRoot(config: CouchbaseConnectionConfig): DynamicModule {
    return {
      module: CouchbaseModule,
      imports: [CouchbaseCoreModule.forRoot(config)],
    };
  }

  static forRootAsync(config: CouchbaseModuleAsyncOptions): DynamicModule {
    return {
      module: CouchbaseModule,
      imports: [CouchbaseCoreModule.forRootAsync(config)],
    };
  }

  static forFeature(modelDefs: any[], connectionName: string): DynamicModule {
    const providers = createCouchbaseProviders(connectionName, modelDefs);
    return {
      module: CouchbaseModule,
      providers,
      exports: providers,
    };
  }
}
