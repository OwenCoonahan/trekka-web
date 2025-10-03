import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getUser, getProfile } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Users, Calendar, Globe, ArrowRight, Zap } from 'lucide-react'

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
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo-black.png"
                alt="Trekka"
                width={32}
                height={32}
                className="dark:hidden"
              />
              <Image
                src="/images/logo-white.png"
                alt="Trekka"
                width={32}
                height={32}
                className="hidden dark:block"
              />
              <span className="font-bold text-xl">Trekka</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/login">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              Never miss a friend by 3 days again
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
              See where your friends are traveling
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Stop missing overlaps. Share your travel plans, discover who's going where, and connect with friends around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  See How It Works
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Free forever • No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Problem Statement */}
      <div id="how-it-works" className="bg-muted/30 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            The Problem Every Traveler Faces
          </h2>
          <div className="space-y-4 text-lg text-muted-foreground">
            <p>
              "I found out my friend was in Lisbon 3 days after I left."
            </p>
            <p>
              "I would've extended my stay if I knew Sarah was coming to Bali."
            </p>
            <p>
              "I'm planning Tokyo but have no idea who else will be there."
            </p>
          </div>
          <div className="mt-12 p-8 bg-background rounded-xl border">
            <p className="text-xl font-semibold mb-2">
              Travel plans are scattered across Instagram stories, WhatsApp groups, and random texts.
            </p>
            <p className="text-muted-foreground">
              Trekka brings them all into one place.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Simple travel coordination for you and your friends
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-2">
            <CardHeader>
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Share Your Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Post where you're going and when. Keep your travel calendar up-to-date so friends know where to find you.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">See Your Network</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Follow friends and view their upcoming trips on one timeline. No more scattered Instagram stories or missed connections.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Discover Overlaps</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                See who's in your next destination. Connect with friends, extend your stay, or meet quality travelers in your network.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-muted/30 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Who It's For
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold">Digital Nomads</h3>
              <p className="text-muted-foreground">
                Coordinate with your remote work crew across time zones and continents
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold">Entrepreneurs & Founders</h3>
              <p className="text-muted-foreground">
                Network with other builders while traveling to conferences and hubs
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-4xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold">Frequent Travelers</h3>
              <p className="text-muted-foreground">
                Keep your friend group in sync and never miss a chance to meet up
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Stop Missing Your Friends
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join Trekka today and stay connected with your travel network. It's free, simple, and built for people who move.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required • Takes 2 minutes to set up
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo-black.png"
                alt="Trekka"
                width={24}
                height={24}
                className="dark:hidden"
              />
              <Image
                src="/images/logo-white.png"
                alt="Trekka"
                width={24}
                height={24}
                className="hidden dark:block"
              />
              <span className="font-bold">Trekka</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Trekka. Travel coordination for friends.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}