
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface ChatButtonProps {
  onClick?: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  return (
    <Button 
      className="win95-button whitespace-nowrap flex-shrink-0 cursor-pointer text-xs px-2 py-1 h-auto" 
      onClick={onClick}
    >
      Community Chat
      <MessageSquare className="ml-1 h-3 w-3" />
    </Button>
  );
};

export default ChatButton;
