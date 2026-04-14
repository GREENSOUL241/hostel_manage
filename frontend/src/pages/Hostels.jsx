import { useEffect, useState } from 'react'
import CrudPage from '../components/shared/CrudPage'
import Badge from '../components/ui/Badge'
import Topbar from '../components/Layout/Topbar'
import { createHostel, deleteHostel, getHostels, getWardens, updateHostel } from '../services/api'

export default function Hostels() {
  const [wardenOptions, setWardenOptions] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getWardens({ page: 1, limit: 1000 })
        const wardens = response.data.data || []
        setWardenOptions(wardens.map((warden) => ({ label: `${warden.Warden_ID} - ${warden.Name}`, value: warden.Warden_ID })))
      } catch (err) {
        console.error(err)
        setWardenOptions([])
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <Topbar title="Hostels" subtitle="Maintain hostel records and warden assignments." />
      <CrudPage
        title="Hostels"
        subtitle="Manage hostel locations and assign wardens."
        rowKey="Hostel_name"
        listFetcher={getHostels}
        createFetcher={createHostel}
        updateFetcher={updateHostel}
        deleteFetcher={deleteHostel}
        searchPlaceholder="Search hostel name or location"
        columns={[
          { key: 'Hostel_name', label: 'Hostel_name' },
          { key: 'Hostel_Location', label: 'Location' },
          { key: 'Room_no', label: 'Room Count' },
          { key: 'warden', label: 'Assigned Warden', render: (row) => row.warden ? row.warden.Name : 'Unassigned' },
          { key: 'state', label: 'State', render: (row) => <Badge tone={row.warden ? 'green' : 'amber'}>{row.warden ? 'Managed' : 'Unassigned'}</Badge> },
        ]}
        fields={[
          { name: 'Hostel_name', label: 'Hostel Name', placeholder: 'Alpha Hostel' },
          { name: 'Hostel_Location', label: 'Location', placeholder: 'North Campus' },
          { name: 'Room_no', label: 'Total Rooms', type: 'number' },
          { name: 'Warden_ID', label: 'Assigned Warden', type: 'select', options: [{ label: 'Unassigned', value: '' }, ...wardenOptions] },
        ]}
        mapItemToForm={(item) => ({ ...item, Warden_ID: item.Warden_ID ?? '' })}
        mapFormToPayload={(form) => ({
          ...form,
          Warden_ID: form.Warden_ID === '' ? null : Number(form.Warden_ID),
          Room_no: Number(form.Room_no),
        })}
      />
    </div>
  )
}
