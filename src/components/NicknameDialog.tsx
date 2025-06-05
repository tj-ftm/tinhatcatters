
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNickname } from '@/hooks/useNickname';
import { useToast } from '@/hooks/use-toast';

interface NicknameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNicknameSave?: (nickname: string) => void;
}

const NicknameDialog: React.FC<NicknameDialogProps> = ({ 
  open, 
  onOpenChange, 
  onNicknameSave 
}) => {
  const { nickname, saveNickname, isLoading } = useNickname();
  const [inputValue, setInputValue] = useState(nickname);
  const { toast } = useToast();

  const handleSave = async () => {
    if (inputValue.trim().length < 2) {
      toast({
        title: "Invalid Nickname",
        description: "Nickname must be at least 2 characters long",
        variant: "destructive"
      });
      return;
    }

    if (inputValue.length > 20) {
      toast({
        title: "Invalid Nickname",
        description: "Nickname must be less than 20 characters",
        variant: "destructive"
      });
      return;
    }

    const success = await saveNickname(inputValue.trim());
    if (success) {
      toast({
        title: "Nickname Saved",
        description: "Your nickname has been updated successfully!"
      });
      
      // Call the callback if provided (for welcome bonus)
      if (onNicknameSave) {
        onNicknameSave(inputValue.trim());
      }
      
      onOpenChange(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to save nickname. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="win95-window">
        <DialogHeader>
          <DialogTitle>Set Your Nickname</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div>
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter your nickname"
              maxLength={20}
              className="win95-inset"
            />
            <p className="text-xs text-gray-600 mt-1">
              This will be displayed on the leaderboard. First-time setup earns 500 points!
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="win95-button"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="win95-button"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NicknameDialog;
