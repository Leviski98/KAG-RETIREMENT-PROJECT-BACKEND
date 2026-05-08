"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/global/page-header";
import { AllChurches } from "@/components/dashboard/churches/all-churches";
import { ChurchRoles } from "@/components/dashboard/churches/church-role";
import { PastorAssignments } from "@/components/dashboard/churches/pastor-assignment";

export default function ChurchesPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
      
        title="Church Manager"
        description="View and manage all churches, their roles, and pastor assignments."
        action={
          <Button onClick={() => setAddOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Add Church
          </Button>
        }
      />

      <Tabs defaultValue="all-churches">
        <TabsList variant="line">
          <TabsTrigger value="all-churches">All Churches</TabsTrigger>
          <TabsTrigger value="church-roles">Church Roles</TabsTrigger>
          <TabsTrigger value="pastor-assignments">
            Pastor Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-churches">
          <AllChurches 
            externalAddOpen={addOpen}
            onAddOpenChange={setAddOpen}
          />
        </TabsContent>

        <TabsContent value="church-roles">
          <ChurchRoles />
        </TabsContent>

        <TabsContent value="pastor-assignments">
          <PastorAssignments />
        </TabsContent>
      </Tabs>
    </div>
  );
}
