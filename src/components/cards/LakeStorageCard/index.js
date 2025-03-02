import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DynamicLineChart from '@/components/DynamicLineChart';

export default function LakeStorageCard({ data }) {
  const currentLakeStorage = data.lakeData.length > 0 
    ? data.lakeData[data.lakeData.length - 1].level 
    : 'N/A';
  const recentLakeData = data.lakeData.slice(-30);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Lake Isabella Storage</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-6">
        <div className="text-center mb-6">
          <p className="text-blue-400 mb-2">Current Storage</p>
          <p className="text-4xl font-bold">
            {typeof currentLakeStorage === 'number' 
              ? `${Math.round(currentLakeStorage).toLocaleString()} acre-ft`
              : 'N/A'
            }
          </p>
        </div>
        <div className="h-[250px]">
          {recentLakeData.length > 0 ? (
            <DynamicLineChart
              data={recentLakeData}
              dataKey="level"
              stroke="#60A5FA"
              isLakeStorage={true}
              height={250}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 