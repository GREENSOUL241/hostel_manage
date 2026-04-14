import { useEffect, useMemo, useState } from 'react'
import { Edit, Plus, Trash2 } from 'lucide-react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import Modal from '../ui/Modal'
import Table from '../ui/Table'
import SearchBar from './SearchBar'
import Pagination from './Pagination'
import LoadingSpinner from './LoadingSpinner'

function buildInitialForm(fields, existing) {
  return fields.reduce((accumulator, field) => {
    accumulator[field.name] = existing?.[field.name] ?? field.defaultValue ?? ''
    return accumulator
  }, {})
}

function renderField(field, value, onChange) {
  const baseClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100'
  const options = field.options || []

  if (field.type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        rows={field.rows || 4}
        className={baseClass}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <select value={value ?? ''} onChange={(event) => onChange(event.target.value)} className={baseClass}>
        <option value="">{field.placeholder || `Select ${field.label}`}</option>
        {options.map((option) => {
          const optionValue = typeof option === 'object' ? option.value : option
          const optionLabel = typeof option === 'object' ? option.label : option
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          )
        })}
      </select>
    )
  }

  return (
    <input
      type={field.type || 'text'}
      value={value}
      onChange={(event) => onChange(field.type === 'number' ? (event.target.value === '' ? '' : Number(event.target.value)) : event.target.value)}
      placeholder={field.placeholder}
      className={baseClass}
    />
  )
}

export default function CrudPage({
  title,
  subtitle,
  columns,
  fields,
  listFetcher,
  createFetcher,
  updateFetcher,
  deleteFetcher,
  rowKey,
  searchPlaceholder = 'Search records...',
  filters = [],
  initialValues = {},
  mapItemToForm,
  mapFormToPayload,
  extraActions,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
}) {
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState(() => Object.fromEntries(filters.map((field) => [field.name, ''])))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(() => buildInitialForm(fields, initialValues))

  const queryParams = useMemo(() => {
    const params = { page: pagination.page, limit: pagination.limit }
    if (search) params.search = search
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params[key] = value
      }
    })
    return params
  }, [filterValues, pagination.page, pagination.limit, search])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await listFetcher(queryParams)
      const listData = response?.data?.data || []
      setItems(listData)
      setPagination((current) => ({
        ...current,
        page: queryParams.page || current.page,
        limit: queryParams.limit || current.limit,
        total: listData.length,
        pages: 1,
      }))
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load records')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [queryParams.page, queryParams.limit, search, JSON.stringify(filterValues)])

  const openCreate = () => {
    setEditingItem(null)
    setForm(buildInitialForm(fields, initialValues))
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setForm(buildInitialForm(fields, mapItemToForm ? mapItemToForm(item) : item))
    setModalOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = mapFormToPayload ? mapFormToPayload(form, editingItem) : form
    try {
      if (editingItem) {
        await updateFetcher(editingItem[rowKey], payload)
      } else {
        await createFetcher(payload)
      }
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save record')
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete this ${title.toLowerCase().replace(/s$/, '')}?`)) return
    try {
      await deleteFetcher(item[rowKey])
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete record')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            {extraActions}
            {allowCreate ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add {title.replace(/s$/, '')}
              </Button>
            ) : null}
          </div>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_repeat(auto-fit,minmax(180px,220px))]">
          <SearchBar value={search} onChange={setSearch} placeholder={searchPlaceholder} />
          {filters.map((filter) => (
            <label key={filter.name} className="flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
              {filter.type === 'select' ? (
                <select
                  value={filterValues[filter.name]}
                  onChange={(event) => setFilterValues((current) => ({ ...current, [filter.name]: event.target.value }))}
                  className="w-full bg-transparent text-sm outline-none"
                >
                  <option value="">{filter.placeholder || filter.label}</option>
                  {(filter.options || []).map((option) => {
                    const optionValue = typeof option === 'object' ? option.value : option
                    const optionLabel = typeof option === 'object' ? option.label : option
                    return (
                      <option key={optionValue} value={optionValue}>
                        {optionLabel}
                      </option>
                    )
                  })}
                </select>
              ) : (
                <input
                  type={filter.type || 'text'}
                  value={filterValues[filter.name]}
                  onChange={(event) => setFilterValues((current) => ({ ...current, [filter.name]: event.target.value }))}
                  placeholder={filter.placeholder || filter.label}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              )}
            </label>
          ))}
        </div>
      </Card>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <Table
          columns={columns}
          data={items}
          rowKey={rowKey}
          emptyState={`No ${title.toLowerCase()} found.`}
          actions={allowEdit || allowDelete ? (item) => (
            <div className="flex flex-wrap gap-2">
              {allowEdit ? (
                <Button variant="secondary" className="px-3 py-2" onClick={() => openEdit(item)}>
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              ) : null}
              {allowDelete ? (
                <Button variant="danger" className="px-3 py-2" onClick={() => handleDelete(item)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              ) : null}
            </div>
          ) : null}
        />
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(value) => setPagination((current) => ({ ...current, page: value }))} />

      <Modal
        open={modalOpen}
        title={`${editingItem ? 'Edit' : 'Add'} ${title.replace(/s$/, '')}`}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
              <span className="text-sm font-semibold text-slate-700">{field.label}</span>
              {renderField(field, form[field.name], (value) => setForm((current) => ({ ...current, [field.name]: value }))) }
            </label>
          ))}
        </form>
      </Modal>
    </div>
  )
}
