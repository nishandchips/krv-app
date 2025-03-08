"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchTransitData } from '@/lib/api/transit';
import { formatTime, getPaymentMethodDescription, getTransfersDescription } from '@/lib/transit/transitData';
import InfoButton from '@/components/ui/InfoButton';

const TransitCard = () => {
  const [transitData, setTransitData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('150');
  const [activeView, setActiveView] = useState('schedule');
  
  useEffect(() => {
    const loadTransitData = async () => {
      try {
        setLoading(true);
        const data = await fetchTransitData(['150', '220', '227']);
        setTransitData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading transit data:', err);
        setError('Failed to load transit data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTransitData();
  }, []);
  
  const renderSchedule = (routeData) => {
    if (!routeData || !routeData.trips || routeData.trips.length === 0) {
      return <p className="text-gray-400">No schedule data available</p>;
    }
    
    return (
      <div className="space-y-4">
        {routeData.trips.map((trip) => (
          <div key={trip.trip_id} className="bg-gray-800/30 rounded-lg p-3">
            <h4 className="font-medium text-blue-400 mb-2">{trip.trip_headsign}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 pr-4">Stop</th>
                    <th className="text-left py-2 pr-4">Arrival</th>
                    <th className="text-left py-2">Departure</th>
                  </tr>
                </thead>
                <tbody>
                  {trip.stops.map((stop) => (
                    <tr key={`${trip.trip_id}-${stop.stop_id}`} className="border-b border-gray-800">
                      <td className="py-2 pr-4">{stop.stop_name}</td>
                      <td className="py-2 pr-4">{formatTime(stop.arrival_time)}</td>
                      <td className="py-2">{formatTime(stop.departure_time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderFares = (routeData) => {
    if (!routeData || !routeData.fares || routeData.fares.length === 0) {
      return <p className="text-gray-400">No fare data available</p>;
    }
    
    return (
      <div className="space-y-4">
        {routeData.fares.map((fare, index) => (
          <div key={index} className="bg-gray-800/30 rounded-lg p-3">
            <h4 className="font-medium text-blue-400 mb-2">Fare Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Price:</span>
                <span>${fare.price} {fare.currency_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span>{getPaymentMethodDescription(fare.payment_method)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Transfers:</span>
                <span>{getTransfersDescription(fare.transfers)}</span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="bg-gray-800/30 rounded-lg p-3 mt-4">
          <h4 className="font-medium text-blue-400 mb-2">Additional Information</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Exact fare is required - drivers do not carry change</li>
            <li>Children under 5 ride free with a fare-paying adult</li>
            <li>Senior/Disabled/Medicare discount available with valid ID</li>
            <li>Monthly passes available for frequent riders</li>
          </ul>
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center py-8">Loading transit data...</div>;
    }
    
    if (error) {
      return <div className="text-red-400 py-8">{error}</div>;
    }
    
    const routeData = transitData[activeTab];
    
    if (!routeData) {
      return <div className="text-gray-400 py-8">No data available for this route</div>;
    }
    
    return (
      <div className="space-y-4">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveView('schedule')}
            className={`px-3 py-1 rounded text-sm ${
              activeView === 'schedule' 
                ? 'bg-blue-500/30 text-blue-300' 
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveView('fares')}
            className={`px-3 py-1 rounded text-sm ${
              activeView === 'fares' 
                ? 'bg-blue-500/30 text-blue-300' 
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
            }`}
          >
            Fares & Fees
          </button>
        </div>
        
        {activeView === 'schedule' ? renderSchedule(routeData) : renderFares(routeData)}
      </div>
    );
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <CardTitle className="text-lg md:text-xl font-bold">Kern Transit Schedules & Fees</CardTitle>
          <InfoButton 
            sourceName="Kern Transit" 
            sourceUrl="https://kerntransit.org/" 
            className="ml-2 text-sm"
            position="bottom-left"
          />
        </div>
      </CardHeader>
      <CardContent className="p-2 md:p-3 flex-grow overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="150">Line 150</TabsTrigger>
            <TabsTrigger value="220">Line 220</TabsTrigger>
            <TabsTrigger value="227">Line 227</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="flex-grow">
            {renderContent()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransitCard; 