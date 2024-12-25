import { useState } from 'react';
import { GroupedMessages, ChatMessage } from '../../../types/chat';
import { Download } from 'lucide-react';

interface DateRangeDownloadProps {
  groupedMessages: GroupedMessages;
  dates: string[];
}

export const DateRangeDownload = ({
  groupedMessages,
  dates,
}: DateRangeDownloadProps) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    if (endDate && date > endDate) {
      setEndDate(date);
    }
  };

  const handleEndDateChange = (date: string) => {
    if (!startDate || date >= startDate) {
      setEndDate(date);
    }
  };

  const formatMessagesForDownload = (messages: ChatMessage[]) => {
    return messages
      .map((message) => `${message.sender}: ${message.content}`)
      .join('\n');
  };

  const handleSingleDateDownload = (date: string) => {
    let content = `${date}\n\n`;
    content += formatMessagesForDownload(groupedMessages[date]);
    content += '\n';

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-${date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadRange = () => {
    const filteredDates = dates.filter((date) => {
      if (!startDate && !endDate) return true;
      if (!startDate) return date <= endDate;
      if (!endDate) return date >= startDate;
      return date >= startDate && date <= endDate;
    });

    let content = '';
    filteredDates.forEach((date) => {
      content += `${date}\n\n`;
      content += formatMessagesForDownload(groupedMessages[date]);
      content += '\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName =
      startDate && endDate
        ? `chat-${startDate}-to-${endDate}.txt`
        : startDate
        ? `chat-from-${startDate}.txt`
        : endDate
        ? `chat-until-${endDate}.txt`
        : 'chat-full.txt';

    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">시작일:</label>
          <select
            className="p-2 border rounded-md"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
          >
            <option value="">선택하세요</option>
            {dates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">종료일:</label>
          <select
            className="p-2 border rounded-md"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
          >
            <option value="">선택하세요</option>
            {dates.map((date) => (
              <option
                key={date}
                value={date}
                disabled={startDate ? date < startDate : false}
              >
                {date}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleDownloadRange}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          선택 기간 다운로드
        </button>
      </div>
      <div className="text-sm text-gray-500">
        또는 각 날짜별 대화 내용을 개별적으로 다운로드:
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {dates.map((date) => (
          <button
            key={date}
            onClick={() => handleSingleDateDownload(date)}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            {date}
          </button>
        ))}
      </div>
    </div>
  );
};
