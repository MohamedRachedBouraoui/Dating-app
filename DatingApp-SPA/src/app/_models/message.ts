export interface Message {
  id: number;
  content: string;
  isRead: boolean;
  readOn: Date;
  sentOn: Date;
  senderId: number;
  senderKnownAs: string;
  senderPhotoUrl: string;
  recipientId: number;
  recipientKnownAs: string;
  recipientPhotoUrl: string;
}
