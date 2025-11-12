"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface QuickAccessCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  subtitle: string;
  badge?: string;
  iconColor?: string;
  badgeColor?: string;
}

export function QuickAccessCard({
  href,
  icon: Icon,
  title,
  description,
  subtitle,
  badge,
  iconColor = "text-blue-600",
  badgeColor = "text-blue-600",
}: QuickAccessCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon className={`h-6 w-6 mr-3 ${iconColor}`} />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{subtitle}</p>
            {badge && (
              <p className={`text-sm font-medium ${badgeColor}`}>{badge}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
