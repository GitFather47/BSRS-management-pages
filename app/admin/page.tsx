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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Calendar, LogOut, Users, Trash2, Edit, CalendarDays } from "lucide-react"

const eventFormSchema = z.object({
  name: z.string().min(1, { message: "Event name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  segment: z.string().min(1, { message: "Segment is required" }),
  eligibleClasses: z.string().min(1, { message: "Eligible classes are required" }),
})

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [caProfiles, setCaProfiles] = useState<any[]>([])
  const [participantProfiles, setParticipantProfiles] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [adminActions, setAdminActions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      date: "",
      segment: "",
      eligibleClasses: "",
    },
  })

  useEffect(() => {
    // Check if user is logged in and is an admin
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(currentUser)
    if (parsedUser.role !== "Admin") {
      router.push("/")
      return
    }

    setUser(parsedUser)

    // Load data from localStorage
    const allEvents = JSON.parse(localStorage.getItem("events") || "[]")
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const allCaProfiles = JSON.parse(localStorage.getItem("caProfiles") || "[]")
    const allParticipantProfiles = JSON.parse(localStorage.getItem("participantProfiles") || "[]")
    const allRegistrations = JSON.parse(localStorage.getItem("eventRegistrations") || "[]")
    const allAdminActions = JSON.parse(localStorage.getItem("adminActions") || "[]")

    setEvents(allEvents)
    setUsers(allUsers)
    setCaProfiles(allCaProfiles)
    setParticipantProfiles(allParticipantProfiles)
    setRegistrations(allRegistrations)
    setAdminActions(allAdminActions)
  }, [router])

  useEffect(() => {
    if (selectedEvent && isEditing) {
      form.setValue("name", selectedEvent.name)
      form.setValue("description", selectedEvent.description)
      form.setValue("date", new Date(selectedEvent.date).toISOString().split("T")[0])
      form.setValue("segment", selectedEvent.segment)
      form.setValue("eligibleClasses", JSON.stringify(selectedEvent.eligible_classes))
    } else {
      form.reset()
    }
  }, [selectedEvent, isEditing, form])

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    if (!user) return

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let eligibleClasses
      try {
        eligibleClasses = JSON.parse(values.eligibleClasses)
      } catch (e) {
        eligibleClasses = values.eligibleClasses.split(",").map((c) => c.trim())
      }

      if (isEditing && selectedEvent) {
        // Update existing event
        const updatedEvent = {
          ...selectedEvent,
          name: values.name,
          description: values.description,
          date: new Date(values.date).toISOString(),
          segment: values.segment,
          eligible_classes: eligibleClasses,
          updated_at: new Date().toISOString(),
        }

        // Update in localStorage
        const updatedEvents = events.map((e) => (e.event_id === selectedEvent.event_id ? updatedEvent : e))

        localStorage.setItem("events", JSON.stringify(updatedEvents))
        setEvents(updatedEvents)

        // Log admin action
        logAdminAction("updated", "event", selectedEvent.event_id)

        toast({
          title: "Event updated",
          description: "The event has been updated successfully",
        })
      } else {
        // Create new event
        const newEvent = {
          event_id: uuidv4(),
          name: values.name,
          description: values.description,
          date: new Date(values.date).toISOString(),
          segment: values.segment,
          eligible_classes: eligibleClasses,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Save to localStorage
        const updatedEvents = [...events, newEvent]
        localStorage.setItem("events", JSON.stringify(updatedEvents))
        setEvents(updatedEvents)

        // Log admin action
        logAdminAction("created", "event", newEvent.event_id)

        toast({
          title: "Event created",
          description: "The event has been created successfully",
        })
      }

      // Reset form and state
      form.reset()
      setSelectedEvent(null)
      setIsEditing(false)
    } catch (error) {
      toast({
        title: isEditing ? "Update failed" : "Creation failed",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function deleteEvent(eventId: string) {
    if (!user) return

    // Check if there are registrations for this event
    const eventRegistrations = registrations.filter((r) => r.event_id === eventId)
    if (eventRegistrations.length > 0) {
      toast({
        title: "Cannot delete event",
        description: "There are participants registered for this event",
        variant: "destructive",
      })
      return
    }

    // Remove event from localStorage
    const updatedEvents = events.filter((e) => e.event_id !== eventId)
    localStorage.setItem("events", JSON.stringify(updatedEvents))
    setEvents(updatedEvents)

    // Log admin action
    logAdminAction("deleted", "event", eventId)

    toast({
      title: "Event deleted",
      description: "The event has been deleted successfully",
    })
  }

  function logAdminAction(actionType: string, targetEntity: string, targetId: string) {
    if (!user) return

    const action = {
      action_id: uuidv4(),
      admin_user_id: user.user_id,
      action_type: actionType,
      target_entity: targetEntity,
      target_id: targetId,
      action_details: {},
      performed_at: new Date().toISOString(),
    }

    // Save to localStorage
    const updatedActions = [...adminActions, action]
    localStorage.setItem("adminActions", JSON.stringify(updatedActions))
    setAdminActions(updatedActions)
  }

  function handleLogout() {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  function editEvent(event: any) {
    setSelectedEvent(event)
    setIsEditing(true)
  }

  function cancelEdit() {
    setSelectedEvent(null)
    setIsEditing(false)
    form.reset()
  }

  function getUserById(userId: string) {
    return users.find((u) => u.user_id === userId)
  }

  function getEventById(eventId: string) {
    return events.find((e) => e.event_id === eventId)
  }

  function getCaProfileByUserId(userId: string) {
    return caProfiles.find((p) => p.user_id === userId)
  }

  function getParticipantProfileByUserId(userId: string) {
    return participantProfiles.find((p) => p.user_id === userId)
  }

  if (!user) {
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
          <h1 className="text-3xl font-bold text-purple-900">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="events" className="text-lg">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger value="users" className="text-lg">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-lg">
              <CalendarDays className="h-4 w-4 mr-2" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <div className="grid grid-cols-1 gap-8">
              <Card className="shadow-lg">
                <CardHeader className="bg-violet-600 text-white">
                  <CardTitle>{isEditing ? "Edit Event" : "Create New Event"}</CardTitle>
                  <CardDescription className="text-violet-100">
                    {isEditing ? "Update event details" : "Add a new event to the system"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter event name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter event description" className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="segment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Segment</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Technical, Cultural" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="eligibleClasses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Eligible Classes</FormLabel>
                            <FormControl>
                              <Input placeholder='e.g., ["1st Year", "2nd Year"] or comma-separated list' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        {isEditing && (
                          <Button type="button" variant="outline" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        )}
                        <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
                          {isLoading
                            ? isEditing
                              ? "Updating..."
                              : "Creating..."
                            : isEditing
                              ? "Update Event"
                              : "Create Event"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="bg-violet-600 text-white">
                  <CardTitle>Manage Events</CardTitle>
                  <CardDescription className="text-violet-100">View, edit, and delete events</CardDescription>
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
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Array.isArray(event.eligible_classes) ? (
                                  event.eligible_classes.map((cls: string, idx: number) => (
                                    <Badge key={idx} variant="outline">
                                      {cls}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge variant="outline">{JSON.stringify(event.eligible_classes)}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" onClick={() => editEvent(event)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => deleteEvent(event.event_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4 text-sm text-muted-foreground">
                            <p>Registrations: {registrations.filter((r) => r.event_id === event.event_id).length}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No events created yet</p>
                      <p>Use the form above to create your first event</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="grid grid-cols-1 gap-8">
              <Card className="shadow-lg">
                <CardHeader className="bg-violet-600 text-white">
                  <CardTitle>User Management</CardTitle>
                  <CardDescription className="text-violet-100">View and manage all users in the system</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">All Users ({users.length})</h3>
                      <div className="flex gap-2">
                        <Badge className="bg-purple-600">
                          {users.filter((u) => u.role === "Participant").length} Participants
                        </Badge>
                        <Badge className="bg-indigo-600">
                          {users.filter((u) => u.role === "CampusAmbassador").length} CAs
                        </Badge>
                        <Badge className="bg-violet-600">{users.filter((u) => u.role === "Admin").length} Admins</Badge>
                      </div>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Joined</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.user_id}>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.mobile_number}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    user.role === "Admin"
                                      ? "bg-violet-600"
                                      : user.role === "CampusAmbassador"
                                        ? "bg-indigo-600"
                                        : "bg-purple-600"
                                  }
                                >
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>{user.class}</TableCell>
                              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="shadow-lg">
                  <CardHeader className="bg-indigo-600 text-white">
                    <CardTitle>Campus Ambassadors</CardTitle>
                    <CardDescription className="text-indigo-100">View campus ambassador details</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {caProfiles.length > 0 ? (
                      <div className="space-y-4">
                        {caProfiles.map((profile) => {
                          const profileUser = getUserById(profile.user_id)
                          const referralCount = registrations.filter(
                            (r) => r.ca_referral_code === profile.ca_code,
                          ).length

                          return (
                            <div key={profile.ca_id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{profileUser?.email}</h3>
                                  <p className="text-sm text-muted-foreground">Code: {profile.ca_code}</p>
                                  <p className="text-sm text-muted-foreground">
                                    College: {profile.college_name || "Not specified"}
                                  </p>
                                </div>
                                <Badge className="bg-indigo-600">{referralCount} Referrals</Badge>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No campus ambassadors registered yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader className="bg-purple-600 text-white">
                    <CardTitle>Participants</CardTitle>
                    <CardDescription className="text-purple-100">View participant details</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {participantProfiles.length > 0 ? (
                      <div className="space-y-4">
                        {participantProfiles.map((profile) => {
                          const profileUser = getUserById(profile.user_id)
                          const userRegistrations = registrations.filter((r) => r.user_id === profile.user_id)

                          return (
                            <div key={profile.profile_id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{profile.full_name || profileUser?.email}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    College: {profile.college_name || "Not specified"}
                                  </p>
                                </div>
                                <Badge className="bg-purple-600">{userRegistrations.length} Events</Badge>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No participants registered yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="shadow-lg">
              <CardHeader className="bg-violet-600 text-white">
                <CardTitle>Activity Log</CardTitle>
                <CardDescription className="text-violet-100">Track all admin actions in the system</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {adminActions.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Admin</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminActions
                          .sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime())
                          .map((action) => {
                            const actionUser = getUserById(action.admin_user_id)
                            let targetName = action.target_id

                            if (action.target_entity === "event") {
                              const event = getEventById(action.target_id)
                              if (event) targetName = event.name
                            } else if (action.target_entity === "user") {
                              const targetUser = getUserById(action.target_id)
                              if (targetUser) targetName = targetUser.email
                            }

                            return (
                              <TableRow key={action.action_id}>
                                <TableCell>{actionUser?.email || "Unknown"}</TableCell>
                                <TableCell className="capitalize">{action.action_type}</TableCell>
                                <TableCell>
                                  <span className="capitalize">{action.target_entity}:</span> {targetName}
                                </TableCell>
                                <TableCell>{new Date(action.performed_at).toLocaleString()}</TableCell>
                              </TableRow>
                            )
                          })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No admin actions logged yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
