import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-lg text-purple-700 max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-4">
      <Image
        src="/bsrs-logo.jpg"
        alt="BSRS Logo"
        width={160}  // or adjust as needed
        height={64}
        className="h-16 w-auto"
        priority
      />
    </div>
            A comprehensive platform for managing  events, participants, and campus ambassadors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-purple-600 text-white">
              <CardTitle>Participants</CardTitle>
              <CardDescription className="text-purple-100">Register for events and manage your profile</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Join exciting events, track your registrations, and connect with other participants.</p>
            </CardContent>
            <CardFooter>
              <Link href="/register" className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Register Now</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-indigo-600 text-white">
              <CardTitle>Campus Ambassadors</CardTitle>
              <CardDescription className="text-indigo-100">Represent your college and earn rewards</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Become a campus ambassador, promote events, and track your referrals.</p>
            </CardContent>
            <CardFooter>
              <Link href="/register?role=CampusAmbassador" className="w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Become an Ambassador</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-violet-600 text-white">
              <CardTitle>Admin Access</CardTitle>
              <CardDescription className="text-violet-100">Manage events and users</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Create and manage events, track registrations, and oversee campus ambassadors.</p>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full bg-violet-600 hover:bg-violet-700">Admin Login</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-purple-700 mb-4">Already registered?</p>
          <Link href="/login">
            <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
              Login to your account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
