import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoadStatusIndicators from "@/components/RoadStatusIndicators";
import ClosuresList from "@/components/ClosuresList";

/**
 * Road closures card with consistent sizing to match LakeStorageCard exactly
 */
export default function RoadClosuresCard({ data, className }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Road Status</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <RoadStatusIndicators data={data} />
        <ClosuresList 
          closures={data?.roadClosures || []} 
          roadConditions={data?.roadConditions || []}
          timestamp={data?.timestamp}
        />
      </CardContent>
    </Card>
  );
} 