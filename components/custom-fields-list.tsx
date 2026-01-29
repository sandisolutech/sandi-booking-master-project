"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2, Settings } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddCustomFieldDialog } from "@/components/add-custom-field-dialog"
import { EditCustomFieldDialog } from "@/components/edit-custom-field-dialog"
import { getCustomFields, deleteCustomField, type CustomField } from "@/app/admin/settings/custom-fields/actions"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

export function CustomFieldsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddField, setShowAddField] = useState(false)
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()
  const { toast } = useToast()

  const fetchCustomFields = async () => {
    setLoading(true)
    const fetchedFields = await getCustomFields()
    setCustomFields(fetchedFields)
    setLoading(false)
  }

  useEffect(() => {
    fetchCustomFields()
  }, [showAddField, editingField])

  const handleDeleteField = async (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      const result = await deleteCustomField(id)
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message || "Custom field deleted successfully.",
        })
        setCustomFields(customFields.filter((field) => field.id !== id))
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete custom field.",
          variant: "destructive",
        })
      }
    }
  }

  const filteredFields = customFields.filter((field) =>
    field.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.fieldType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (field.customKey && field.customKey.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getFieldTypeDisplay = (fieldType: string) => {
    const typeMap: Record<string, string> = {
      text: "Text",
      number: "Number", 
      email: "Email",
      password: "Password",
      tel: "Phone/Tel",
      url: "URL",
      search: "Search",
      date: "Date",
      time: "Time",
      "datetime-local": "DateTime",
      month: "Month",
      week: "Week",
      color: "Color",
      range: "Range",
      file: "File",
      checkbox: "Checkbox",
      radio: "Radio",
      textarea: "Textarea",
      select: "Select",
      multiple_select: "Multi Select",
      tag: "Tag Input"
    }
    return typeMap[fieldType] || fieldType
  }

  const getFieldTypeBadgeVariant = (fieldType: string) => {
    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      text: "default",
      number: "secondary",
      email: "outline",
      password: "destructive",
      tel: "outline", 
      url: "outline",
      search: "default",
      date: "secondary",
      time: "secondary",
      "datetime-local": "secondary",
      month: "secondary",
      week: "secondary",
      color: "default",
      range: "secondary",
      file: "outline",
      checkbox: "default",
      radio: "default",
      textarea: "default",
      select: "secondary",
      multiple_select: "secondary",
      tag: "outline"
    }
    return variantMap[fieldType] || "default"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Custom Form Fields
            </CardTitle>
            <CardDescription>
              Configure custom fields that appear in your booking forms.
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddField(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading custom fields...</p>
          </div>
        ) : filteredFields.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No custom fields found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No fields match your search criteria." : "Get started by creating your first custom field."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddField(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Field
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Custom Key</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell className="font-medium">
                    {field.title}
                    {field.placeholder && (
                      <div className="text-sm text-muted-foreground">
                        Placeholder: {field.placeholder}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {field.customKey ? (
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {field.customKey}
                      </code>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getFieldTypeBadgeVariant(field.fieldType)}>
                      {getFieldTypeDisplay(field.fieldType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={field.isRequired ? "default" : "secondary"}>
                      {field.isRequired ? "Required" : "Optional"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={field.isActive ? "default" : "secondary"}>
                      {field.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{field.orderIndex}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingField(field)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteField(field.id, field.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Dialogs */}
      <AddCustomFieldDialog
        open={showAddField}
        onOpenChange={setShowAddField}
      />

      {editingField && (
        <EditCustomFieldDialog
          open={!!editingField}
          onOpenChange={(open: boolean) => !open && setEditingField(null)}
          field={editingField}
        />
      )}
    </Card>
  )
}
