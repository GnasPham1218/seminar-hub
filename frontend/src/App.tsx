import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientLayout from "./layouts/ClientLayout";
import Home from "./pages/client/Home";
import EventList from "./pages/client/Events";
import EventDetail from "./pages/client/EventDetail";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEvents from "./pages/admin/Events";
import AdminPapers from "./pages/admin/Papers";
import AdminUsers from "./pages/admin/Users";

import "./index.css";
import MyRegistrations from "./pages/client/MyRegistrations";
import BackupRestore from "./pages/admin/BackupRestore";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";

function App() {
  const isAdmin = localStorage.getItem("currentUserId") === "u003"; // Admin ID

  return (
    <BrowserRouter>
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="events" element={<EventList />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="my-registrations" element={<MyRegistrations />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
        </Route>

        {/* Admin Routes */}
        {isAdmin && (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="papers" element={<AdminPapers />} />
            <Route path="backup-restore" element={<BackupRestore />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
