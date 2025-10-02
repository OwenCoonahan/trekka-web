import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser, getProfile } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Users, Calendar, Star } from 'lucide-react'

export default async function HomePage() {
  const user = await getUser()

  if (user) {
    const profile = await getProfile()

    // If user is authenticated but hasn't completed onboarding, redirect to onboarding
    if (!profile?.username) {
      redirect('/onboarding')
    }

    // User has completed onboarding, redirect to feed
    redirect('/feed')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Share Your Travel Plans
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create a profile, add your upcoming and past trips, and connect with fellow travelers.
              Share your adventures and discover where your friends are heading next.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/login">
                <Button size="lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Create Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Set up your profile with an avatar, bio, occupation, and social links to share who you are
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Add Your Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Document your past adventures and plan future journeys with destination, dates, and descriptions
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Show Interest</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Mark interest in friends&apos; trips to signal you&apos;d like to join their adventures
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Export to Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Download ICS files to add any trip to your personal calendar and stay organized
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Trekka today and connect with a community of travelers. Share your plans, discover new destinations, and make memories together.
          </p>
          <Link href="/login">
            <Button size="lg">
              Sign Up with Email
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}