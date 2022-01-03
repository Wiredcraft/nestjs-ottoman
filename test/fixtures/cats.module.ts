import { Module } from '@nestjs/common';
import { CouchbaseModule } from '../../src/couchbase.module';
import { CatModelDefinition } from './cat.schema';
import { CatsService } from './cats.service';
@Module({
  imports: [CouchbaseModule.forFeature([CatModelDefinition], 'cat')],
  providers: [CatsService],
})
export class CatsModule {}
