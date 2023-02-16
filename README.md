# Description


A Couchbase module for [Nestjs](https://github.com/nestjs/nest), built on top of the ODM [ottoman 2.x](https://v2.ottomanjs.com/)


## Supported Couchbase version

- Server version 6.x, 7.x
- Nodejs SDK 4.x (supports Couchbase SDK API 3)


# Usage

## Installation

### Yarn
```
yarn add nestjs-ottoman
```

### NPM
```
npm install nestjs-ottoman --save
```

## Integration


1. Import `CouchbaseModule` in the root App module(or whatever other module that contains other modules), this provides initialized ottoman connection instance that is available to other modules by injection.
Use `CouchbaseModule.forRootAsync()` if the module options depend on asynchronous processing.
You can also bootstrap multiple Ottoman connections corresponding to different cluster/buckets in one `CouchbaseModule`.

```typescript
import { Module } from '@nestjs/common';
import { CouchbaseModule } from 'nestjs-ottoman';
import configuration from './src/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    CouchbaseModule.forRootAsync([{ // or CouchbaseModule.forRoot with a static option
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return configService.get('couchbase');
      },
      inject: [ConfigService],
    }, {
      connectionName: 'pet',
      ottomanConnectionOptions: {
        connectionString: 'couchbase://localhost',
        bucketName: 'pet_bucket',
        username: 'Administrator',
        password: 'password',
      },
    }
    ]),
  ],
})
export class AppModule {}
```

The configuration file looks like,
```typescript
export default () => ({
  couchbase: {
    connectionName: 'cat',
    ottomanConnectionOptions: {
      connectionString: 'couchbase://localhost',
      bucketName: 'cat_bucket',
      username: 'Administrator',
      password: 'password',
    },
  }
});

```


2. Define an Ottoman Model and schema, user `CouchbaseModule.forFeature()` to initialize and inject the Model object to other app modules.

```typescript
import { Module } from '@nestjs/common';
import { CouchbaseModule } from 'nestjs-ottoman';
import { CatModelDefinition } from './cat.schema';
@Module({
  //'cat' has to match the "connectionName" in step 1
  imports: [CouchbaseModule.forFeature([CatModelDefinition], 'cat')], 
  
})
export class CatModule {}
```

3. Inject initialized Model object to your service class. See the Ottoman documentation for Model API details.

```typescript
import { Injectable } from '@nestjs/common';
import { Model, Ottoman } from 'ottoman';
import { InjectModel } from 'nestjs-ottoman';
import { CatModelDefinition } from './cat.schema';
@Injectable()
export class CatService {
  constructor(
    @InjectModel(CatModelDefinition.name) private catsModel: Model<any>
  ) {}

  async findById(name: string): Promise<any> {
    return this.catsModel.findById(name);
  }

  // other codes ...

}
```

4. Optionally, you can also inject a global ottoman connection pools in case of you need to use the low level Couchbase SDK directly.
You can get the specific connection by connectionName, then the `bucket` property on the connection is a reference to `bucket` class of Couchabse Nodejs SDK.

```typescript
import { Injectable } from '@nestjs/common';
import { Model, Ottoman } from 'ottoman';
import { InjectConnections } from 'nestjs-ottoman';
@Injectable()
export class CatService {
  constructor(
    @InjectConnections() private connections: Map<String, Ottoman>,
  ) {}

  // a function using the map-reduce view query
  async findByBreed(breed: string): Promise<any> {
    const res = await this.connections
      .get('cat') // `connectionName` in step1,
      .bucket.viewQuery('_default_default', 'findByBreed', {
        key: breed,
      });
    return res.rows;
  }
}
```

Complete example code can be found in `test` folder.

## Couchbase Indexes

According to the [Ottoman Document](https://ottomanjs.com/guides/schema.html#index-types), building the index can cause a significant performance impact, this Nestjs-Ottoman won't take care of index building, you have to have another script or application to handle the index initialization.

The index defined on schema will have index name like `${bucketName}_${scopeName}_${collectionName}_${modelName}_${indexFields}` (or `${bucketName}_${scopeName}_${collectionName}_${indexFields}` in `nestjs-ottoman` version `v1.*.*`).
When create indexes of different models, same index name may cause conflict, in that case, you can specify `scopeName` and `collectionName` in model definition to overwrite the default value `'_default'`.

## Design

### Modeling

```
                                                           ╔══════════════════════════════════════╗
                                                           ║                                      ║
                                                           ║                  (scope:collection-1)║
                                                           ║  ┌───────────┐  ┌──────────┐         ║
                                                       ┌───╬─▶│  Model1   │  │ Schema1  │         ║
                                                       │   ║  └───────────┘  └──────────┘         ║
                                                       │   ║                                      ║
┌────────────────────┐     ┌─────────────────────┐     │   ║                                      ║
│       bucket       │     │                     │     │   ╚══════════════════════════════════════╝
│                    │     │  Ottoman instance1  │     │   ╔══════════════════════════════════════╗
│  (cluster:bucket)  │────▶│    (connection1)    │─────┤   ║                                      ║
│                    │     │                     │     │   ║                  (scope:collection-2)║
└────────────────────┘     └─────────────────────┘     │   ║   ┌──────────┐  ┌───────────┐        ║
                                                       └───╬─▶ │  Model2  │  │  Schema2  │        ║
                                                           ║   └──────────┘  └───────────┘        ║
                                                           ║                                      ║
                                                           ║                                      ║
                                                           ╚══════════════════════════════════════╝
                                                                                                   
                                                           ╔══════════════════════════════════════╗
                                                           ║                                      ║
                                                           ║                  (scope:collection-1)║
                                                           ║   ┌───────────┐  ┌──────────┐        ║
                                                        ┌──╬──▶│  Model3   │  │ Schema3  │        ║
 ┌─────────────────────┐    ┌─────────────────────┐     │  ║   └───────────┘  └──────────┘        ║
 │       bucket        │    │                     │     │  ║                                      ║
 │                     │    │  Ottoman instance2  │     │  ║                                      ║
 │  (cluster:bucket)   │───▶│    (connection2)    │─────┤  ║                                      ║
 │                     │    │                     │     │  ║    ┌──────────┐  ┌───────────┐       ║
 └─────────────────────┘    └─────────────────────┘     └──╬──▶ │  Model4  │  │  Schema4  │       ║
                                                           ║    └──────────┘  └───────────┘       ║
                                                           ║                                      ║
                                                           ╚══════════════════════════════════════╝
                                                                                   
```

### Ottoman Models spawning

```
                                                ┌─────────────────────────────────────────┐       
┌────────────────────────────────────┐          │                                         │       
│Connection pool Provider            │          │                                         │       
│                                    │          │                                         │       
│             ┌────────────────┐     │          │                                         │       
│             │  connection1   │     │          │    ForFeature('model def', connName)    │       
│             └────────────────┘     │◀───use───│                                         │       
│             ┌────────────────┐     │          │                                         │       
│             │  connenction2  │     │          │                                         │       
│             └────────────────┘     │          │                                         │       
└────────────────────────────────────┘          │                                         │       
                                                └─────────────────────────────────────────┘       
                                                                     │                            
                                                                     │                            
                                               ┌─────────generate────┴──generate───────┐          
                                               │                                       │          
                                               ▼                                       ▼          
                                    ┌────────────────────┐                  ┌────────────────────┐
                                    │                    │                  │                    │
                                    │  Provider-Model2   │                  │  Provider-Model1   │
                                    │                    │                  │                    │
                                    │                    │                  │                    │
                                    │                    │                  │                    │
                                    └────────────────────┘                  └────────────────────┘
```

# Development

## Installation

```bash
$ yarn install
```

## Test

Bootstrap the Couchbase servcie.
```
$ ./dockers/up.sh
```

Run the test code

```bash
$ yarn test

```


## License

[MIT licensed](LICENSE).
