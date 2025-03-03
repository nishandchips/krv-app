import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoadStatusIndicators from "@/components/RoadStatusIndicators";
import ClosuresList from "@/components/ClosuresList";

/**
 * Road closures and conditions card with fixed sizing and proper spacing
 */
export default function RoadClosuresCard({ data, className, viewMode }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Road Status</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-visible flex flex-col">
        {data && (
          <>
            <RoadStatusIndicators data={data} />
            <div className="mt-2 overflow-visible">
              <ClosuresList
                closures={data.roadClosures || []}
                roadConditions={data.roadConditions || []}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 