import { Model, Document } from 'mongoose';

type FilterQuery = Record<string, unknown>;
type UpdateQuery = Record<string, unknown>;

export abstract class BaseRepository<T extends Document> {
  constructor(protected model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async updateOne(
    filter: FilterQuery,
    update: UpdateQuery
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(filter, update, { new: true })
      .exec();
  }

  async deleteOne(filter: FilterQuery): Promise<void> {
    await this.model.deleteOne(filter);
  }

  async exists(filter: FilterQuery): Promise<boolean> {
    const count = await this.model.countDocuments(filter);
    return count > 0;
  }
}
