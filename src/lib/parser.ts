import { ChatMessage, GroupedMessages } from '../types/chat';
import _ from 'lodash';

export const parseKakaoChat = (text: string): ChatMessage[] => {
  const lines = text.split('\n').filter((line) => line.trim());
  const messages: ChatMessage[] = [];

  lines.forEach((line) => {
    const messageMatch = line.match(
      /(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2}), (.+?) : (.+)/
    );

    if (messageMatch) {
      const [_, year, month, day, ampm, hour, minute, sender, content] =
        messageMatch;

      if (content.trim() === '이모티콘') {
        return;
      }

      const timestamp = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );

      messages.push({
        timestamp,
        sender,
        content,
      });
    }
  });

  return messages;
};

export const groupMessagesByDate = (
  messages: ChatMessage[]
): GroupedMessages => {
  return _.groupBy(messages, (message) => {
    return message.timestamp.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  });
};
