// Company settings data - in a real app, this would come from a database
export interface CompanySettings {
  name: string
  email: string
  phone: string
  address: string
  description: string
  website: string
  supportEmail: string
  bookingTerms: string
  welcomeMessage: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  status: string
}

export const defaultCompanySettings: CompanySettings = {
  name: "BookSpace",
  email: "admin@bookspace.com",
  phone: "+1 (555) 123-4567",
  address: "123 Business St, City, State 12345",
  description: "Professional room booking system for influencers and content creators.",
  website: "https://www.bookspace.com",
  supportEmail: "support@bookspace.com",
  bookingTerms:
    "By booking a room, you agree to arrive on time and follow all facility guidelines. Cancellations must be made at least 24 hours in advance.",
  welcomeMessage:
    "Welcome to our professional booking system! Please select your preferred date, room, and time slot below.",
  primaryColor: "#2563eb", // blue-600
  secondaryColor: "#7c3aed", // purple-600
  status: "active",
}

// Mock function to get company settings - in real app, this would be an API call
export async function getCompanySettings(): Promise<CompanySettings> {
  return defaultCompanySettings
}

// Mock function to update company settings - in real app, this would be an API call
export async function updateCompanySettings(settings: Partial<CompanySettings>): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
}
