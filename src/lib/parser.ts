import { ChatMessage, GroupedMessages } from '../types/chat';
import _ from 'lodash';

export const parseKakaoChat = (text: string): ChatMessage[] => {
  const lines = text.split('\n');
  const messages: ChatMessage[] = [];
  let currentMessage: ChatMessage | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const messageMatch = line.match(
      /(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2}), (.+?) : (.+)/
    );

    if (messageMatch) {
      if (currentMessage) {
        messages.push(currentMessage);
      }

      const [, year, month, day, ampm, hour, minute, sender, content] =
        messageMatch;

      if (content.trim() === '이모티콘') {
        currentMessage = null;
        continue;
      }

      let adjustedHour = parseInt(hour);
      if (ampm === '오후' && adjustedHour !== 12) {
        adjustedHour += 12;
      } else if (ampm === '오전' && adjustedHour === 12) {
        adjustedHour = 0;
      }

      const timestamp = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        adjustedHour,
        parseInt(minute)
      );

      currentMessage = {
        timestamp,
        sender,
        content: content,
      };
    } else if (currentMessage && line.trim()) {
      const nextMessageMatch = line.match(
        /\d{4}년 \d{1,2}월 \d{1,2}일 (오전|오후) \d{1,2}:\d{2}/
      );
      if (!nextMessageMatch) {
        currentMessage.content += '\n' + line;
      }
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

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
