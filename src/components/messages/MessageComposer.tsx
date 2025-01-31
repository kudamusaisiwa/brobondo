import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Paperclip, X } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { useMessageStore } from '../../store/messageStore';
import toast from 'react-hot-toast';

interface MessageComposerProps {
  contactId: string;
  disabled?: boolean;
}

interface FilePreview {
  file: File;
  preview: string;
  type: 'image' | 'file';
}

export const MessageComposer: React.FC<MessageComposerProps> = ({ 
  contactId,
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<FilePreview[]>([]);
  const { sendMessage } = useMessageStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the textarea when component mounts
  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);

  // Cleanup file previews when component unmounts
  useEffect(() => {
    return () => {
      attachments.forEach(attachment => {
        if (attachment.preview) {
          URL.revokeObjectURL(attachment.preview);
        }
      });
    };
  }, [attachments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && attachments.length === 0) || sending || disabled) return;

    try {
      setSending(true);

      // First upload any attachments
      const uploadedFiles = await Promise.all(
        attachments.map(async (attachment) => {
          const formData = new FormData();
          formData.append('file', attachment.file);
          
          // Upload file and get URL
          // TODO: Implement file upload to your storage service
          const uploadedUrl = 'TODO: Replace with actual upload URL';
          
          return {
            url: uploadedUrl,
            type: attachment.type,
            name: attachment.file.name
          };
        })
      );

      // Send message with attachments
      await sendMessage(contactId, message.trim(), uploadedFiles);
      
      // Clear form
      setMessage('');
      setAttachments([]);
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const files = Array.from(e.target.files || []);
    
    // Create previews for new files
    const newAttachments = await Promise.all(
      files.map(async (file) => {
        const preview = type === 'image' 
          ? URL.createObjectURL(file)
          : URL.createObjectURL(file);
          
        return {
          file,
          preview,
          type
        };
      })
    );

    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = ''; // Reset input
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      URL.revokeObjectURL(newAttachments[index].preview);
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex flex-col border-t dark:border-gray-700"
    >
      {attachments.length > 0 && (
        <div className="p-2 flex gap-2 flex-wrap">
          {attachments.map((attachment, index) => (
            <div 
              key={index} 
              className="relative group"
            >
              {attachment.type === 'image' ? (
                <img 
                  src={attachment.preview} 
                  alt="Preview" 
                  className="h-20 w-20 object-cover rounded border dark:border-gray-700"
                />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded border dark:border-gray-700">
                  <Paperclip className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1
                         opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              <span className="absolute bottom-0 left-0 right-0 text-xs truncate bg-black/50 text-white p-1">
                {attachment.file.name}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 p-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e, 'file')}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e, 'image')}
          className="hidden"
          accept="image/*"
        />
        
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled || sending}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                   dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image className="h-5 w-5" />
        </button>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || sending}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                   dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <div className="flex-1">
          <TextareaAutosize
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled || sending}
            maxRows={4}
            className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-white dark:bg-gray-800 px-3 py-2 text-sm 
                     placeholder:text-gray-500 dark:placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={(!message.trim() && attachments.length === 0) || sending || disabled}
          className="flex-shrink-0 rounded-full p-2 text-white bg-blue-500 hover:bg-blue-600 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Send className={`h-5 w-5 ${sending ? 'animate-pulse' : ''}`} />
        </button>
      </div>
    </form>
  );
};
