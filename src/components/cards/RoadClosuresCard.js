export default function RoadClosuresCard({ data, viewMode }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Road Closures</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-3 md:p-4 space-y-3">
        <RoadStatusIndicators data={data} viewMode={viewMode} />
        <ClosuresList closures={data.roadClosures} />
      </CardContent>
    </Card>
  );
} 