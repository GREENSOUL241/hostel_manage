import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export const login = (data) => api.post('/api/v1/auth/login', data)
export const registerStudent = (data) => api.post('/api/v1/auth/register', data)
export const getMe = () => api.get('/api/v1/auth/me')

export const getStudents = (params) => api.get('/api/v1/students', { params })
export const getStudent = (id) => api.get(`/api/v1/students/${id}`)
export const createStudent = (data) => api.post('/api/v1/students', data)
export const updateStudent = (id, data) => api.put(`/api/v1/students/${id}`, data)
export const deleteStudent = (id) => api.delete(`/api/v1/students/${id}`)
export const assignRoom = (sid, roomNo) => api.post(`/api/v1/students/${sid}/assign-room/${roomNo}`)

export const getRooms = (params) => api.get('/api/v1/rooms', { params })
export const createRoom = (data) => api.post('/api/v1/rooms', data)
export const updateRoom = (id, data) => api.put(`/api/v1/rooms/${id}`, data)
export const deleteRoom = (id) => api.delete(`/api/v1/rooms/${id}`)

export const getHostels = (params) => api.get('/api/v1/hostels', { params })
export const createHostel = (data) => api.post('/api/v1/hostels', data)
export const updateHostel = (name, data) => api.put(`/api/v1/hostels/${name}`, data)
export const deleteHostel = (name) => api.delete(`/api/v1/hostels/${name}`)
export const assignWarden = (hostelName, wardenId) => api.post(`/api/v1/hostels/${hostelName}/assign-warden/${wardenId}`)

export const getWardens = (params) => api.get('/api/v1/wardens', { params })
export const createWarden = (data) => api.post('/api/v1/wardens', data)
export const updateWarden = (id, data) => api.put(`/api/v1/wardens/${id}`, data)
export const deleteWarden = (id) => api.delete(`/api/v1/wardens/${id}`)

export const getPayments = (params) => api.get('/api/v1/payments', { params })
export const createPayment = (data) => api.post('/api/v1/payments', data)
export const deletePayment = (id) => api.delete(`/api/v1/payments/${id}`)

export const getStudentProfile = () => api.get('/api/v1/student/profile')
export const updateStudentProfile = (data) => api.put('/api/v1/student/profile', data)
export const getAvailableRooms = (params) => api.get('/api/v1/student/rooms/available', { params })
export const bookRoom = (data) => api.post('/api/v1/student/book', data)
export const getMyBooking = () => api.get('/api/v1/student/booking')
export const cancelBooking = (id) => api.delete(`/api/v1/student/booking/${id}`)
export const getMyPayments = () => api.get('/api/v1/student/payments')
export const makePayment = (data) => api.post('/api/v1/student/payments', data)

export const getAllBookings = (params) => api.get('/api/v1/bookings', { params })
export const approveBooking = (id) => api.put(`/api/v1/bookings/${id}/approve`)
export const rejectBooking = (id) => api.put(`/api/v1/bookings/${id}/reject`)

export default api
