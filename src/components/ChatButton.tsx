
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface ChatButtonProps {
  onClick?: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  return (
    <Button 
      className="win95-button whitespace-nowrap flex-shrink-0 cursor-pointer" 
      onClick={onClick}
    >
      Community Chat
      <MessageSquare className="ml-2 h-4 w-4" />
    </Button>
  );
};

export default ChatButton;
