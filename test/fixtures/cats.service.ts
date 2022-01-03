import { Injectable } from '@nestjs/common';
import { Model, Ottoman } from 'ottoman';
import { InjectModel, InjectConnections } from '../../src/decorators';
import { CatModelDefinition } from './cat.schema';
import { CreateCatDto } from './create-cat.dto';
@Injectable()
export class CatsService {
  constructor(
    @InjectModel(CatModelDefinition.name) private catsModel: Model<any>,
    @InjectConnections() private connections: Map<string, Ottoman>,
  ) {}

  async create(createCatDto: CreateCatDto): Promise<any> {
    return this.catsModel.create(createCatDto);
  }

  async findById(name: string): Promise<any> {
    return this.catsModel.findById(name);
  }
  async findByBreed(breed: string): Promise<any> {
    const res = await this.connections
      .get('cat')
      .bucket.viewQuery('_default_default', 'findByBreed', {
        key: breed,
      });
    return res.rows;
  }
}
