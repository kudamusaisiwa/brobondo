import React from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  isCurrentUser: boolean;
}

const REACTIONS = [
  { emoji: '👍', name: 'thumbs up' },
  { emoji: '❤️', name: 'heart' },
  { emoji: '😊', name: 'smile' },
  { emoji: '😂', name: 'joy' },
  { emoji: '😮', name: 'wow' },
  { emoji: '😢', name: 'sad' }
];

export default function EmojiPicker({ onSelect, onClose, isCurrentUser }: EmojiPickerProps) {
  return (
    <div 
      className={`flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-1 ${
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {REACTIONS.map(({ emoji, name }) => (
        <button
          key={name}
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          title={name}
        >
          <span className="text-lg">{emoji}</span>
        </button>
      ))}
    </div>
  );
}