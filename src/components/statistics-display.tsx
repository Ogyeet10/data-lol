"use client";

import { TrendingUp, Clock, Hash, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatisticsDisplayProps {
  statistics: {
    mean: number;
    median: number;
    total: number;
  };
  serviceType: string;
}

export function StatisticsDisplay({ statistics, serviceType }: StatisticsDisplayProps) {
  const formatDays = (days: number): string => {
    if (days === 0) return "Same day";
    if (days === 1) return "1 day";
    if (days < 7) return `${days} days`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      if (remainingDays === 0) return `${weeks} week${weeks > 1 ? 's' : ''}`;
      return `${weeks} week${weeks > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      if (remainingDays === 0) return `${months} month${months > 1 ? 's' : ''}`;
      return `${months} month${months > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    if (remainingDays === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
  };

  const getPerformanceIndicator = (days: number): { label: string; color: string } => {
    if (days <= 1) return { label: "Excellent", color: "text-green-600" };
    if (days <= 3) return { label: "Good", color: "text-blue-600" };
    if (days <= 7) return { label: "Fair", color: "text-yellow-600" };
    if (days <= 14) return { label: "Slow", color: "text-orange-600" };
    return { label: "Very Slow", color: "text-red-600" };
  };

  const meanIndicator = getPerformanceIndicator(statistics.mean);
  const medianIndicator = getPerformanceIndicator(statistics.median);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Statistics for {serviceType}</h3>
        <p className="text-sm text-muted-foreground">
          Analysis based on {statistics.total.toLocaleString()} service requests
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Requests */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Requests analyzed
            </p>
          </CardContent>
        </Card>

        {/* Mean */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.mean}</div>
            <p className="text-xs text-muted-foreground">
              {formatDays(Math.round(statistics.mean))}
            </p>
          </CardContent>
        </Card>

        {/* Median */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Median Time</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.median}</div>
            <p className="text-xs text-muted-foreground">
              {formatDays(Math.round(statistics.median))}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}