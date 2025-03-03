import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoadStatusIndicators from "@/components/RoadStatusIndicators";
import ClosuresList from "@/components/ClosuresList";

export default function RoadClosuresCard({ data, viewMode }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Road Conditions</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-3 md:p-4 overflow-hidden flex flex-col">
        <RoadStatusIndicators data={data} viewMode={viewMode} />
        <ClosuresList 
          closures={data.roadClosures || []} 
          roadConditions={data.roadConditions || []} 
        />
      </CardContent>
    </Card>
  );
} 