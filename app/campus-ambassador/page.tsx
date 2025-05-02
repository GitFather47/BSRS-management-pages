"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Copy, LogOut, User, Users } from "lucide-react"

const profileFormSchema = z.object({
  collegeName: z.string().min(1, { message: "College name is required" }),
  bio: z.string(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
})

export default function CampusAmbassadorPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [referrals, setReferrals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      collegeName: "",
      bio: "",
      instagram: "",
      twitter: "",
      linkedin: "",
    },
  })

  useEffect(() => {
    // Check if user is logged in and is a campus ambassador
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(currentUser)
    if (parsedUser.role !== "CampusAmbassador") {
      router.push("/")
      return
    }

    setUser(parsedUser)

    // Get CA profile
    const caProfiles = JSON.parse(localStorage.getItem("caProfiles") || "[]")
    const userProfile = caProfiles.find((p: any) => p.user_id === parsedUser.user_id)

    if (userProfile) {
      setProfile(userProfile)

      // Set form values
      form.setValue("collegeName", userProfile.college_name || "")
      form.setValue("bio", userProfile.bio || "")

      const socialLinks = userProfile.social_links || {}
      form.setValue("instagram", socialLinks.instagram || "")
      form.setValue("twitter", socialLinks.twitter || "")
      form.setValue("linkedin", socialLinks.linkedin || "")
    }

    // Get referrals
    const eventRegistrations = JSON.parse(localStorage.getItem("eventRegistrations") || "[]")
    const userReferrals = eventRegistrations.filter((r: any) => r.ca_referral_code === userProfile?.ca_code)
    setReferrals(userReferrals)
  }, [router, form])

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user || !profile) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update profile
      const updatedProfile = {
        ...profile,
        college_name: values.collegeName,
        bio: values.bio,
        social_links: {
          instagram: values.instagram,
          twitter: values.twitter,
          linkedin: values.linkedin,
        },
        updated_at: new Date().toISOString(),
      }

      // Update in localStorage
      const caProfiles = JSON.parse(localStorage.getItem("caProfiles") || "[]")
      const updatedProfiles = caProfiles.map((p: any) => (p.ca_id === profile.ca_id ? updatedProfile : p))

      localStorage.setItem("caProfiles", JSON.stringify(updatedProfiles))
      setProfile(updatedProfile)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function copyToClipboard(text: string, message: string) {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: message,
    })
  }

  function handleLogout() {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-900">Campus Ambassador Dashboard</h1>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile" className="text-lg">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="referrals" className="text-lg">
              <Users className="h-4 w-4 mr-2" />
              Referrals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-1 shadow-lg">
                <CardHeader className="bg-indigo-600 text-white">
                  <CardTitle>Ambassador Info</CardTitle>
                  <CardDescription className="text-indigo-100">
                    Your ambassador details
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Mobile</h3>
                    <p>{user.mobile_number}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Class</h3>
                    <p>{user.class}</p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Referral Code</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {profile.ca_code}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(profile.ca_code, "Referral code copied to clipboard")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Referral Link</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm truncate">{profile.referral_link}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(profile.referral_link, "Referral link copied to clipboard")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Total Referrals</h3>
                    <p className="text-2xl font-bold text-indigo-600">{referrals.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 shadow-lg">
                <CardHeader className="bg-indigo-600 text-white">
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription className="text-indigo-100">
                    Update your ambassador profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="collegeName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>College Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your college name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about yourself" 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">Social Media Links</h3>
                        
                        <FormField
                          control={form.control}
                          name="instagram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instagram</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Instagram profile URL" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="twitter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Twitter</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Twitter profile URL" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="linkedin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn</FormLabel>
                              <FormControl>
                                <Input placeholder="Your LinkedIn profile URL" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals">
            <Card className="shadow-lg">
              <CardHeader className="bg-indigo-600 text-white">
                <CardTitle>Your Referrals</CardTitle>
                <CardDescription className="text-indigo-100">
                  Track participants who registered using your referral code
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {referrals.length > 0 ? (
                  <div className="space-y-4">
                    {referrals.map((referral, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Registration ID: {referral.registration_id.substring(0, 8)}...</h3>
                            <p className="text-sm text-muted-foreground">Registered on: {new Date(referral.registered_at).toLocaleDateString()}</p>
                          </div>
                          <Badge>Event Registration</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No referrals yet</p>
                    <p>Share your referral code or link with participants to start earning rewards!</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => copyToClipboard(profile.referral_link, "Referral link copied to clipboard")}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Referral Link
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  </div>
  )
}
