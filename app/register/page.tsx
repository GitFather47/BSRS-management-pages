"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

const formSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    mobileNumber: z.string().min(10, { message: "Mobile number must be at least 10 digits" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    role: z.enum(["Admin", "CampusAmbassador", "Participant"]),
    class: z.string().min(1, { message: "Please enter your class" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "Participant"
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
      role: defaultRole as "Admin" | "CampusAmbassador" | "Participant",
      class: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create user object
      const user = {
        user_id: uuidv4(),
        email: values.email,
        mobile_number: values.mobileNumber,
        password_hash: values.password, // In a real app, this would be hashed
        role: values.role,
        class: values.class,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Store in localStorage for demo purposes
      const users = JSON.parse(localStorage.getItem("users") || "[]")

      // Check if mobile number already exists
      if (users.some((u: any) => u.mobile_number === values.mobileNumber)) {
        toast({
          title: "Registration failed",
          description: "Mobile number already registered",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      users.push(user)
      localStorage.setItem("users", JSON.stringify(users))

      // Create profile based on role
      if (values.role === "CampusAmbassador") {
        const caProfile = {
          ca_id: uuidv4(),
          user_id: user.user_id,
          college_name: "",
          ca_code: `CA${Math.floor(10000 + Math.random() * 90000)}`,
          referral_link: `https://bsrs.com/ref/${user.user_id}`,
          bio: "",
          social_links: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const caProfiles = JSON.parse(localStorage.getItem("caProfiles") || "[]")
        caProfiles.push(caProfile)
        localStorage.setItem("caProfiles", JSON.stringify(caProfiles))
      } else if (values.role === "Participant") {
        const participantProfile = {
          profile_id: uuidv4(),
          user_id: user.user_id,
          full_name: "",
          college_name: "",
          bio: "",
          preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const participantProfiles = JSON.parse(localStorage.getItem("participantProfiles") || "[]")
        participantProfiles.push(participantProfile)
        localStorage.setItem("participantProfiles", JSON.stringify(participantProfiles))
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created",
      })

      // Store current user for demo purposes
      localStorage.setItem("currentUser", JSON.stringify(user))

      // Redirect based on role
      if (values.role === "Admin") {
        router.push("/admin")
      } else if (values.role === "CampusAmbassador") {
        router.push("/campus-ambassador")
      } else {
        router.push("/participant")
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="bg-purple-600 text-white">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription className="text-purple-100">Join our college fest management platform</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Participant">Participant</SelectItem>
                        <SelectItem value="CampusAmbassador">Campus Ambassador</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Select your role in the college fest</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class/Year</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 3rd Year, B.Tech CSE" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-600 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
