import { Schema } from 'ottoman';

export const CatSchema = {
  name: { type: String, required: true },
  age: { type: Number, min: 1 },
  breed: { type: String, enum: ['Persian', 'Siamese', 'Birman', 'Ragdoll'] },
};

export const CatModelDefinition = {
  name: 'Cat',
  schema: new Schema(CatSchema),
  modelOptions: {
    scopeName: '_default',
    collectionName: 'Cat',
  },
};
