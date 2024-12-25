export interface ChatMessage {
  timestamp: Date;
  sender: string;
  content: string;
}

export interface GroupedMessages {
  [date: string]: ChatMessage[];
}

export interface ParsedChat {
  messages: ChatMessage[];
  metadata: {
    totalMessages: number;
    participants: string[];
    dateRange: {
      start: Date;
      end: Date;
    };
  };
}
