"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  mobileNumber: z.string().min(10, { message: "Mobile number must be at least 10 digits" }),
  password: z.string().min(1, { message: "Please enter your password" }),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mobileNumber: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const users = JSON.parse(localStorage.getItem("users") || "[]")

      // Find user with matching mobile number and password
      const user = users.find(
        (u: any) => u.mobile_number === values.mobileNumber && u.password_hash === values.password,
      )

      if (!user) {
        toast({
          title: "Login failed",
          description: "Invalid mobile number or password",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Store current user for demo purposes
      localStorage.setItem("currentUser", JSON.stringify(user))

      toast({
        title: "Login successful",
        description: "Welcome back!",
      })

      // Redirect based on role
      if (user.role === "Admin") {
        router.push("/admin")
      } else if (user.role === "CampusAmbassador") {
        router.push("/campus-ambassador")
      } else {
        router.push("/participant")
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred during login",
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
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription className="text-purple-100">Access your BSRS Account</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your registered mobile number" {...field} />
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
                      <Input type="password" placeholder="Your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-purple-600 hover:underline">
              Register
            </Link>
          </p>
          <Link href="/" className="text-sm text-purple-600 hover:underline">
            Back to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
