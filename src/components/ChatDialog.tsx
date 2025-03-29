
import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWeb3 } from '@/contexts/Web3Context';
import { MessageSquare, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Generate a random wallet-like ID for anonymous users
const generateRandomId = () => {
  const id = uuidv4().replace(/-/g, '').substring(0, 10);
  return `0x${id}...`;
};

const ChatDialog: React.FC<ChatDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { address } = useWeb3();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [anonymousId] = useState(generateRandomId());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data - in a real app, this would be connected to Supabase
  useEffect(() => {
    // Sample initial messages
    const initialMessages = [
      {
        id: '1',
        sender: '0x7823...45ab',
        content: 'Hey everyone! Just joined.',
        timestamp: Date.now() - 1000000
      },
      {
        id: '2',
        sender: '0x9a12...3c6f',
        content: 'Welcome to the chat!',
        timestamp: Date.now() - 500000
      },
      {
        id: '3',
        sender: '0x7823...45ab',
        content: 'Thanks, this is awesome.',
        timestamp: Date.now() - 300000
      }
    ];
    setMessages(initialMessages);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: uuidv4(),
      sender: address || anonymousId,
      content: newMessage,
      timestamp: Date.now()
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // If we're using this as a standalone dialog
  if (open) {
    return (
      <div className="flex-grow flex flex-col bg-[#c0c0c0] p-2 h-[280px] w-[280px]">
        <div className="win95-panel mb-2 p-1 text-xs">
          <span className="font-bold">{address || anonymousId}</span>
        </div>
        
        <ScrollArea className="win95-inset flex-grow p-2 bg-white">
          <div className="space-y-2">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex flex-col p-1 rounded ${message.sender === (address || anonymousId) ? 'bg-[#e0e0e0]' : 'bg-white border border-gray-300'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs truncate max-w-[180px]">{message.sender}</span>
                  <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                </div>
                <p className="text-xs mt-1">{message.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="mt-2 flex gap-2">
          <Input
            className="win95-inset flex-grow h-8 text-xs"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button 
            className="win95-button h-8 w-8 p-0 flex items-center justify-center"
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ''}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  // Otherwise, use the Dialog component
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="win95-window border-2 border-gray-400 p-0 max-w-md rounded-none h-[400px] flex flex-col" style={{ zIndex: 9999 }}>
        <div className="win95-title-bar flex justify-between items-center">
          <DialogTitle className="text-white text-lg px-2 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </DialogTitle>
          <DialogClose className="text-white hover:text-gray-300 px-2">x</DialogClose>
        </div>
        
        <div className="flex-grow flex flex-col bg-[#c0c0c0] p-2">
          <div className="win95-panel mb-2 p-2 text-xs">
            Connected as: <span className="font-bold">{address || anonymousId}</span>
          </div>
          
          <ScrollArea className="win95-inset flex-grow p-2 bg-white">
            <div className="space-y-2">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex flex-col p-2 rounded ${message.sender === (address || anonymousId) ? 'bg-[#e0e0e0]' : 'bg-white border border-gray-300'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs truncate max-w-[200px]">{message.sender}</span>
                    <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                  </div>
                  <p className="text-sm mt-1">{message.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="mt-2 flex gap-2">
            <Input
              className="win95-inset flex-grow"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button 
              className="win95-button"
              onClick={handleSendMessage}
              disabled={newMessage.trim() === ''}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
