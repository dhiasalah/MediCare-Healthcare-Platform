/**
 * QuickAccessCard Component
 * Navigation card for quick access to doctor features
 */

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
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  nextItem?: string;
  iconColor?: string;
}

export function QuickAccessCard({
  title,
  description,
  icon: Icon,
  href,
  nextItem,
  iconColor = "text-blue-600",
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
        {nextItem && (
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{nextItem}</p>
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
