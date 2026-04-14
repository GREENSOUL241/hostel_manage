import { useEffect, useState } from 'react'
import CrudPage from '../components/shared/CrudPage'
import Badge from '../components/ui/Badge'
import Topbar from '../components/Layout/Topbar'
import { createRoom, deleteRoom, getRooms, getStudents, updateRoom } from '../services/api'

export default function Rooms() {
  const [studentOptions, setStudentOptions] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getStudents({ page: 1, limit: 1000 })
        const students = response.data.data || []
        setStudentOptions(students.map((student) => ({ label: `${student.S_ID} - ${[student.Fname, student.Minit, student.Lname].filter(Boolean).join(' ')}${student.Room_No ? ` (Room ${student.Room_No})` : ''}`, value: student.S_ID })))
      } catch (err) {
        console.error(err)
        setStudentOptions([])
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <Topbar title="Rooms" subtitle="Track occupancy and assign students to room records." />
      <CrudPage
        title="Rooms"
        subtitle="Track occupancy and assign students to rooms."
        rowKey="Room_No"
        listFetcher={getRooms}
        createFetcher={createRoom}
        updateFetcher={updateRoom}
        deleteFetcher={deleteRoom}
        searchPlaceholder="Search room number, floor, or type"
        columns={[
          { key: 'Room_No', label: 'Room_No' },
          { key: 'Floor_no', label: 'Floor_no' },
          { key: 'Room_Type', label: 'Room_Type', render: (row) => <Badge tone="indigo">{row.Room_Type}</Badge> },
          { key: 'assigned_student', label: 'Assigned Student', render: (row) => row.assigned_student ? [row.assigned_student.Fname, row.assigned_student.Minit, row.assigned_student.Lname].filter(Boolean).join(' ') : 'Unassigned' },
          { key: 'status', label: 'Status', render: (row) => <Badge tone={row.status === 'Occupied' ? 'green' : 'amber'}>{row.status}</Badge> },
        ]}
        fields={[
          { name: 'Room_No', label: 'Room Number', type: 'number' },
          { name: 'Floor_no', label: 'Floor Number', type: 'number' },
          { name: 'Room_Type', label: 'Room Type', type: 'select', options: ['Single', 'Double', 'Triple'] },
          { name: 'S_ID', label: 'Assigned Student', type: 'select', options: [{ label: 'Unassigned', value: '' }, ...studentOptions] },
        ]}
        filters={[
          { name: 'Room_Type', label: 'Room Type', type: 'select', options: ['Single', 'Double', 'Triple'] },
        ]}
        mapItemToForm={(item) => ({ ...item, S_ID: item.S_ID ?? '' })}
        mapFormToPayload={(form) => ({
          ...form,
          S_ID: form.S_ID === '' ? null : Number(form.S_ID),
        })}
      />
    </div>
  )
}
