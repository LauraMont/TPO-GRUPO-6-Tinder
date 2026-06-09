import { BrowserRouter, Routes, Route } from "react-router-dom";

//import Login from "../pages/Login";
import Register from "../pages/Register";
import CrearPerfil from "../pages/CrearPerfil";
import Swipe from "../pages/Swipe";
import EventCreate from "../pages/EventCreate";
import EventDashboard from "../pages/EventDashboard";
import EventDetail from "../pages/EventDetail";
import Login from "../pages/Login";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/events" element={<EventDashboard />} />

        <Route path="/admin/events/new" element={<EventCreate />} />

        <Route path="/admin/events/edit/:id" element={<EventCreate />} />

        <Route path="/admin/events/detail/:id" element={<EventDetail />} />

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/crear-perfil" element={<CrearPerfil />} />

        <Route path="/swipe" element={<Swipe />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
