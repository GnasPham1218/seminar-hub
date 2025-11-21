import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ClientLayout from './layouts/ClientLayout'
import Home from './assets/client/Home'
import EventList from './assets/client/Events'
import EventDetail from './assets/client/EventDetail'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminEvents from './pages/admin/Events'
import AdminRegistrations from './pages/admin/Registrations'
import AdminPapers from './pages/admin/Papers'
import AdminUsers from './pages/admin/Users'
import Login from './pages/Login'
import "./index.css";
import MyRegistrations from './assets/client/MyRegistrations'

function App() {
  const isAdmin = localStorage.getItem('currentUserId') === 'u003' // Admin ID

  return (
    <BrowserRouter>
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="events" element={<EventList />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="my-registrations" element={<MyRegistrations />} />
        </Route>

        {/* Admin Routes */}
        {isAdmin && (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="papers" element={<AdminPapers />} />
          </Route>
        )}

        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App