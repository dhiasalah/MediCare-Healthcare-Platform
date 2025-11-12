"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeeklyScheduleEditor from "@/components/WeeklyScheduleEditor";
import DayOffManager from "@/components/DayOffManager";
import DoctorLayout from "@/components/DoctorLayout";

export default function PlanningPage() {
  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion de Planning
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configurez votre emploi du temps
          </p>
        </div>

        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent gap-2 p-0 h-auto">
            <TabsTrigger
              value="weekly"
              className="px-6 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-semibold transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:scale-105 data-[state=active]:border-blue-500 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              Emploi du temps
            </TabsTrigger>
            <TabsTrigger
              value="days-off"
              className="px-6 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-semibold transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:scale-105 data-[state=active]:border-blue-500 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              Congés
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-6">
            <WeeklyScheduleEditor />
          </TabsContent>

          <TabsContent value="days-off" className="mt-6">
            <DayOffManager />
          </TabsContent>
        </Tabs>
      </div>
    </DoctorLayout>
  );
}
