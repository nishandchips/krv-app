import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DynamicLineChart from '@/components/DynamicLineChart';

export default function RiverFlowCard({ data, viewMode }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Kern River Flow</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-6">
        {/* North Fork Section */}
        <div className="mb-8">
          <p className="text-blue-400 mb-2">North Fork near Kernville</p>
          <p className="text-4xl font-bold mb-4">
            {data.riverData.northFork.length > 0 
              ? `${data.riverData.northFork[data.riverData.northFork.length - 1].flow.toFixed(0)} cfs`
              : 'Gauge Offline'
            }
          </p>
          <div className="h-[250px]">
            <DynamicLineChart 
              data={data.riverData.northFork} 
              dataKey="flow"
              stroke="#60A5FA"
              height={250}
            />
          </div>
        </div>
        {/* South Fork Section */}
        {/* ... */}
      </CardContent>
    </Card>
  );
} 