import { useEffect, useState } from 'react'
import { getStudentProfile, updateStudentProfile } from '../../services/api'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function MyProfile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ Fname: '', Minit: '', Lname: '', ADDRESS: '' })
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getStudentProfile()
      const data = res.data.data || null
      setProfile(data)
      setForm({
        Fname: data?.Fname || '',
        Minit: data?.Minit || '',
        Lname: data?.Lname || '',
        ADDRESS: data?.ADDRESS || '',
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load profile')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onSave = async () => {
    setSaving(true)
    try {
      await updateStudentProfile(form)
      await load()
      setEditMode(false)
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading profile..." />
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
  if (!profile) return <Card><p className="text-sm text-slate-500">Profile not found.</p></Card>

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-slate-900">My Profile</h2>
        {!editMode ? (
          <Button variant="secondary" onClick={() => setEditMode(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
            <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold text-slate-700">First Name</span>
          <input
            value={form.Fname}
            onChange={(event) => setForm((prev) => ({ ...prev, Fname: event.target.value }))}
            disabled={!editMode}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 disabled:bg-slate-100"
          />
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Middle Initial</span>
          <input
            value={form.Minit}
            onChange={(event) => setForm((prev) => ({ ...prev, Minit: event.target.value.slice(0, 1) }))}
            disabled={!editMode}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 disabled:bg-slate-100"
          />
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Last Name</span>
          <input
            value={form.Lname}
            onChange={(event) => setForm((prev) => ({ ...prev, Lname: event.target.value }))}
            disabled={!editMode}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 disabled:bg-slate-100"
          />
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Gender</span>
          <input value={profile.GENDER || ''} disabled className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2" />
        </label>

        <label className="block text-sm md:col-span-2">
          <span className="font-semibold text-slate-700">Address</span>
          <textarea
            value={form.ADDRESS}
            onChange={(event) => setForm((prev) => ({ ...prev, ADDRESS: event.target.value }))}
            disabled={!editMode}
            className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 disabled:bg-slate-100"
          />
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Email</span>
          <input value={profile.email || ''} disabled className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2" />
        </label>

        <label className="block text-sm">
          <span className="font-semibold text-slate-700">Room No</span>
          <input value={profile.Room_No || '-'} disabled className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2" />
        </label>
      </div>
    </Card>
  )
}
