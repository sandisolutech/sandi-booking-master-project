"use client"

import React from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { TagInput } from "@/components/ui/tag-input"
import { X } from "lucide-react"
import { CustomField } from "@/app/admin/settings/custom-fields/actions"

interface DynamicFormFieldProps {
  field: CustomField
  value: any
  onChange: (value: any) => void
  error?: string
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  const renderField = () => {
    switch (field.fieldType) {
      case 'text':
      case 'email':
      case 'password':
      case 'tel':
      case 'url':
      case 'search':
        return (
          <Input
            id={`field-${field.id}`}
            type={field.fieldType}
            placeholder={field.placeholder || field.title}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            maxLength={field.maxLength}
            pattern={field.pattern}
            className="h-11"
          />
        )

      case 'number':
      case 'range':
        return (
          <Input
            id={`field-${field.id}`}
            type={field.fieldType}
            placeholder={field.placeholder || field.title}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            min={field.minValue}
            max={field.maxValue}
            step={field.stepValue}
            className="h-11"
          />
        )

      case 'date':
      case 'time':
      case 'datetime-local':
      case 'month':
      case 'week':
        return (
          <Input
            id={`field-${field.id}`}
            type={field.fieldType}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            min={field.minValue}
            max={field.maxValue}
            className="h-11"
          />
        )

      case 'color':
        return (
          <div className="flex items-center gap-2">
            <Input
              id={`field-${field.id}`}
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              required={field.isRequired}
              className="w-12 h-11 p-1"
            />
            <Input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className="h-11"
            />
          </div>
        )

      case 'file':
        return (
          <Input
            id={`field-${field.id}`}
            type="file"
            onChange={(e) => {
              const files = e.target.files
              if (field.multipleFiles) {
                onChange(files ? Array.from(files) : [])
              } else {
                onChange(files?.[0] || null)
              }
            }}
            required={field.isRequired}
            accept={field.acceptTypes}
            multiple={field.multipleFiles}
            className="h-11"
          />
        )

      case 'textarea':
        return (
          <Textarea
            id={`field-${field.id}`}
            placeholder={field.placeholder || field.title}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            maxLength={field.maxLength}
            className="min-h-[100px]"
          />
        )

      case 'select':
        return (
          <Select 
            value={value || ''} 
            onValueChange={onChange}
            required={field.isRequired}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder={field.placeholder || `Select ${field.title}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiple_select':
        const selectedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            <div className="border rounded-md p-3 min-h-[44px] bg-background">
              {selectedValues.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedValues.map((selectedValue, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-sm text-sm"
                    >
                      {selectedValue}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-primary/20"
                        onClick={() => {
                          const newValues = selectedValues.filter((_, i) => i !== index)
                          onChange(newValues)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">
                  {field.placeholder || `Select ${field.title}`}
                </span>
              )}
            </div>
            <Select
              value=""
              onValueChange={(newValue) => {
                if (!selectedValues.includes(newValue)) {
                  onChange([...selectedValues, newValue])
                }
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Add option..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem 
                    key={index} 
                    value={option}
                    disabled={selectedValues.includes(option)}
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'radio':
        return (
          <RadioGroup
            value={value || ''}
            onValueChange={onChange}
            required={field.isRequired}
          >
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        const checkedValues = Array.isArray(value) ? value : []
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${index}`}
                  checked={checkedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange([...checkedValues, option])
                    } else {
                      onChange(checkedValues.filter(v => v !== option))
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case 'tag':
        return (
          <TagInput
            value={Array.isArray(value) ? value : []}
            onChange={onChange}
            suggestions={field.options || []}
            placeholder={field.placeholder || `Add ${field.title.toLowerCase()}...`}
          />
        )

      default:
        return (
          <Input
            id={`field-${field.id}`}
            placeholder={field.placeholder || field.title}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.isRequired}
            className="h-11"
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      {renderField()}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
