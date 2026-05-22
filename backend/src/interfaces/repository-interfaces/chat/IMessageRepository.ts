import { IMessage } from "../../../infrastructure/database/models/message.model";

export interface IMessageRepository {
  createMessage(data: Partial<IMessage>): Promise<IMessage>;
  getRoomMessages(roomId: string): Promise<IMessage[]>;
}
