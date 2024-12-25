import { useState } from 'react';
import { GroupedMessages } from '../../types/chat';
import {
  Upload,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
} from 'lucide-react';
import { parseKakaoChat, groupMessagesByDate } from '../../lib/parser';

export const ChatViewer = () => {
  const [groupedMessages, setGroupedMessages] = useState<GroupedMessages>({});
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 1;

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const messages = parseKakaoChat(text);
      const grouped = groupMessagesByDate(messages);
      setGroupedMessages(grouped);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error parsing chat:', error);
    }
  };

  const dates = Object.keys(groupedMessages).sort();
  const totalPages = Math.ceil(dates.length / messagesPerPage);
  const currentDates = dates.slice(
    (currentPage - 1) * messagesPerPage,
    currentPage * messagesPerPage
  );

  const pageGroup = Math.ceil(currentPage / 10);
  const lastPageGroup = Math.ceil(totalPages / 10);
  const startPage = (pageGroup - 1) * 10 + 1;
  const endPage = Math.min(pageGroup * 10, totalPages);

  const jumpToDate = (targetDate: string) => {
    const dateIndex = dates.indexOf(targetDate);
    if (dateIndex !== -1) {
      const targetPage = Math.floor(dateIndex / messagesPerPage) + 1;
      setCurrentPage(targetPage);
    }
  };

  const handleDownload = () => {
    let content = '';
    dates.forEach((date) => {
      content += `${date}\n\n`;
      groupedMessages[date].forEach((message) => {
        content += `${message.sender}: ${message.content}\n`;
      });
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chat-backup.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="font-medium text-gray-600">
              대화 내용 파일을 드래그하거나 클릭하여 업로드하세요
            </span>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".txt"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {dates.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              className="p-2 border rounded-md"
              onChange={(e) => jumpToDate(e.target.value)}
              value={currentDates[0] || ''}
            >
              <option value="">날짜로 이동</option>
              {dates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            대화 내용 다운로드
          </button>
        </div>
      )}

      {currentDates.map((date) => (
        <div key={date} className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-800 sticky top-0 bg-white py-2 border-b">
            {date}
          </h2>
          <div className="space-y-4">
            {groupedMessages[date].map((message, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="min-w-[100px] font-bold text-blue-600 text-right">
                  {message.sender}
                </div>
                <div className="flex-1 bg-gray-50 p-3 rounded-lg text-gray-700">
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 10))}
            disabled={currentPage <= 10}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-3 py-1 rounded-md ${
                currentPage === pageNum
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 10))
            }
            disabled={pageGroup === lastPageGroup}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatViewer;
