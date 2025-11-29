import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, TrendingUp, Bell, Zap, Users, BarChart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">ClientPulse AI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Predict churn before it happens
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          AI-powered client success platform that monitors engagement, predicts churn risk, and automates retention actions.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to retain clients</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <BarChart className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>AI Health Scoring</CardTitle>
              <CardDescription>
                Real-time client health scores based on engagement, sentiment, and behavior patterns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Smart Alerts</CardTitle>
              <CardDescription>
                Get notified when clients show churn signals before it's too late
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Automated Actions</CardTitle>
              <CardDescription>
                AI-generated retention strategies and automated follow-up workflows
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Sentiment Analysis</CardTitle>
              <CardDescription>
                Understand client emotions from every interaction using advanced AI
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>NPS & CSAT Surveys</CardTitle>
              <CardDescription>
                Collect and analyze feedback with automated survey distribution
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Visualize trends, track retention metrics, and measure success
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, transparent pricing</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Starter</CardTitle>
              <div className="text-3xl font-bold mt-4">$29<span className="text-lg font-normal text-gray-600">/mo</span></div>
              <CardDescription>Perfect for small teams</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Up to 50 clients
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Basic health scoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Email surveys
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  1 team member
                </li>
              </ul>
              <Link href="/auth/signup" className="block mt-6">
                <Button className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-blue-600 border-2">
            <CardHeader>
              <div className="text-sm font-semibold text-blue-600 mb-2">MOST POPULAR</div>
              <CardTitle>Growth</CardTitle>
              <div className="text-3xl font-bold mt-4">$99<span className="text-lg font-normal text-gray-600">/mo</span></div>
              <CardDescription>For growing businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Up to 500 clients
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Advanced AI insights
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Automation rules
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Up to 5 team members
                </li>
              </ul>
              <Link href="/auth/signup" className="block mt-6">
                <Button className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scale</CardTitle>
              <div className="text-3xl font-bold mt-4">$299<span className="text-lg font-normal text-gray-600">/mo</span></div>
              <CardDescription>For enterprises</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Unlimited clients
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Custom AI models
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Advanced automation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Unlimited team members
                </li>
              </ul>
              <Link href="/auth/signup" className="block mt-6">
                <Button className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 ClientPulse AI. Built with ❤️ by Antigravity AI.</p>
        </div>
      </footer>
    </div>
  )
}
