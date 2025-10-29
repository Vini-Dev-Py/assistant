export type MessageSender = "USER" | "AI";

export interface Message {
  id: number;
  text: string;
  sender: MessageSender;
  chatId: number;
  createdAt: Date;
}

export interface NewMessage {
  text: string;
  sender: MessageSender;
  chatId: number;
}
