import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SystemSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    onedriveFolder: '/CollectionsProject',
    sessionTimeout: '30',
    refreshInterval: '5'
  });

  const handleSettingChange = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const clearCache = () => {
    console.log('Clearing cache...');
    toast({
      title: "Cache Cleared",
      description: "Application cache has been cleared successfully",
    });
  };

  const downloadAuditLog = () => {
    console.log('Downloading audit log...');
    toast({
      title: "Download Started",
      description: "Audit log download has been initiated",
    });
  };

  const saveSettings = () => {
    console.log('Saving system settings...', settings);
    toast({
      title: "Settings Saved",
      description: "System settings have been updated",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Folder Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="onedriveFolder">OneDrive Folder Path</Label>
            <Input
              id="onedriveFolder"
              value={settings.onedriveFolder}
              onChange={(e) => handleSettingChange('onedriveFolder', e.target.value)}
              placeholder="/CollectionsProject"
              data-testid="input-onedrive-folder"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The folder path in OneDrive where files will be managed
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session & Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Select 
                value={settings.sessionTimeout} 
                onValueChange={(value) => handleSettingChange('sessionTimeout', value)}
              >
                <SelectTrigger data-testid="select-session-timeout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="refreshInterval">Auto-refresh Interval (minutes)</Label>
              <Select 
                value={settings.refreshInterval} 
                onValueChange={(value) => handleSettingChange('refreshInterval', value)}
              >
                <SelectTrigger data-testid="select-refresh-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={clearCache}
              className="flex items-center gap-2"
              data-testid="button-clear-cache"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cache
            </Button>
            <Button 
              variant="outline" 
              onClick={downloadAuditLog}
              className="flex items-center gap-2"
              data-testid="button-download-log"
            >
              <Download className="h-4 w-4" />
              Download Audit Log
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Clearing cache will remove stored API responses and temporary data. 
            Audit log contains all system actions and API calls.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} data-testid="button-save-system-settings">
          Save Settings
        </Button>
      </div>
    </div>
  );
}