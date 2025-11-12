/**
 * RecentActivitySection Component
 * Recent activity feed section
 */

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity } from "lucide-react";
import { ActivityItem } from "./ActivityItem";

interface Activity {
  id: string;
  title: string;
  timestamp: string;
  color: "green" | "blue" | "orange";
}

interface RecentActivitySectionProps {
  activities: Activity[];
}

export const RecentActivitySection = React.memo(
  ({ activities }: RecentActivitySectionProps) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Activité récente
        </CardTitle>
        <CardDescription>Dernières actions effectuées</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              title={activity.title}
              timestamp={activity.timestamp}
              color={activity.color}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
);
RecentActivitySection.displayName = "RecentActivitySection";
