import {
  COUCHBASE_MODULE_OPTIONS,
  COUCHBASE_CONNECTIONS,
} from './couchbase.constants';

export const getModuleOptionsToken = (): string => COUCHBASE_MODULE_OPTIONS;

export function getModelToken(model: string) {
  return `${model}Model`;
}

export function getConnectionsToken() {
  return COUCHBASE_CONNECTIONS;
}
