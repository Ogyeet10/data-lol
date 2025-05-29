"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProcessedData, HourData } from "../lib/types";

interface HourAnalysisChartProps {
  data: ProcessedData[];
  hourData: HourData[];
  title: string;
}

export function HourAnalysisChart({ data, hourData, title }: HourAnalysisChartProps) {
  const formatHour = (hour: number): string => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  // Filter hour data based on the filtered dataset
  const filteredHourCounts: { [hour: number]: number } = {};
  for (let hour = 0; hour < 24; hour++) {
    filteredHourCounts[hour] = 0;
  }
  
  data.forEach(item => {
    filteredHourCounts[item.createdHour] += 1;
  });

  const chartData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    hourLabel: formatHour(hour),
    count: filteredHourCounts[hour],
  }));

  const downloadChart = () => {
    const csvContent = [
      ["Hour", "Requests"],
      ...chartData.map(item => [item.hourLabel, item.count.toString()])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}_hour_analysis.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const hour = parseInt(label);
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Time: ${formatHour(hour)}`}</p>
          <p className="text-primary">
            {`Requests: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalRequests = chartData.reduce((sum, item) => sum + item.count, 0);
  const peakHour = chartData.reduce((max, item) => item.count > max.count ? item : max, chartData[0]);
  const avgRequestsPerHour = Math.round((totalRequests / 24) * 100) / 100;

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm border-muted-foreground/10">
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>
            Please select a service type that contains data.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-muted-foreground/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Requests by Hour of Day
            </CardTitle>
            <CardDescription>
              {title} • {totalRequests} total requests
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={downloadChart}>
            <Download className="w-4 h-4 mr-2" />
            Download Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis 
                dataKey="hour"
                tickFormatter={formatHour}
                interval={1}
                fontSize={12}
              />
              <YAxis 
                label={{ value: "Number of Requests", angle: -90, position: "insideLeft" }}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/30 rounded-xl border border-muted-foreground/10">
            <h4 className="font-medium mb-1">Peak Hour</h4>
            <p className="text-2xl font-bold text-primary">{formatHour(peakHour.hour)}</p>
            <p className="text-sm text-muted-foreground">{peakHour.count} requests</p>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-xl border border-muted-foreground/10">
            <h4 className="font-medium mb-1">Average per Hour</h4>
            <p className="text-2xl font-bold text-primary">{avgRequestsPerHour}</p>
            <p className="text-sm text-muted-foreground">requests/hour</p>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-xl border border-muted-foreground/10">
            <h4 className="font-medium mb-1">Total Requests</h4>
            <p className="text-2xl font-bold text-primary">{totalRequests.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">across all hours</p>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            Chart shows the number of service requests created by hour of day. 
          </p>
        </div>
      </CardContent>
    </Card>
  );
}