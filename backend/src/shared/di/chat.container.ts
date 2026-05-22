import { MessageRepository } from "../../repositories/chat/message.repository";
import { MessageService } from "../../services/chat/message.service";
import { MessageController } from "../../controllers/chat/message.controller";

export const messageRepository = new MessageRepository();
export const messageService = new MessageService(messageRepository);
export const messageController = new MessageController(messageService);
