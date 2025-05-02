"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Calendar, LogOut, User, CalendarDays } from "lucide-react"

const profileFormSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  collegeName: z.string().min(1, { message: "Institution name is required" }),
  bio: z.string(),
})

const registrationFormSchema = z.object({
  caReferralCode: z.string().optional(),
})

export default function ParticipantPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      collegeName: "",
      bio: "",
    },
  })

  const registrationForm = useForm<z.infer<typeof registrationFormSchema>>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      caReferralCode: "",
    },
  })

  useEffect(() => {
    // Check if user is logged in and is a participant
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(currentUser)
    if (parsedUser.role !== "Participant") {
      router.push("/")
      return
    }

    setUser(parsedUser)

    // Get participant profile
    const participantProfiles = JSON.parse(localStorage.getItem("participantProfiles") || "[]")
    const userProfile = participantProfiles.find((p: any) => p.user_id === parsedUser.user_id)

    if (userProfile) {
      setProfile(userProfile)

      // Set form values
      form.setValue("fullName", userProfile.full_name || "")
      form.setValue("collegeName", userProfile.college_name || "")
      form.setValue("bio", userProfile.bio || "")
    }

    // Get events
    const allEvents = JSON.parse(localStorage.getItem("events") || "[]")
    setEvents(allEvents)

    // Get user registrations
    const eventRegistrations = JSON.parse(localStorage.getItem("eventRegistrations") || "[]")
    const userRegistrations = eventRegistrations.filter((r: any) => r.user_id === parsedUser.user_id)
    setRegistrations(userRegistrations)
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
        full_name: values.fullName,
        college_name: values.collegeName,
        bio: values.bio,
        updated_at: new Date().toISOString(),
      }

      // Update in localStorage
      const participantProfiles = JSON.parse(localStorage.getItem("participantProfiles") || "[]")
      const updatedProfiles = participantProfiles.map((p: any) =>
        p.profile_id === profile.profile_id ? updatedProfile : p,
      )

      localStorage.setItem("participantProfiles", JSON.stringify(updatedProfiles))
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

  async function registerForEvent(values: z.infer<typeof registrationFormSchema>) {
    if (!user || !selectedEvent) return

    setIsRegistering(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if already registered
      const eventRegistrations = JSON.parse(localStorage.getItem("eventRegistrations") || "[]")
      const alreadyRegistered = eventRegistrations.some(
        (r: any) => r.user_id === user.user_id && r.event_id === selectedEvent.event_id,
      )

      if (alreadyRegistered) {
        toast({
          title: "Already registered",
          description: "You are already registered for this event",
          variant: "destructive",
        })
        setIsRegistering(false)
        return
      }

      // Validate CA code if provided
      const caCode = values.caReferralCode
      if (caCode) {
        const caProfiles = JSON.parse(localStorage.getItem("caProfiles") || "[]")
        const validCode = caProfiles.some((p: any) => p.ca_code === caCode)

        if (!validCode) {
          toast({
            title: "Invalid referral code",
            description: "The campus ambassador referral code is invalid",
            variant: "destructive",
          })
          setIsRegistering(false)
          return
        }
      }

      // Create registration
      const registration = {
        registration_id: uuidv4(),
        user_id: user.user_id,
        event_id: selectedEvent.event_id,
        ca_referral_code: caCode || null,
        registered_at: new Date().toISOString(),
      }

      // Save to localStorage
      eventRegistrations.push(registration)
      localStorage.setItem("eventRegistrations", JSON.stringify(eventRegistrations))

      // Update local state
      setRegistrations([...registrations, registration])

      toast({
        title: "Registration successful",
        description: `You have successfully registered for ${selectedEvent.name}`,
      })

      // Reset form and close dialog
      registrationForm.reset()
      setSelectedEvent(null)
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  function isRegisteredForEvent(eventId: string) {
    return registrations.some((r) => r.event_id === eventId)
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
          <h1 className="text-3xl font-bold text-purple-900">Participant Dashboard</h1>
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
            <TabsTrigger value="events" className="text-lg">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-1 shadow-lg">
                <CardHeader className="bg-purple-600 text-white">
                  <CardTitle>Participant Info</CardTitle>
                  <CardDescription className="text-purple-100">Your account details</CardDescription>
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
                    <h3 className="font-medium text-sm text-muted-foreground">Registered Events</h3>
                    <p className="text-2xl font-bold text-purple-600">{registrations.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 shadow-lg">
                <CardHeader className="bg-purple-600 text-white">
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription className="text-purple-100">Update your participant profile</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="collegeName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your instiution name" {...field} />
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
                              <Textarea placeholder="Tell us about yourself" className="min-h-[120px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                        {isLoading ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="grid grid-cols-1 gap-8">
              <Card className="shadow-lg">
                <CardHeader className="bg-purple-600 text-white">
                  <CardTitle>Available Events</CardTitle>
                  <CardDescription className="text-purple-100">Browse and register for upcoming events</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {events.length > 0 ? (
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div key={event.event_id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">{event.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Date: {new Date(event.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">Segment: {event.segment}</p>
                              <p className="mt-2">{event.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge>{event.segment}</Badge>
                              {isRegisteredForEvent(event.event_id) ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Registered
                                </Badge>
                              ) : (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-purple-600 hover:bg-purple-700"
                                      onClick={() => setSelectedEvent(event)}
                                    >
                                      Register
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Register for {selectedEvent?.name}</DialogTitle>
                                      <DialogDescription>
                                        Complete your registration for this event. You can optionally add a campus
                                        ambassador referral code.
                                      </DialogDescription>
                                    </DialogHeader>

                                    <Form {...registrationForm}>
                                      <form
                                        onSubmit={registrationForm.handleSubmit(registerForEvent)}
                                        className="space-y-4"
                                      >
                                        <FormField
                                          control={registrationForm.control}
                                          name="caReferralCode"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Campus Ambassador Referral Code (Optional)</FormLabel>
                                              <FormControl>
                                                <Input placeholder="Enter CA referral code" {...field} />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />

                                        <DialogFooter>
                                          <Button
                                            type="submit"
                                            className="bg-purple-600 hover:bg-purple-700"
                                            disabled={isRegistering}
                                          >
                                            {isRegistering ? "Registering..." : "Complete Registration"}
                                          </Button>
                                        </DialogFooter>
                                      </form>
                                    </Form>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No events available at the moment</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="bg-purple-600 text-white">
                  <CardTitle>Your Registrations</CardTitle>
                  <CardDescription className="text-purple-100">Events you have registered for</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {registrations.length > 0 ? (
                    <div className="space-y-4">
                      {registrations.map((registration) => {
                        const event = events.find((e) => e.event_id === registration.event_id)
                        if (!event) return null

                        return (
                          <div key={registration.registration_id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-lg">{event.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Registered on: {new Date(registration.registered_at).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Event Date: {new Date(event.date).toLocaleDateString()}
                                </p>
                                {registration.ca_referral_code && (
                                  <p className="text-sm mt-2">Referred by: {registration.ca_referral_code}</p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge>{event.segment}</Badge>
                                <div className="flex items-center gap-1 text-sm">
                                  <CalendarDays className="h-4 w-4" />
                                  <span>{new Date(event.date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't registered for any events yet</p>
                      <p>Browse the available events and register to participate!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
