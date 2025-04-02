import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { apiClient } from "~/lib/api";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "API Test - TikPilot" },
    { name: "description", content: "Test API connection and endpoints" },
  ];
};

export default function ApiTest() {
  const [endpoint, setEndpoint] = useState("/status");
  const [method, setMethod] = useState("GET");
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      if (method === "GET") {
        result = await apiClient.get(endpoint);
      } else if (method === "POST") {
        const body = requestBody ? JSON.parse(requestBody) : {};
        result = await apiClient.post(endpoint, body);
      }
      
      setResponse(result);
    } catch (err) {
      console.error("API request failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Test</h1>
        <p className="text-muted-foreground">
          Test the connection to the backend API
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API Request</CardTitle>
            <CardDescription>
              Configure and send API requests to test endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="method">Method</Label>
                <div className="flex space-x-2">
                  <Button 
                    type="button"
                    variant={method === "GET" ? "default" : "outline"}
                    onClick={() => setMethod("GET")}
                  >
                    GET
                  </Button>
                  <Button 
                    type="button"
                    variant={method === "POST" ? "default" : "outline"}
                    onClick={() => setMethod("POST")}
                  >
                    POST
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endpoint">Endpoint</Label>
                <Input 
                  id="endpoint" 
                  value={endpoint} 
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="/api/endpoint"
                />
              </div>
              
              {method === "POST" && (
                <div className="space-y-2">
                  <Label htmlFor="requestBody">Request Body (JSON)</Label>
                  <textarea
                    id="requestBody"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder="{}"
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}
              
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
            <CardDescription>
              Response from the API endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                <h3 className="text-sm font-medium">Error</h3>
                <p className="mt-2 text-sm">{error}</p>
              </div>
            ) : response ? (
              <pre className="rounded-md bg-muted p-4 overflow-auto max-h-[400px] text-sm">
                {JSON.stringify(response, null, 2)}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">
                  Send a request to see the response here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Common Endpoints</CardTitle>
          <CardDescription>
            Quick access to frequently used API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setEndpoint("/status");
                setMethod("GET");
                setRequestBody("");
              }}
            >
              Status Check
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setEndpoint("/emulators");
                setMethod("GET");
                setRequestBody("");
              }}
            >
              List Emulators
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setEndpoint("/actions");
                setMethod("GET");
                setRequestBody("");
              }}
            >
              List Actions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
