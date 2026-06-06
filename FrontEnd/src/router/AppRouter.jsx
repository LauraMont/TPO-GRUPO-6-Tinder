import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

//import Login from "../pages/Login";
import Register from "../pages/Register";
import CrearPerfil from "../pages/CrearPerfil";
import Swipe from "../pages/Swipe";
import EventCreate from "../pages/EventCreate";
import EventDashboard from "../pages/EventDashboard";

function AppRouter() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<EventDashboard />}
        />

        <Route
          path="/register-evento"
          element={<EventCreate />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/crear-perfil"
          element={<CrearPerfil />}
        />

        <Route
          path="/swipe"
          element={<Swipe />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRouter;