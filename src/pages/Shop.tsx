
import React from 'react';
import NFTShop from '@/components/NFTShop';
import NFTImporter from '@/components/NFTImporter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Shop: React.FC = () => {
  return (
    <div className="w-full min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <Tabs defaultValue="shop">
          <TabsList className="mb-4">
            <TabsTrigger value="shop">NFT Shop</TabsTrigger>
            <TabsTrigger value="import">NFT Importer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shop">
            <NFTShop />
          </TabsContent>
          
          <TabsContent value="import">
            <NFTImporter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Shop;
