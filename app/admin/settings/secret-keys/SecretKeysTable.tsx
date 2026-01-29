"use client"

import { useState } from "react"
import { SecretKey, updateSecretKey, deleteSecretKey, regenerateSecretKey } from "./actions"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { MoreHorizontal, Copy, Eye, EyeOff, RotateCcw, Trash2 } from "lucide-react"

interface SecretKeysTableProps {
  secretKeys: SecretKey[]
}

export default function SecretKeysTable({ secretKeys }: SecretKeysTableProps) {
  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<number | null>(null)
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState<number | null>(null)

  const toggleKeyVisibility = (id: number) => {
    const newVisibleKeys = new Set(visibleKeys)
    if (newVisibleKeys.has(id)) {
      newVisibleKeys.delete(id)
    } else {
      newVisibleKeys.add(id)
    }
    setVisibleKeys(newVisibleKeys)
  }

  const copyToClipboard = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      toast({
        title: "Copied!",
        description: "Secret key copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    const result = await updateSecretKey({ id, isActive: !isActive })
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      })
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    const result = await deleteSecretKey(id)
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      })
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
    setDeleteDialogOpen(null)
  }

  const handleRegenerate = async (id: number) => {
    const result = await regenerateSecretKey(id)
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      })
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
    setRegenerateDialogOpen(null)
  }

  const maskKey = (key: string) => {
    return `${key.substring(0, 8)}${'*'.repeat(20)}${key.substring(key.length - 8)}`
  }

  const getStatusBadge = (secretKey: SecretKey) => {
    if (!secretKey.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    if (secretKey.expiresAt && new Date(secretKey.expiresAt) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  if (secretKeys.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No secret keys created yet.</p>
        <p className="text-sm text-gray-400 mt-1">Create your first secret key to get started with the API.</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {secretKeys.map((secretKey) => (
            <TableRow key={secretKey.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{secretKey.name}</div>
                  {secretKey.description && (
                    <div className="text-sm text-gray-500">{secretKey.description}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {visibleKeys.has(secretKey.id) ? secretKey.key : maskKey(secretKey.key)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleKeyVisibility(secretKey.id)}
                  >
                    {visibleKeys.has(secretKey.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(secretKey.key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(secretKey)}</TableCell>
              <TableCell>
                {secretKey.lastUsed ? (
                  <span title={secretKey.lastUsed.toLocaleString()}>
                    {formatDistanceToNow(secretKey.lastUsed, { addSuffix: true })}
                  </span>
                ) : (
                  <span className="text-gray-400">Never</span>
                )}
              </TableCell>
              <TableCell>
                {secretKey.expiresAt ? (
                  <span 
                    title={secretKey.expiresAt.toLocaleString()}
                    className={new Date(secretKey.expiresAt) < new Date() ? "text-red-600" : ""}
                  >
                    {formatDistanceToNow(secretKey.expiresAt, { addSuffix: true })}
                  </span>
                ) : (
                  <span className="text-gray-400">Never</span>
                )}
              </TableCell>
              <TableCell>
                <span title={secretKey.createdAt.toLocaleString()}>
                  {formatDistanceToNow(secretKey.createdAt, { addSuffix: true })}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleToggleActive(secretKey.id, secretKey.isActive)}
                    >
                      {secretKey.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setRegenerateDialogOpen(secretKey.id)}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Regenerate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(secretKey.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen !== null} onOpenChange={() => setDeleteDialogOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the secret key
              and any applications using it will lose access to the API.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogOpen && handleDelete(deleteDialogOpen)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate Confirmation Dialog */}
      <AlertDialog open={regenerateDialogOpen !== null} onOpenChange={() => setRegenerateDialogOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Secret Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a new secret key and invalidate the current one. 
              Any applications using the current key will need to be updated with the new key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => regenerateDialogOpen && handleRegenerate(regenerateDialogOpen)}
            >
              Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
