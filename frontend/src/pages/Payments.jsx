import { useEffect, useState } from 'react'
import CrudPage from '../components/shared/CrudPage'
import Badge from '../components/ui/Badge'
import Topbar from '../components/Layout/Topbar'
import { createPayment, deletePayment, getPayments, getStudents } from '../services/api'

export default function Payments() {
  const [studentOptions, setStudentOptions] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getStudents({ page: 1, limit: 1000 })
        const students = response.data.data || []
        setStudentOptions(students.map((student) => ({ label: `${student.S_ID} - ${[student.Fname, student.Minit, student.Lname].filter(Boolean).join(' ')}`, value: student.S_ID })))
      } catch (err) {
        console.error(err)
        setStudentOptions([])
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <Topbar title="Payments" subtitle="Create and filter payment entries by student and date." />
      <CrudPage
        title="Payments"
        subtitle="Record student payments and inspect the payment history."
        rowKey="Payment_ID"
        listFetcher={getPayments}
        createFetcher={createPayment}
        updateFetcher={null}
        deleteFetcher={deletePayment}
        searchPlaceholder="Search payments"
        columns={[
          { key: 'Payment_ID', label: 'Payment_ID' },
          { key: 'student_name', label: 'Student Name' },
          { key: 'Paymentdate', label: 'Payment Date' },
          { key: 'Mode', label: 'Mode', render: (row) => <Badge tone="indigo">{row.Mode}</Badge> },
        ]}
        fields={[
          { name: 'Student_ID', label: 'Student', type: 'select', options: studentOptions },
          { name: 'Paymentdate', label: 'Payment Date', type: 'date' },
          { name: 'Mode', label: 'Mode', type: 'select', options: ['Cash', 'UPI', 'Card', 'Bank Transfer'] },
        ]}
        filters={[
          { name: 'student_id', label: 'Student', type: 'select', options: studentOptions },
          { name: 'date_from', label: 'From', type: 'date' },
          { name: 'date_to', label: 'To', type: 'date' },
        ]}
        mapItemToForm={(item) => ({ ...item, Student_ID: item.Student_ID ?? '' })}
        mapFormToPayload={(form) => ({
          ...form,
          Student_ID: Number(form.Student_ID),
        })}
        allowEdit={false}
        extraActions={<span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">Total payments are tracked as record count in this schema</span>}
      />
    </div>
  )
}
