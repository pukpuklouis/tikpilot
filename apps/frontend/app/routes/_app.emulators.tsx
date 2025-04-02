import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Smartphone, Plus, Play, Trash } from "lucide-react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Emulator Setup - TikPilot" },
    { name: "description", content: "Configure and manage your emulators" },
  ];
};

export default function EmulatorSetup() {
  // This would be populated from API in a real implementation
  const emulators: any[] = [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emulator Setup</h1>
          <p className="text-muted-foreground">
            Configure and manage your emulators
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Emulator
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emulators</CardTitle>
          <CardDescription>
            List of all configured emulators
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emulators.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Smartphone className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Emulators Configured</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                You haven't set up any emulators yet. Add an emulator to get started with TikPilot.
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Emulator
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emulators.map((emulator) => (
                  <TableRow key={emulator.id}>
                    <TableCell className="font-medium">{emulator.name}</TableCell>
                    <TableCell>{emulator.device}</TableCell>
                    <TableCell>{emulator.status}</TableCell>
                    <TableCell>{emulator.lastActive}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Guide</CardTitle>
          <CardDescription>
            How to set up and configure emulators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4">
            <h3 className="text-sm font-medium">Requirements</h3>
            <ul className="mt-2 list-disc pl-5 text-sm">
              <li>Android Studio or compatible emulator software</li>
              <li>Minimum 4GB RAM per emulator instance</li>
              <li>Android 9.0+ recommended</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Quick Setup Steps</h3>
            <ol className="mt-2 list-decimal pl-5 text-sm space-y-1">
              <li>Install Android Studio and Android SDK</li>
              <li>Create a new virtual device with Google Play services</li>
              <li>Start the emulator and verify it's running</li>
              <li>Click "Add Emulator" and enter the connection details</li>
              <li>Test the connection to ensure TikPilot can control the emulator</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
