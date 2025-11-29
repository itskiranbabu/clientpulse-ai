import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { db } from './db'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function getCurrentWorkspace(workspaceSlug: string) {
  const user = await requireAuth()
  
  const membership = await db.workspaceMember.findFirst({
    where: {
      userId: user.id,
      workspace: {
        slug: workspaceSlug,
      },
      status: 'active',
    },
    include: {
      workspace: true,
    },
  })

  if (!membership) {
    throw new Error('Workspace not found or access denied')
  }

  return {
    workspace: membership.workspace,
    role: membership.role,
  }
}

export async function requireWorkspaceAccess(
  workspaceSlug: string,
  minimumRole: 'owner' | 'admin' | 'member' = 'member'
) {
  const { workspace, role } = await getCurrentWorkspace(workspaceSlug)

  const roleHierarchy = { owner: 3, admin: 2, member: 1 }
  const userRoleLevel = roleHierarchy[role as keyof typeof roleHierarchy] || 0
  const requiredRoleLevel = roleHierarchy[minimumRole]

  if (userRoleLevel < requiredRoleLevel) {
    throw new Error('Insufficient permissions')
  }

  return { workspace, role }
}
