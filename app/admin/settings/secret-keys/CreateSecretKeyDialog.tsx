"use client"

import { useState } from "react"
import { createSecretKey, CreateSecretKeyData } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"

export default function CreateSecretKeyDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateSecretKeyData>({
    name: "",
    description: "",
    expiresAt: undefined,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the secret key",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      const result = await createSecretKey({
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Secret key created successfully!",
        })
        setOpen(false)
        setFormData({
          name: "",
          description: "",
          expiresAt: undefined,
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateSecretKeyData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleExpiryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      expiresAt: value ? new Date(value) : undefined,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Secret Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Secret Key</DialogTitle>
            <DialogDescription>
              Create a new API secret key for accessing your booking system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Production API Key"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description of what this key is used for"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={formData.expiresAt ? 
                  new Date(formData.expiresAt.getTime() - formData.expiresAt.getTimezoneOffset() * 60000)
                    .toISOString().slice(0, 16) : ""}
                onChange={(e) => handleExpiryChange(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Leave empty for no expiration
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Secret Key"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
