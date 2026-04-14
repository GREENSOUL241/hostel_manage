import { useEffect, useState } from 'react'
import CrudPage from '../components/shared/CrudPage'
import Badge from '../components/ui/Badge'
import Topbar from '../components/Layout/Topbar'
import { createStudent, deleteStudent, getRooms, getStudents, updateStudent } from '../services/api'

export default function Students() {
  const [roomOptions, setRoomOptions] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getRooms({ page: 1, limit: 1000 })
        const rooms = response.data.data || []
        setRoomOptions(rooms.map((room) => ({ label: `${room.Room_No} (${room.S_ID ? 'Occupied' : 'Vacant'})`, value: room.Room_No })))
      } catch (err) {
        console.error(err)
        setRoomOptions([])
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <Topbar title="Students" subtitle="Manage resident profiles and room assignments." />
      <CrudPage
        title="Students"
        subtitle="Create, update, and assign hostel residents to rooms."
        rowKey="S_ID"
        listFetcher={getStudents}
        createFetcher={createStudent}
        updateFetcher={updateStudent}
        deleteFetcher={deleteStudent}
        searchPlaceholder="Search by name or S_ID"
        columns={[
          { key: 'S_ID', label: 'S_ID' },
          { key: 'full_name', label: 'Full Name', render: (row) => [row.Fname, row.Minit, row.Lname].filter(Boolean).join(' ') },
          { key: 'GENDER', label: 'Gender', render: (row) => <Badge tone={row.GENDER === 'M' ? 'indigo' : row.GENDER === 'F' ? 'red' : 'amber'}>{row.GENDER}</Badge> },
          { key: 'Room_No', label: 'Room_No' },
          { key: 'ADDRESS', label: 'Address' },
        ]}
        fields={[
          { name: 'Fname', label: 'First Name', placeholder: 'Aman' },
          { name: 'Minit', label: 'Middle Initial', placeholder: 'K', defaultValue: '' },
          { name: 'Lname', label: 'Last Name', placeholder: 'Verma' },
          { name: 'GENDER', label: 'Gender', type: 'select', options: ['M', 'F', 'Other'] },
          { name: 'ADDRESS', label: 'Address', type: 'textarea', fullWidth: true },
          { name: 'Room_No', label: 'Room Assignment', type: 'select', options: [{ label: 'Unassigned', value: '' }, ...roomOptions] },
        ]}
        filters={[
          { name: 'gender', label: 'Gender', type: 'select', options: ['M', 'F', 'Other'] },
          { name: 'room_no', label: 'Room No', type: 'select', options: roomOptions },
        ]}
        mapItemToForm={(item) => ({ ...item, Room_No: item.Room_No ?? '' })}
        mapFormToPayload={(form) => ({
          ...form,
          Room_No: form.Room_No === '' ? null : Number(form.Room_No),
          Minit: form.Minit === '' ? null : form.Minit,
        })}
      />
    </div>
  )
}
