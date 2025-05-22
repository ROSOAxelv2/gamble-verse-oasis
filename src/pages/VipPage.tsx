
import React from 'react';
import { Layout } from "../components/layout/Layout";
import { VipStatus } from "../components/vip/VipStatus";

const VipPage = () => {
  return (
    <Layout requireAuth>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">VIP Program</h1>
        
        <div className="grid grid-cols-1 gap-8">
          <VipStatus />
          
          <div className="bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">VIP Program Benefits</h2>
            <p className="mb-4">Our VIP program rewards loyal players with exclusive benefits that get better as you rise through the ranks.</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Daily Free Spins</h3>
                <p className="text-sm text-muted-foreground">Claim free spins every day based on your VIP level. Higher levels get more spins!</p>
              </div>
              
              <div>
                <h3 className="font-medium">Cashback on Losses</h3>
                <p className="text-sm text-muted-foreground">Get a percentage of your losses back as cashback, with higher rates for higher VIP levels.</p>
              </div>
              
              <div>
                <h3 className="font-medium">Exclusive Badges</h3>
                <p className="text-sm text-muted-foreground">Show off your status with exclusive badges that appear on your profile.</p>
              </div>
              
              <div>
                <h3 className="font-medium">How to Level Up</h3>
                <p className="text-sm text-muted-foreground">
                  Your VIP level is determined by your lifetime wagering amount. The more you play, the higher your level!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VipPage;
