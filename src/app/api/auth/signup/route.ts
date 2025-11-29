import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { generateSlug } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const { name, email, password, workspaceName } = await req.json()

    // Validate input
    if (!name || !email || !password || !workspaceName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user and workspace in transaction
    const result = await db.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })

      // Generate unique workspace slug
      let slug = generateSlug(workspaceName)
      let slugExists = await tx.workspace.findUnique({ where: { slug } })
      let counter = 1
      
      while (slugExists) {
        slug = `${generateSlug(workspaceName)}-${counter}`
        slugExists = await tx.workspace.findUnique({ where: { slug } })
        counter++
      }

      // Create workspace
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug,
          plan: 'starter',
          status: 'active',
        },
      })

      // Add user as workspace owner
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'owner',
          status: 'active',
        },
      })

      // Create subscription record
      await tx.subscription.create({
        data: {
          workspaceId: workspace.id,
          stripeCustomerId: '', // Will be set when they subscribe
          plan: 'starter',
          status: 'trialing',
        },
      })

      return { user, workspace }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      workspace: {
        id: result.workspace.id,
        slug: result.workspace.slug,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
