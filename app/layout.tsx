import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Initialize demo data
            if (typeof window !== 'undefined') {
              // Check if data is already initialized
              if (!localStorage.getItem("dataInitialized")) {
                // Create demo events
                const events = [
                  {
                    event_id: "e1b9d5a0-1c2d-4e5f-8g9h-0i1j2k3l4m5n",
                    name: "Hackathon 2023",
                    description: "A 24-hour coding competition to build innovative solutions.",
                    date: new Date("2023-12-15").toISOString(),
                    segment: "Technical",
                    eligible_classes: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  {
                    event_id: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p",
                    name: "Cultural Night",
                    description: "A night of music, dance, and cultural performances.",
                    date: new Date("2023-12-20").toISOString(),
                    segment: "Cultural",
                    eligible_classes: ["All Years"],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  {
                    event_id: "p1q2r3s4-t5u6-v7w8-x9y0-z1a2b3c4d5e",
                    name: "Debate Competition",
                    description: "A platform to showcase your debating skills on current topics.",
                    date: new Date("2023-12-18").toISOString(),
                    segment: "Literary",
                    eligible_classes: ["2nd Year", "3rd Year", "4th Year"],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                ];
                
                localStorage.setItem("events", JSON.stringify(events));
                localStorage.setItem("users", JSON.stringify([]));
                localStorage.setItem("caProfiles", JSON.stringify([]));
                localStorage.setItem("participantProfiles", JSON.stringify([]));
                localStorage.setItem("eventRegistrations", JSON.stringify([]));
                localStorage.setItem("adminActions", JSON.stringify([]));
                
                // Mark as initialized
                localStorage.setItem("dataInitialized", "true");
              }
            }
          `,
          }}
        />
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
