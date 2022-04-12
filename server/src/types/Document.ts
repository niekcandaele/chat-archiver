export interface IDocument {
  uid: string;
  content: string;
  author: string;
  timestamp: number;
  platformType: 'discord';
  platformChannelId: string;
  platformGuildId: string | null;
  platformId: string;
  attachments: IAttachment[]
}

export interface IAttachment {
  url: string;
  contentType: string | null;
}