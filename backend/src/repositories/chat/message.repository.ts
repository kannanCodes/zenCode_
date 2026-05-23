import { BaseRepository } from "../../infrastructure/database/repositories/base/base.repository";
import { IMessage, MessageModel } from "../../infrastructure/database/models/message.model";
import { IMessageRepository } from "../../interfaces/repository-interfaces/chat/IMessageRepository";

export class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository {
  constructor() {
    super(MessageModel);
  }

  async createMessage(data: Partial<IMessage>): Promise<IMessage> {
    return this.create(data);
  }

  async getRoomMessages(roomId: string): Promise<IMessage[]> {
    return this.model.find({ roomId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'fullName avatarUrl')
      .exec();
  }
}
