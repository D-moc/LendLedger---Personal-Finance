import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import People from "./pages/People";
import Records from "./pages/Records";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import PersonDetails from "./pages/PersonDetails";
import RecordDetails from "./pages/RecordDetails";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==========================================
            PUBLIC ROUTES
        ========================================== */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Password recovery MUST be public */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />


        {/* ==========================================
            PROTECTED ROUTES
        ========================================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/people"
            element={<People />}
          />

          <Route
            path="/people/:personId"
            element={<PersonDetails />}
          />

          <Route
            path="/records"
            element={<Records />}
          />

          <Route
            path="/records/:recordId"
            element={<RecordDetails />}
          />

          <Route
            path="/given"
            element={<Records />}
          />

          <Route
            path="/borrowed"
            element={<Records />}
          />

          <Route
            path="/payments"
            element={<Payments />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;