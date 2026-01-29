"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Clock } from "lucide-react"
import { AddRoundDialog } from "@/components/add-round-dialog"
import { EditRoundDialog } from "@/components/edit-round-dialog"
import { getTimeRounds, deleteTimeRound, type TimeRound } from "@/app/admin/settings/time-rounds/actions"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

export function TimeRoundsList() {
  const [timeRounds, setTimeRounds] = useState<TimeRound[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddRound, setShowAddRound] = useState(false)
  const [showEditRound, setShowEditRound] = useState(false)
  const [selectedTimeRound, setSelectedTimeRound] = useState<TimeRound | null>(null)
  const { t } = useLanguage()
  const { toast } = useToast()

  const fetchTimeRounds = async () => {
    setLoading(true)
    const fetchedRounds = await getTimeRounds()
    setTimeRounds(fetchedRounds)
    setLoading(false)
  }

  useEffect(() => {
    fetchTimeRounds()
  }, [showAddRound, showEditRound]) // Re-fetch when AddRoundDialog or EditRoundDialog closes

  const handleEditRound = (timeRound: TimeRound) => {
    setSelectedTimeRound(timeRound)
    setShowEditRound(true)
  }

  const handleDeleteRound = async (id: number) => {
    if (window.confirm(t.confirmDeleteTimeRound)) {
      const result = await deleteTimeRound(id)
      if (result.success) {
        toast({
          title: "Success!",
          description: t.deleteSuccess,
        })
        setTimeRounds(timeRounds.filter((round) => round.id !== id)) // Optimistically update UI
      } else {
        toast({
          title: "Error",
          description: result.message || t.errorOccurred,
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold">{t.manageTimeRounds}</CardTitle>
        <Button onClick={() => setShowAddRound(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t.addTimeRound}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <p>{t.loading}</p>
          </div>
        ) : timeRounds.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{t.noTimeRoundsFound}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.timeRoundName}</TableHead>
                <TableHead>{t.startTime}</TableHead>
                <TableHead>{t.endTime}</TableHead>
                <TableHead>Booking Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeRounds.map((round) => (
                <TableRow key={round.id}>
                  <TableCell className="font-medium">{round.name}</TableCell>
                  <TableCell>{round.startTime}</TableCell>
                  <TableCell>{round.endTime}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      {round.bookingLimit} max
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      round.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {round.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditRound(round)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteRound(round.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <AddRoundDialog open={showAddRound} onOpenChange={setShowAddRound} />
      <EditRoundDialog 
        open={showEditRound} 
        onOpenChange={setShowEditRound}
        timeRound={selectedTimeRound}
      />
    </Card>
  )
}
