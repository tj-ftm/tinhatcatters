
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import ChatDialog from './ChatDialog';

const ChatButton: React.FC = () => {
  const [showChatDialog, setShowChatDialog] = useState(false);
  
  return (
    <>
      <Button 
        className="win95-button whitespace-nowrap flex-shrink-0 cursor-pointer" 
        onClick={() => setShowChatDialog(true)}
      >
        Community Chat
        <MessageSquare className="ml-2 h-4 w-4" />
      </Button>
      
      <ChatDialog 
        open={showChatDialog}
        onOpenChange={setShowChatDialog}
      />
    </>
  );
};

export default ChatButton;
