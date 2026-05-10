import mongoose, { Model, Document, UpdateQuery } from 'mongoose';

export abstract class BaseRepository<T extends Document> {

   constructor(protected model: Model<T>) {}

   async create(data: Partial<T>): Promise<T> {
      return this.model.create(data);
   }

   async findById(id: string): Promise<T | null> {
      return this.model.findById(id).exec();
   }

   async findOne(filter: mongoose.QueryFilter<T>): Promise<T | null> {
      return this.model.findOne(filter).exec();
   }

   async updateOne(
      filter: mongoose.QueryFilter<T>,
      update: UpdateQuery<T>
   ): Promise<T | null> {
      return this.model
         .findOneAndUpdate(filter, update, { new: true })
         .exec();
   }

   async deleteOne(filter: mongoose.QueryFilter<T>): Promise<void> {
      await this.model.deleteOne(filter);
   }
}
