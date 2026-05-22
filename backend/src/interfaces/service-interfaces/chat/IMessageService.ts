import { IMessage } from "../../../infrastructure/database/models/message.model";

export interface IMessageService {
  createMessage(data: Partial<IMessage>): Promise<IMessage>;
  getRoomMessages(roomId: string): Promise<IMessage[]>;
}
