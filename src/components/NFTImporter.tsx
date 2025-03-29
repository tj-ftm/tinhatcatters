
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';
import { toast } from '@/hooks/use-toast';
import { useNFTs } from '@/hooks/use-nfts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

interface ImportStatus {
  processed: number;
  total: number;
  moreAvailable: boolean;
  success: boolean;
  message: string;
}

const NFTImporter: React.FC = () => {
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const { refreshNFTs } = useNFTs();
  const batchSize = 10;
  
  const startImport = async (offset = 0, forceUpdate = false) => {
    setImporting(true);
    try {
      const response = await fetch(
        `${window.location.origin}/api/import-nft-data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            force: forceUpdate,
            limit: batchSize,
            offset: offset
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update import status
        setImportStatus({
          processed: result.processed || 0,
          total: result.total || 0,
          moreAvailable: result.moreAvailable || false,
          success: true,
          message: result.message
        });
        
        // Update current offset
        setCurrentOffset(offset + batchSize);
        
        toast({
          title: 'Import Progress',
          description: result.message,
        });
        
        // Refresh NFTs in the UI
        refreshNFTs();
      } else {
        throw new Error(result.error || 'Failed to import NFT data');
      }
    } catch (error: any) {
      console.error('Error importing NFT data:', error);
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import NFT data',
        variant: 'destructive',
      });
      setImportStatus(null);
    } finally {
      setImporting(false);
    }
  };
  
  const continueImport = () => {
    if (importStatus?.moreAvailable) {
      startImport(currentOffset, true);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>NFT Data Importer</CardTitle>
        <CardDescription>
          Import NFT data from SonicScan and store images in Supabase
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {importStatus && (
          <div className="mb-4">
            <div className="text-sm mb-2">
              Processed {importStatus.processed} of {importStatus.total} NFTs
              {importStatus.moreAvailable && " (more available)"}
            </div>
            <Progress value={(importStatus.processed / Math.max(importStatus.total, 1)) * 100} />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          onClick={() => startImport(0, true)}
          disabled={importing}
        >
          {importing && !importStatus?.moreAvailable ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {importing && !importStatus?.moreAvailable ? "Importing..." : "Start Import"}
        </Button>
        
        {importStatus?.moreAvailable && (
          <Button 
            onClick={continueImport}
            disabled={importing}
            variant="outline"
          >
            {importing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {importing ? "Continuing..." : "Continue Import"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default NFTImporter;
