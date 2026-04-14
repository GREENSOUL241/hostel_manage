import CrudPage from '../components/shared/CrudPage'
import Topbar from '../components/Layout/Topbar'
import { createWarden, deleteWarden, getWardens, updateWarden } from '../services/api'

export default function Wardens() {
  return (
    <div className="space-y-6">
      <Topbar title="Wardens" subtitle="Manage the staff responsible for each hostel." />
      <CrudPage
        title="Wardens"
        subtitle="Maintain the staff roster responsible for hostel oversight."
        rowKey="Warden_ID"
        listFetcher={getWardens}
        createFetcher={createWarden}
        updateFetcher={updateWarden}
        deleteFetcher={deleteWarden}
        searchPlaceholder="Search by name or contact"
        columns={[
          { key: 'Warden_ID', label: 'Warden_ID' },
          { key: 'Name', label: 'Name' },
          { key: 'Contact', label: 'Contact' },
          { key: 'Address', label: 'Address' },
          { key: 'manages_hostel', label: 'Manages Hostel', render: (row) => row.manages_hostel || 'None' },
        ]}
        fields={[
          { name: 'Name', label: 'Name', placeholder: 'Aarav Mehta' },
          { name: 'Contact', label: 'Contact', placeholder: '9876543210' },
          { name: 'Address', label: 'Address', type: 'textarea', fullWidth: true },
        ]}
      />
    </div>
  )
}
