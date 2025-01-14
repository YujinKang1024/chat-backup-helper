import { ChatMessage, GroupedMessages } from '../types/chat';
import _ from 'lodash';
import Papa, { ParseConfig } from 'papaparse';

interface CSVRow {
  Date: string;
  User: string;
  Message: string;
}

const parseTxtChat = (text: string): ChatMessage[] => {
  const lines = text.split('\n');
  const messages: ChatMessage[] = [];
  let currentMessage: ChatMessage | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Check for system messages or headers we want to skip
    if (
      line.includes('저장한 날짜') ||
      line.includes('들어왔습니다.') ||
      line.includes('운영정책') ||
      line === '카카오톡 대화'
    ) {
      continue;
    }

    const messageMatch = line.match(
      /(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2})(,|\s) *(.*?)( : (.+)|$)/
    );

    if (messageMatch) {
      if (currentMessage) {
        messages.push(currentMessage);
      }

      const [, year, month, day, ampm, hour, minute, , sender, , content = ''] =
        messageMatch;

      // Skip system messages
      if (!content || !sender || sender.includes('님이')) {
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

      if (content.trim() === '이모티콘') {
        currentMessage = null;
        continue;
      }

      currentMessage = {
        timestamp,
        sender: sender.trim(),
        content: content.trim(),
      };
    } else if (currentMessage) {
      const timestampMatch = line.match(/^\d{4}년 \d{1,2}월 \d{1,2}일/);
      if (!timestampMatch) {
        currentMessage.content += '\n' + line;
      }
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  return messages;
};

const parseCsvChat = (csvText: string): ChatMessage[] => {
  const config: ParseConfig<CSVRow> = {
    header: true,
    skipEmptyLines: true,
    delimiter: ',',
    quoteChar: '"',
    escapeChar: '"',
  };

  const results = Papa.parse<CSVRow>(csvText, config);

  return results.data
    .filter((row: CSVRow): row is CSVRow =>
      Boolean(row.Date && row.User && row.Message)
    )
    .map((row: CSVRow) => {
      const timestamp = new Date(row.Date);
      const message: ChatMessage = {
        timestamp,
        sender: row.User,
        content: row.Message,
      };

      if (message.content.trim() === '이모티콘') {
        return null;
      }

      return message;
    })
    .filter((msg: ChatMessage | null): msg is ChatMessage => msg !== null);
};

export const formatMessagesForDownload = (messages: ChatMessage[]): string => {
  let content = '';
  let prevSender: string | null = null;

  messages.forEach((message) => {
    if (message.sender !== prevSender) {
      content += `${message.sender}: ${message.content}\n`;
      prevSender = message.sender;
    } else {
      content += `${message.content}\n`;
    }
  });

  return content;
};

export const parseKakaoChat = (
  text: string,
  fileType: 'txt' | 'csv'
): ChatMessage[] => {
  if (fileType === 'csv') {
    return parseCsvChat(text);
  }
  return parseTxtChat(text);
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
