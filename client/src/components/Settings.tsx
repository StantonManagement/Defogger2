import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import APIConfiguration from "./APIConfiguration";
import SystemSettings from "./SystemSettings";
import HelpTab from "./HelpTab";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("api");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure API connections, system preferences, and get help
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api" data-testid="tab-api-config">
            API Configuration
          </TabsTrigger>
          <TabsTrigger value="system" data-testid="tab-system">
            System
          </TabsTrigger>
          <TabsTrigger value="help" data-testid="tab-help">
            Help
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="mt-6">
          <APIConfiguration />
        </TabsContent>
        
        <TabsContent value="system" className="mt-6">
          <SystemSettings />
        </TabsContent>
        
        <TabsContent value="help" className="mt-6">
          <HelpTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}