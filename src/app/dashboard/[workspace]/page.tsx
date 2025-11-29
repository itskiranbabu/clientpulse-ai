import { getCurrentWorkspace } from '@/lib/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function WorkspaceDashboard({
  params,
}: {
  params: { workspace: string }
}) {
  const { workspace } = await getCurrentWorkspace(params.workspace)

  // Fetch dashboard stats
  const [
    totalClients,
    healthyClients,
    atRiskClients,
    criticalClients,
    recentAlerts,
    avgHealthScore,
  ] = await Promise.all([
    db.client.count({ where: { workspaceId: workspace.id, status: 'active' } }),
    db.client.count({ where: { workspaceId: workspace.id, status: 'active', riskLevel: 'healthy' } }),
    db.client.count({ where: { workspaceId: workspace.id, status: 'active', riskLevel: 'at_risk' } }),
    db.client.count({ where: { workspaceId: workspace.id, status: 'active', riskLevel: 'critical' } }),
    db.alert.count({ 
      where: { 
        client: { workspaceId: workspace.id },
        actionTaken: false,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      } 
    }),
    db.client.aggregate({
      where: { workspaceId: workspace.id, status: 'active' },
      _avg: { healthScore: true },
    }),
  ])

  const avgScore = Math.round(avgHealthScore._avg.healthScore || 0)

  // Get recent at-risk clients
  const atRiskClientsList = await db.client.findMany({
    where: {
      workspaceId: workspace.id,
      status: 'active',
      riskLevel: { in: ['at_risk', 'critical'] },
    },
    orderBy: { healthScore: 'asc' },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      healthScore: true,
      riskLevel: true,
      lastContactDate: true,
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">ClientPulse AI</h1>
                <p className="text-sm text-gray-600">{workspace.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/${workspace.slug}/clients`}>
                <Button variant="outline">Clients</Button>
              </Link>
              <Link href={`/dashboard/${workspace.slug}/surveys`}>
                <Button variant="outline">Surveys</Button>
              </Link>
              <Link href={`/dashboard/${workspace.slug}/settings`}>
                <Button variant="outline">Settings</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-gray-600">Overview of your client health and retention metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalClients}</div>
              <p className="text-xs text-gray-600 mt-1">Active clients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Health Score</CardTitle>
              <Activity className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgScore}</div>
              <p className="text-xs text-gray-600 mt-1">Out of 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">At Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{atRiskClients + criticalClients}</div>
              <p className="text-xs text-gray-600 mt-1">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Recent Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{recentAlerts}</div>
              <p className="text-xs text-gray-600 mt-1">Last 7 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Health Distribution */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Client Health Distribution</CardTitle>
              <CardDescription>Breakdown by risk level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Healthy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{healthyClients}</span>
                    <span className="text-sm text-gray-600">
                      ({totalClients > 0 ? Math.round((healthyClients / totalClients) * 100) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">At Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-600">{atRiskClients}</span>
                    <span className="text-sm text-gray-600">
                      ({totalClients > 0 ? Math.round((atRiskClients / totalClients) * 100) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <span className="font-medium">Critical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-600">{criticalClients}</span>
                    <span className="text-sm text-gray-600">
                      ({totalClients > 0 ? Math.round((criticalClients / totalClients) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clients Needing Attention</CardTitle>
              <CardDescription>Top 5 at-risk clients</CardDescription>
            </CardHeader>
            <CardContent>
              {atRiskClientsList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                  <p>All clients are healthy!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {atRiskClientsList.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.email}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          client.riskLevel === 'critical' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {Math.round(client.healthScore)}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          client.riskLevel === 'critical' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {client.riskLevel === 'critical' ? 'Critical' : 'At Risk'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href={`/dashboard/${workspace.slug}/clients/new`}>
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Add New Client
                </Button>
              </Link>
              <Link href={`/dashboard/${workspace.slug}/surveys/new`}>
                <Button className="w-full" variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  Create Survey
                </Button>
              </Link>
              <Link href={`/dashboard/${workspace.slug}/alerts`}>
                <Button className="w-full" variant="outline">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  View Alerts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
