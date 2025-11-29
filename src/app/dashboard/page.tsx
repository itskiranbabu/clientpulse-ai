import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  // Get user's workspaces
  const memberships = await db.workspaceMember.findMany({
    where: {
      userId: user.id,
      status: 'active',
    },
    include: {
      workspace: true,
    },
  })

  if (memberships.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Workspace Found</CardTitle>
            <CardDescription>
              You don't have access to any workspaces yet.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Redirect to first workspace
  const firstWorkspace = memberships[0].workspace
  redirect(`/dashboard/${firstWorkspace.slug}`)
}
