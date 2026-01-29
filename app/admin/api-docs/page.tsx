"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Key, Code, BookOpen, ExternalLink, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ApiDocsPage() {
  const { toast } = useToast()
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(null), 2000)
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const CodeBlock = ({ children, language = "bash", title }: { children: string, language?: string, title?: string }) => (
    <div className="relative">
      {title && (
        <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium rounded-t-lg border-b border-gray-600">
          {title}
        </div>
      )}
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-white"
          onClick={() => copyToClipboard(children, title || 'Code')}
        >
          {copiedText === (title || 'Code') ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
        <pre className="pr-10">{children}</pre>
      </div>
    </div>
  )

  const ResponseExample = ({ title, children }: { title: string, children: string }) => (
    <div className="relative">
      <div className="bg-green-800 text-white px-4 py-2 text-sm font-medium rounded-t-lg">
        {title}
      </div>
      <div className="bg-gray-900 text-gray-100 p-4 rounded-b-lg font-mono text-sm overflow-x-auto relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-white"
          onClick={() => copyToClipboard(children, title)}
        >
          {copiedText === title ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
        <pre className="pr-10">{children}</pre>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 p-3 rounded-lg">
          <BookOpen className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
          <p className="text-gray-600 mt-1">
            Complete guide to the Booking System API with secret key authentication
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.open('/admin/settings/secret-keys', '_blank')}>
          <CardContent className="p-4 flex items-center gap-3">
            <Key className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-medium">Manage Secret Keys</h3>
              <p className="text-sm text-gray-600">Create and manage API keys</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => document.getElementById('authentication')?.scrollIntoView({ behavior: 'smooth' })}>
          <CardContent className="p-4 flex items-center gap-3">
            <Code className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-medium">Authentication</h3>
              <p className="text-sm text-gray-600">Learn how to authenticate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' })}>
          <CardContent className="p-4 flex items-center gap-3">
            <Code className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="font-medium">Code Examples</h3>
              <p className="text-sm text-gray-600">Ready-to-use code snippets</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>
                The Booking System API provides secure access to booking data and operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Base URL</h3>
                <CodeBlock>https://yourdomain.com/api</CodeBlock>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Secret key authentication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Custom field filtering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Pagination support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Multiple filter options</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>JSON response format</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Rate Limits</h3>
                <p className="text-gray-600">
                  Currently no rate limits are enforced, but this may change in the future. 
                  Please use the API responsibly.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Authentication Tab */}
        <TabsContent value="authentication" id="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>
                All API requests require a valid secret key for authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Secret Keys</h3>
                <p className="text-gray-600 mb-4">
                  Secret keys are generated with the format <code className="bg-gray-100 px-1 rounded">sk_</code> followed by 64 random characters.
                  They provide full access to your booking API.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Security Warning</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Never expose secret keys in client-side code, public repositories, or logs. 
                        Store them securely as environment variables.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Authentication Methods</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">1. Header Authentication (Recommended)</h4>
                    <CodeBlock title="x-secret-key Header">
{`curl -H "x-secret-key: sk_your_key_here" \\
     "https://yourdomain.com/api/bookings"`}
                    </CodeBlock>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">2. Bearer Token</h4>
                    <CodeBlock title="Authorization Header">
{`curl -H "Authorization: Bearer sk_your_key_here" \\
     "https://yourdomain.com/api/bookings"`}
                    </CodeBlock>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">3. Query Parameter</h4>
                    <CodeBlock title="Query Parameter">
{`curl "https://yourdomain.com/api/bookings?secret_key=sk_your_key_here"`}
                    </CodeBlock>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Available endpoints and their parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Get Bookings Endpoint */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">GET</Badge>
                  <code className="text-lg font-mono">/api/bookings-api</code>
                </div>
                
                <p className="text-gray-600 mb-4">
                  Retrieve bookings with optional filtering by custom fields and other criteria.
                </p>

                <h4 className="font-medium mb-3">Query Parameters</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Parameter</th>
                        <th className="px-4 py-2 text-left font-medium">Type</th>
                        <th className="px-4 py-2 text-left font-medium">Description</th>
                        <th className="px-4 py-2 text-left font-medium">Example</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-2 font-mono text-sm">customKey</td>
                        <td className="px-4 py-2">string</td>
                        <td className="px-4 py-2">Custom field key to filter by</td>
                        <td className="px-4 py-2 font-mono text-sm">email</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 font-mono text-sm">value</td>
                        <td className="px-4 py-2">string</td>
                        <td className="px-4 py-2">Value to match for custom field</td>
                        <td className="px-4 py-2 font-mono text-sm">john@example.com</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-sm">status</td>
                        <td className="px-4 py-2">string</td>
                        <td className="px-4 py-2">Filter by booking status</td>
                        <td className="px-4 py-2 font-mono text-sm">confirmed</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 font-mono text-sm">startDate</td>
                        <td className="px-4 py-2">string</td>
                        <td className="px-4 py-2">Start date filter (YYYY-MM-DD)</td>
                        <td className="px-4 py-2 font-mono text-sm">2024-01-01</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-sm">endDate</td>
                        <td className="px-4 py-2">string</td>
                        <td className="px-4 py-2">End date filter (YYYY-MM-DD)</td>
                        <td className="px-4 py-2 font-mono text-sm">2024-12-31</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 font-mono text-sm">page</td>
                        <td className="px-4 py-2">number</td>
                        <td className="px-4 py-2">Page number for pagination</td>
                        <td className="px-4 py-2 font-mono text-sm">1</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-sm">pageSize</td>
                        <td className="px-4 py-2">number</td>
                        <td className="px-4 py-2">Number of results per page</td>
                        <td className="px-4 py-2 font-mono text-sm">10</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-4 py-2 font-mono text-sm">companyId</td>
                        <td className="px-4 py-2">number</td>
                        <td className="px-4 py-2">Filter by company ID</td>
                        <td className="px-4 py-2 font-mono text-sm">123</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-mono text-sm">roomId</td>
                        <td className="px-4 py-2">number</td>
                        <td className="px-4 py-2">Filter by room ID</td>
                        <td className="px-4 py-2 font-mono text-sm">456</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h4 className="font-medium mb-3 mt-6">Example Requests</h4>
                
                <div className="space-y-4">
                  <CodeBlock title="Get all bookings">
{`curl -H "x-secret-key: sk_your_key_here" \\
     "https://yourdomain.com/api/bookings-api"`}
                  </CodeBlock>

                  <CodeBlock title="Filter by custom field">
{`curl -H "x-secret-key: sk_your_key_here" \\
     "https://yourdomain.com/api/bookings-api?customKey=email&value=john@example.com"`}
                  </CodeBlock>

                  <CodeBlock title="Complex filtering">
{`curl -H "x-secret-key: sk_your_key_here" \\
     "https://yourdomain.com/api/bookings?customKey=phone&value=1234567890&status=confirmed&startDate=2024-01-01&endDate=2024-12-31&page=1&pageSize=10"`}
                  </CodeBlock>
                </div>

                <h4 className="font-medium mb-3 mt-6">Response Format</h4>
                <ResponseExample title="Success Response (200)">
{`{
  "success": true,
  "bookings": [
    {
      "id": 1,
      "selectedDate": "2024-01-15",
      "roomId": 1,
      "roomName": "Conference Room A",
      "timeSlotId": 1,
      "timeSlotStartTime": "09:00:00",
      "timeSlotEndTime": "10:00:00",
      "timeSlotName": "Morning Slot",
      "customCompanyName": "ABC Corp",
      "agreedToTerms": true,
      "status": "confirmed",
      "linkId": 1,
      "linkUuid": "abc-123-def",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T10:00:00.000Z",
      "bookingNumber": "BK001",
      "companyId": 1,
      "companyName": "ABC Corp",
      "customFieldData": {
        "1": {
          "title": "Email",
          "value": "john@example.com",
          "fieldType": "email"
        },
        "2": {
          "title": "Phone",
          "value": "1234567890",
          "fieldType": "tel"
        }
      }
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 10
}`}
                </ResponseExample>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" id="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>
                Ready-to-use code examples in various programming languages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* JavaScript Example */}
              <div>
                <h3 className="text-lg font-semibold mb-3">JavaScript/TypeScript</h3>
                <CodeBlock title="Basic fetch request" language="javascript">
{`const secretKey = process.env.SECRET_KEY;

async function getBookings() {
  try {
    const response = await fetch('/api/bookings', {
      headers: {
        'x-secret-key': secretKey
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Bookings:', data.bookings);
      return data.bookings;
    } else {
      console.error('Error:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

// Filter by custom field
async function getBookingsByEmail(email) {
  const response = await fetch(\`/api/bookings?customKey=email&value=\${encodeURIComponent(email)}\`, {
    headers: {
      'x-secret-key': secretKey
    }
  });
  
  return response.json();
}`}
                </CodeBlock>
              </div>

              {/* Python Example */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Python</h3>
                <CodeBlock title="Using requests library" language="python">
{`import os
import requests
from typing import Dict, List, Optional

class BookingAPI:
    def __init__(self, base_url: str, secret_key: str):
        self.base_url = base_url
        self.secret_key = secret_key
        self.headers = {'x-secret-key': secret_key}
    
    def get_bookings(self, **filters) -> Dict:
        """
        Get bookings with optional filters
        
        Args:
            customKey: Custom field key to filter by
            value: Value to match for custom field
            status: Booking status filter
            startDate: Start date (YYYY-MM-DD)
            endDate: End date (YYYY-MM-DD)
            page: Page number
            pageSize: Results per page
        """
        url = f"{self.base_url}/api/bookings"
        
        # Remove None values from filters
        params = {k: v for k, v in filters.items() if v is not None}
        
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            return response.json()
        else:
            response.raise_for_status()
    
    def get_bookings_by_custom_field(self, custom_key: str, value: str) -> List[Dict]:
        """Get bookings filtered by custom field"""
        data = self.get_bookings(customKey=custom_key, value=value)
        return data.get('bookings', []) if data.get('success') else []

# Usage
api = BookingAPI(
    base_url="https://yourdomain.com",
    secret_key=os.getenv('SECRET_KEY')
)

# Get all bookings
all_bookings = api.get_bookings()

# Get bookings by email
email_bookings = api.get_bookings_by_custom_field('email', 'john@example.com')

# Get confirmed bookings for date range
confirmed_bookings = api.get_bookings(
    status='confirmed',
    startDate='2024-01-01',
    endDate='2024-12-31'
)`}
                </CodeBlock>
              </div>

              {/* cURL Example */}
              <div>
                <h3 className="text-lg font-semibold mb-3">cURL Scripts</h3>
                <CodeBlock title="Bash script with multiple examples" language="bash">
{`#!/bin/bash

# Configuration
SECRET_KEY="sk_your_key_here"
BASE_URL="https://yourdomain.com/api/bookings"

# Function to make API call with error handling
api_call() {
    local url="$1"
    local description="$2"
    
    echo "=== $description ==="
    
    response=$(curl -s -w "\\n%{http_code}" \\
        -H "x-secret-key: $SECRET_KEY" \\
        "$url")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ Success:"
        echo "$body" | jq '.'
    else
        echo "❌ Failed (HTTP $http_code):"
        echo "$body"
    fi
    echo ""
}

# Examples
api_call "$BASE_URL" "Get all bookings"

api_call "$BASE_URL?customKey=email&value=john@example.com" \\
    "Get bookings by email"

api_call "$BASE_URL?status=confirmed&startDate=2024-01-01" \\
    "Get confirmed bookings from 2024"

api_call "$BASE_URL?customKey=phone&value=1234567890&page=1&pageSize=5" \\
    "Get bookings by phone (paginated)"`}
                </CodeBlock>
              </div>

              {/* Node.js/Express Example */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Node.js (Express)</h3>
                <CodeBlock title="Express.js middleware and route" language="javascript">
{`const express = require('express');
const axios = require('axios');

const app = express();

// Booking API client
class BookingAPIClient {
  constructor(baseURL, secretKey) {
    this.client = axios.create({
      baseURL,
      headers: {
        'x-secret-key': secretKey
      }
    });
  }

  async getBookings(filters = {}) {
    try {
      const response = await this.client.get('/api/bookings', {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw new Error(\`API Error: \${error.response?.data?.error || error.message}\`);
    }
  }
}

// Initialize client
const bookingAPI = new BookingAPIClient(
  process.env.BOOKING_API_URL,
  process.env.SECRET_KEY
);

// Route to proxy booking requests
app.get('/bookings', async (req, res) => {
  try {
    const filters = {
      customKey: req.query.customKey,
      value: req.query.value,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: req.query.page || 1,
      pageSize: req.query.pageSize || 10
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const data = await bookingAPI.getBookings(filters);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`}
                </CodeBlock>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Handling</CardTitle>
              <CardDescription>
                Common error responses and how to handle them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <h3 className="text-lg font-semibold mb-3">HTTP Status Codes</h3>
                <div className="space-y-4">
                  
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive">401</Badge>
                      <span className="font-medium">Unauthorized</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Invalid, missing, expired, or inactive secret key
                    </p>
                    <ResponseExample title="401 Error Response">
{`{
  "success": false,
  "error": "Unauthorized. Valid secret key required."
}`}
                    </ResponseExample>
                  </div>

                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive">500</Badge>
                      <span className="font-medium">Internal Server Error</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Server error, invalid custom field key, or database issues
                    </p>
                    <ResponseExample title="500 Error Response">
{`{
  "success": false,
  "error": "Custom field with key 'invalid_key' not found"
}`}
                    </ResponseExample>
                  </div>

                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">400</Badge>
                      <span className="font-medium">Bad Request</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Invalid parameters or malformed request
                    </p>
                    <ResponseExample title="400 Error Response">
{`{
  "success": false,
  "error": "Invalid date format. Use YYYY-MM-DD"
}`}
                    </ResponseExample>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Error Handling Best Practices</h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">1. Always Check the Response</h4>
                    <CodeBlock title="JavaScript error handling" language="javascript">
{`const response = await fetch('/api/bookings', {
  headers: { 'x-secret-key': secretKey }
});

if (!response.ok) {
  const errorData = await response.json();
  throw new Error(\`API Error (\${response.status}): \${errorData.error}\`);
}

const data = await response.json();
if (!data.success) {
  throw new Error(\`API Error: \${data.error}\`);
}`}
                    </CodeBlock>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">2. Implement Retry Logic</h4>
                    <CodeBlock title="Retry with exponential backoff" language="javascript">
{`async function apiCallWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 401) {
        // Don't retry authentication errors
        throw new Error('Invalid secret key');
      }
      
      if (response.ok) {
        return await response.json();
      }
      
      if (attempt === maxRetries) {
        throw new Error(\`Request failed after \${maxRetries} attempts\`);
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
      
    } catch (error) {
      if (attempt === maxRetries) throw error;
    }
  }
}`}
                    </CodeBlock>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">3. Validate Inputs</h4>
                    <CodeBlock title="Input validation" language="javascript">
{`function validateBookingFilters(filters) {
  const errors = [];
  
  if (filters.startDate && !/^\\d{4}-\\d{2}-\\d{2}$/.test(filters.startDate)) {
    errors.push('startDate must be in YYYY-MM-DD format');
  }
  
  if (filters.endDate && !/^\\d{4}-\\d{2}-\\d{2}$/.test(filters.endDate)) {
    errors.push('endDate must be in YYYY-MM-DD format');
  }
  
  if (filters.page && (!Number.isInteger(filters.page) || filters.page < 1)) {
    errors.push('page must be a positive integer');
  }
  
  if (filters.pageSize && (!Number.isInteger(filters.pageSize) || filters.pageSize < 1 || filters.pageSize > 100)) {
    errors.push('pageSize must be between 1 and 100');
  }
  
  if (errors.length > 0) {
    throw new Error(\`Validation errors: \${errors.join(', ')}\`);
  }
}`}
                    </CodeBlock>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Troubleshooting</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Secret key not working?</h4>
                      <p className="text-sm text-gray-600">
                        Check if the key is active, not expired, and correctly formatted. Ensure there are no extra spaces.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Custom field filter not working?</h4>
                      <p className="text-sm text-gray-600">
                        Verify the custom field key exists and is active. Check the exact spelling and case sensitivity.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Empty results?</h4>
                      <p className="text-sm text-gray-600">
                        Check your filters - they might be too restrictive. Try removing filters one by one to identify the issue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
