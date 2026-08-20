"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/global/page-header";
import { AllChurches } from "@/components/dashboard/churches/all-churches";
import { ChurchRoles } from "@/components/dashboard/churches/church-role";
import { PastorAssignments } from "@/components/dashboard/churches/pastor-assignment";

const TAB_VALUES = ["all-churches", "church-roles", "pastor-assignments"] as const;
type TabValue = (typeof TAB_VALUES)[number];

export default function ChurchesPage() {
  const [addOpen, setAddOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // The Pastors page's "View Assignments" action links here with ?tab=
  // pastor-assignments&pastor=<id> so the tab needs to be controllable from
  // the URL rather than only via internal state.
  const tabParam = searchParams.get("tab");
  const activeTab: TabValue = TAB_VALUES.includes(tabParam as TabValue)
    ? (tabParam as TabValue)
    : "all-churches";
  const pastorId = searchParams.get("pastor") ?? undefined;

  const handleTabChange = (value: unknown) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value as string);
    if ((value as string) !== "pastor-assignments") {
      params.delete("pastor");
    }
    router.push(`/dashboard/churches?${params.toString()}`);
  };

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

      <Tabs value={activeTab} onValueChange={handleTabChange}>
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
          <PastorAssignments pastorId={pastorId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
