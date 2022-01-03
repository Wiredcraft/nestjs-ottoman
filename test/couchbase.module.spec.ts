import { Test, TestingModule } from '@nestjs/testing';
import { CouchbaseModule } from '../src/couchbase.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CatsModule } from './fixtures/cats.module';
import { CatsService } from './fixtures/cats.service';
import configuration from './fixtures/configuration';
import { PetsModule } from './fixtures/pets.module';

describe('Couchbase module', () => {
  describe('forRoot', () => {
    let catsService: CatsService;
    beforeAll(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [
          CouchbaseModule.forRoot(configuration().couchbase),
          CatsModule,
        ],
      }).compile();
      catsService = moduleRef.get<CatsService>(CatsService);
    });

    it('should be able to create', async () => {
      const cat = await catsService.create({
        name: 'jane',
        age: 2,
        breed: 'Persian',
      });
      expect(cat).toHaveProperty('id');
      expect(cat).toHaveProperty('name', 'jane');
      expect(cat).toHaveProperty('age', 2);
      expect(cat).toHaveProperty('breed', 'Persian');
      expect(cat).toHaveProperty('_type', 'Cat');
    });
    it('should be able to find', async () => {
      const cat = await catsService.create({
        name: 'tom',
        age: 1,
        breed: 'Siamese',
      });
      const found = await catsService.findById(cat.id);
      expect(found).toHaveProperty('id');
      expect(found).toHaveProperty('name', 'tom');
      expect(found).toHaveProperty('age', 1);
      expect(found).toHaveProperty('breed', 'Siamese');
      expect(found).toHaveProperty('_type', 'Cat');
    });
  });
  describe('forRootAsync', () => {
    let catsService: CatsService;
    beforeAll(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            load: [configuration],
          }),
          CouchbaseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
              return configService.get('couchbase');
            },
            inject: [ConfigService],
          }),
          CatsModule,
        ],
      }).compile();
      catsService = moduleRef.get<CatsService>(CatsService);
    });

    it('should be able to create', async () => {
      const cat = await catsService.create({
        name: 'jane',
        age: 2,
        breed: 'Persian',
      });
      expect(cat).toHaveProperty('id');
      expect(cat).toHaveProperty('name', 'jane');
      expect(cat).toHaveProperty('age', 2);
      expect(cat).toHaveProperty('breed', 'Persian');
      expect(cat).toHaveProperty('_type', 'Cat');
    });
    it('should be able to find', async () => {
      const cat = await catsService.create({
        name: 'tom',
        age: 1,
        breed: 'Siamese',
      });
      const found = await catsService.findById(cat.id);
      expect(found).toHaveProperty('id');
      expect(found).toHaveProperty('name', 'tom');
      expect(found).toHaveProperty('age', 1);
      expect(found).toHaveProperty('breed', 'Siamese');
      expect(found).toHaveProperty('_type', 'Cat');
    });
  });
  describe('multiple connections', () => {
    let catsService: CatsService;
    beforeAll(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            load: [configuration],
          }),
          CouchbaseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
              return configService.get('multiple_connections');
            },
            inject: [ConfigService],
          }),
          PetsModule,
        ],
      }).compile();
      catsService = moduleRef.get<CatsService>(CatsService);
    });

    it('should be able to find', async () => {
      const cat = await catsService.create({
        name: 'tom',
        age: 1,
        breed: 'Siamese',
      });
      const found = await catsService.findById(cat.id);
      expect(found).toHaveProperty('id');
      expect(found).toHaveProperty('name', 'tom');
      expect(found).toHaveProperty('age', 1);
      expect(found).toHaveProperty('breed', 'Siamese');
      expect(found).toHaveProperty('_type', 'Cat');
    });
  });
});
