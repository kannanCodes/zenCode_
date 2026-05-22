import { IMessageService } from "../../interfaces/service-interfaces/chat/IMessageService";
import { IMessageRepository } from "../../interfaces/repository-interfaces/chat/IMessageRepository";
import { IMessage } from "../../infrastructure/database/models/message.model";

export class MessageService implements IMessageService {
  constructor(private readonly messageRepo: IMessageRepository) {}

  async createMessage(data: Partial<IMessage>): Promise<IMessage> {
    return this.messageRepo.createMessage(data);
  }

  async getRoomMessages(roomId: string): Promise<IMessage[]> {
    return this.messageRepo.getRoomMessages(roomId);
  }
}
