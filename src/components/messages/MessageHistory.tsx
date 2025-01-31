import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { MessageSearch } from './MessageSearch';
import { useMessageStore } from '../../store/messageStore';
import { Image, FileText, CheckCircle2, XCircle } from 'lucide-react';

interface MessageHistoryProps {
  contactId: string;
}

export const MessageHistory: React.FC<MessageHistoryProps> = ({ contactId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    filteredMessages,
    searchQuery,
    filters,
    setSearchQuery,
    setFilters,
    markAsRead 
  } = useMessageStore();

  const messages = filteredMessages[contactId] || [];

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Mark messages as read
    const unreadMessages = messages
      .filter(msg => !msg.read && msg.direction === 'incoming')
      .map(msg => msg.id);

    if (unreadMessages.length > 0) {
      markAsRead(contactId, unreadMessages);
    }
  }, [messages, contactId, markAsRead]);

  const renderAttachment = (attachment: { url: string; type: string; name: string }) => {
    if (attachment.type === 'image') {
      return (
        <a 
          href={attachment.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block max-w-xs hover:opacity-90 transition-opacity"
        >
          <img 
            src={attachment.url} 
            alt={attachment.name}
            className="rounded-lg border dark:border-gray-700 max-h-48 object-cover"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block truncate">
            {attachment.name}
          </span>
        </a>
      );
    }

    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 rounded-lg border dark:border-gray-700 
                 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 
                 transition-colors"
      >
        <FileText className="h-5 w-5 text-gray-400" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{attachment.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Click to download</div>
        </div>
      </a>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <MessageSearch
        onSearch={setSearchQuery}
        onFilter={setFilters}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No messages found
          </div>
        ) : (
          messages.map((message, index) => {
            const isOutgoing = message.direction === 'outgoing';
            const showTimestamp = index === 0 || 
              new Date(messages[index - 1].timestamp).getDate() !== new Date(message.timestamp).getDate();

            return (
              <div key={message.id}>
                {showTimestamp && (
                  <div className="flex justify-center my-4">
                    <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(message.timestamp), 'MMMM d, yyyy')}
                    </div>
                  </div>
                )}

                <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] space-y-1 ${isOutgoing ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-lg px-4 py-2 text-sm break-words
                              ${isOutgoing 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                              }`}
                    >
                      {message.text}
                    </div>

                    {message.attachments && message.attachments.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {message.attachments.map((attachment, i) => (
                          <div key={i}>
                            {renderAttachment(attachment)}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(message.timestamp), 'h:mm a')}
                      {isOutgoing && (
                        <>
                          {message.status === 'sending' && (
                            <span className="text-gray-400">Sending...</span>
                          )}
                          {message.status === 'sent' && (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          )}
                          {message.status === 'failed' && (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
