"use client"

import React from 'react'
import { CustomField } from "@/app/admin/settings/custom-fields/actions"

interface CustomFieldDisplayProps {
  field: CustomField
  value: any
}

export function CustomFieldDisplay({ field, value }: CustomFieldDisplayProps) {
  if (!value) return null

  const renderValue = () => {
    switch (field.fieldType) {
      case 'checkbox':
      case 'multiple_select':
      case 'tag':
        if (Array.isArray(value) && value.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.map((item, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-1 rounded-sm text-sm ${
                    field.fieldType === 'tag' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          )
        }
        return <span className="text-gray-500">None selected</span>

      case 'file':
        if (value instanceof File) {
          return <span className="text-blue-600">{value.name}</span>
        } else if (Array.isArray(value) && value.length > 0) {
          return (
            <div className="space-y-1">
              {value.map((file, index) => (
                <div key={index} className="text-blue-600">{file.name}</div>
              ))}
            </div>
          )
        }
        return <span className="text-gray-500">No file selected</span>

      case 'color':
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: value }}
            />
            <span className="font-mono">{value}</span>
          </div>
        )

      case 'url':
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {value}
          </a>
        )

      case 'email':
        return (
          <a
            href={`mailto:${value}`}
            className="text-blue-600 hover:underline"
          >
            {value}
          </a>
        )

      case 'tel':
        return (
          <a
            href={`tel:${value}`}
            className="text-blue-600 hover:underline"
          >
            {value}
          </a>
        )

      case 'date':
        try {
          return new Date(value).toLocaleDateString()
        } catch {
          return value
        }

      case 'time':
        return value

      case 'datetime-local':
        try {
          return new Date(value).toLocaleString()
        } catch {
          return value
        }

      case 'textarea':
        return (
          <div className="whitespace-pre-wrap break-words max-w-md">
            {value}
          </div>
        )

      case 'number':
      case 'range':
        return <span className="font-mono">{value}</span>

      default:
        return <span>{value}</span>
    }
  }

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <label className="text-right font-medium text-gray-600">{field.title}:</label>
      <div className="col-span-3">
        {renderValue()}
      </div>
    </div>
  )
}
