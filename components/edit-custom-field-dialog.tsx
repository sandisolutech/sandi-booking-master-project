"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import { updateCustomField, type CustomField, type FieldType } from "@/app/admin/settings/custom-fields/actions"
import { useToast } from "@/hooks/use-toast"

interface EditCustomFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  field: CustomField
}

export function EditCustomFieldDialog({ open, onOpenChange, field }: EditCustomFieldDialogProps) {
  const [title, setTitle] = useState("")
  const [customKey, setCustomKey] = useState("")
  const [fieldType, setFieldType] = useState<FieldType>("text")
  const [isRequired, setIsRequired] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [placeholder, setPlaceholder] = useState("")
  const [options, setOptions] = useState<string[]>([])
  const [newOption, setNewOption] = useState("")
  const [minValue, setMinValue] = useState("")
  const [maxValue, setMaxValue] = useState("")
  const [stepValue, setStepValue] = useState("")
  const [acceptTypes, setAcceptTypes] = useState("")
  const [multipleFiles, setMultipleFiles] = useState(false)
  const [maxLength, setMaxLength] = useState("")
  const [pattern, setPattern] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialize form with field data
  useEffect(() => {
    if (field) {
      setTitle(field.title)
      setCustomKey(field.customKey || "")
      setFieldType(field.fieldType)
      setIsRequired(field.isRequired)
      setIsActive(field.isActive)
      setPlaceholder(field.placeholder || "")
      setOptions(field.options || [])
      setMinValue(field.minValue || "")
      setMaxValue(field.maxValue || "")
      setStepValue(field.stepValue || "")
      setAcceptTypes(field.acceptTypes || "")
      setMultipleFiles(field.multipleFiles || false)
      setMaxLength(field.maxLength ? field.maxLength.toString() : "")
      setPattern(field.pattern || "")
    }
  }, [field])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a field title.",
        variant: "destructive",
      })
      return
    }

    if ((fieldType === "select" || fieldType === "multiple_select" || fieldType === "radio" || fieldType === "tag") && options.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one option for select/multiple select/radio/tag fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const result = await updateCustomField({
      id: field.id,
      title: title.trim(),
      customKey: customKey.trim() || undefined,
      fieldType,
      isRequired,
      isActive,
      placeholder: placeholder.trim() || undefined,
      options: (fieldType === "select" || fieldType === "multiple_select" || fieldType === "radio" || fieldType === "tag") ? options : undefined,
      minValue: minValue.trim() || undefined,
      maxValue: maxValue.trim() || undefined,
      stepValue: stepValue.trim() || undefined,
      acceptTypes: acceptTypes.trim() || undefined,
      multipleFiles: fieldType === "file" ? multipleFiles : undefined,
      maxLength: maxLength ? parseInt(maxLength) : undefined,
      pattern: pattern.trim() || undefined,
    })

    if (result.success) {
      toast({
        title: "Success!",
        description: result.message || "Custom field has been updated.",
      })
      onOpenChange(false)
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update custom field.",
        variant: "destructive",
      })
    }
    setIsSubmitting(false)
  }

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()])
      setNewOption("")
    }
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addOption()
    }
  }

  const fieldTypeOptions = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "email", label: "Email" },
    { value: "password", label: "Password" },
    { value: "tel", label: "Phone/Tel" },
    { value: "url", label: "URL" },
    { value: "search", label: "Search" },
    { value: "date", label: "Date" },
    { value: "time", label: "Time" },
    { value: "datetime-local", label: "DateTime" },
    { value: "month", label: "Month" },
    { value: "week", label: "Week" },
    { value: "color", label: "Color Picker" },
    { value: "range", label: "Range Slider" },
    { value: "file", label: "File Upload" },
    { value: "checkbox", label: "Checkbox" },
    { value: "radio", label: "Radio Buttons" },
    { value: "textarea", label: "Textarea" },
    { value: "select", label: "Select Dropdown" },
    { value: "multiple_select", label: "Multiple Select" },
    { value: "tag", label: "Tag Input" },
  ]

  const requiresOptions = fieldType === "select" || fieldType === "multiple_select" || fieldType === "radio" || fieldType === "tag"
  const requiresMinMax = fieldType === "number" || fieldType === "range" || fieldType === "date" || fieldType === "time" || fieldType === "datetime-local"
  const requiresStep = fieldType === "number" || fieldType === "range"
  const requiresAcceptTypes = fieldType === "file"
  const requiresMaxLength = fieldType === "text" || fieldType === "textarea" || fieldType === "password" || fieldType === "search"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Custom Field</DialogTitle>
          <DialogDescription>
            Update the custom field configuration.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Field Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Special Requirements, Dietary Preferences"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Custom Key */}
          <div className="space-y-2">
            <Label htmlFor="customKey">Custom Key</Label>
            <Input
              id="customKey"
              placeholder="e.g., special_requirements, dietary_preferences"
              value={customKey}
              onChange={(e) => {
                // Allow only lowercase letters, numbers, and underscores
                const value = e.target.value.replace(/[^a-z0-9_]/g, '')
                setCustomKey(value)
              }}
            />
            <p className="text-sm text-muted-foreground">
              Optional unique identifier for API and integration purposes. Use lowercase letters, numbers, and underscores only.
            </p>
          </div>

          {/* Field Type */}
          <div className="space-y-2">
            <Label htmlFor="fieldType">Field Type *</Label>
            <Select value={fieldType} onValueChange={(value: FieldType) => setFieldType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                {fieldTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Placeholder */}
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder Text</Label>
            <Input
              id="placeholder"
              placeholder="Enter placeholder text..."
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Optional hint text that appears in the input field.
            </p>
          </div>

          {/* Required Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="required">Required Field</Label>
              <p className="text-sm text-muted-foreground">
                Make this field mandatory for users to fill out.
              </p>
            </div>
            <Switch
              id="required"
              checked={isRequired}
              onCheckedChange={setIsRequired}
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active">Active Field</Label>
              <p className="text-sm text-muted-foreground">
                Control whether this field appears in booking forms.
              </p>
            </div>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Options for Select/Multiple Select/Radio/Tag */}
          {requiresOptions && (
            <div className="space-y-3">
              <Label>
                {fieldType === "tag" ? "Tag Suggestions" : "Options *"}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder={fieldType === "tag" ? "Add a tag suggestion..." : "Add an option..."}
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={addOption} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {options.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {fieldType === "tag" ? "Current suggestions:" : "Current options:"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {option}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => removeOption(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Min/Max Values for Number/Range/Date inputs */}
          {requiresMinMax && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minValue">Minimum Value</Label>
                <Input
                  id="minValue"
                  placeholder={fieldType === "date" ? "2024-01-01" : "0"}
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxValue">Maximum Value</Label>
                <Input
                  id="maxValue"
                  placeholder={fieldType === "date" ? "2024-12-31" : "100"}
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step Value for Number/Range inputs */}
          {requiresStep && (
            <div className="space-y-2">
              <Label htmlFor="stepValue">Step Value</Label>
              <Input
                id="stepValue"
                placeholder="1"
                value={stepValue}
                onChange={(e) => setStepValue(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                The increment value for number/range inputs.
              </p>
            </div>
          )}

          {/* Accept Types for File input */}
          {requiresAcceptTypes && (
            <div className="space-y-2">
              <Label htmlFor="acceptTypes">Accepted File Types</Label>
              <Input
                id="acceptTypes"
                placeholder=".pdf,.doc,.docx,.jpg,.png"
                value={acceptTypes}
                onChange={(e) => setAcceptTypes(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Comma-separated file extensions or MIME types.
              </p>
            </div>
          )}

          {/* Multiple Files for File input */}
          {fieldType === "file" && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="multipleFiles">Allow Multiple Files</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to select multiple files at once.
                </p>
              </div>
              <Switch
                id="multipleFiles"
                checked={multipleFiles}
                onCheckedChange={setMultipleFiles}
              />
            </div>
          )}

          {/* Max Length for Text inputs */}
          {requiresMaxLength && (
            <div className="space-y-2">
              <Label htmlFor="maxLength">Maximum Length</Label>
              <Input
                id="maxLength"
                type="number"
                placeholder="255"
                value={maxLength}
                onChange={(e) => setMaxLength(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of characters allowed.
              </p>
            </div>
          )}

          {/* Pattern for Text inputs */}
          {requiresMaxLength && (
            <div className="space-y-2">
              <Label htmlFor="pattern">Validation Pattern (Regex)</Label>
              <Input
                id="pattern"
                placeholder="^[a-zA-Z0-9]*$"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Optional regex pattern for input validation.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Field"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
