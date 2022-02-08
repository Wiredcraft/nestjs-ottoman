import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Schema } from 'ottoman';
import { ModelOptions } from 'ottoman/lib/types/model/interfaces/create-model.interface';
import { ConnectOptions } from 'ottoman/lib/types/ottoman/ottoman';

export interface CouchbaseConnectionConfig {
  connectionName: string;
  collectionName?: string;
  scopeName?: string;
  ottomanConnectionOptions: ConnectOptions;
  debug?: boolean;
  keyGenerator?: (params: { metadata: any }) => string;
  keyGeneratorDelimiter?: string;
}

export type OttomanModelDefinition = {
  name: string;
  schema: Schema;
  modelOptions: ModelOptions;
};

export interface CouchbaseModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: any[]
  ) => Promise<CouchbaseConnectionConfig> | CouchbaseConnectionConfig;
  inject?: any[];
}
