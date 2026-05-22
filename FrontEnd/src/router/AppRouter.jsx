import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import CrearPerfil from "../pages/CrearPerfil";
import Swipe from "../pages/Swipe";

function AppRouter() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
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