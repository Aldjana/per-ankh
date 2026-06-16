import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Boards from "../pages/Boards";
import Board from "../pages/Board";
import BoardKanbanTab from "../pages/board/BoardKanbanTab";
import BoardListTab from "../pages/board/BoardListTab";
import BoardTimelineTab from "../pages/board/BoardTimelineTab";
import BoardCalendarTab from "../pages/board/BoardCalendarTab";
import BoardProgressTab from "../pages/board/BoardProgressTab";
import BoardNotesTab from "../pages/board/BoardNotesTab";
import BoardMembersTab from "../pages/board/BoardMembersTab";
import Notifications from "../pages/Notifications";
import Search from "../pages/Search";
import Settings from "../pages/Settings";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/boards" replace />;
  }

  return children;
};

function LegacyRedirect({ to }) {
  return <Navigate to={to} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/boards" replace />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/boards"
        element={
          <PrivateRoute>
            <Boards />
          </PrivateRoute>
        }
      />

      <Route
        path="/board/:workspaceId"
        element={
          <PrivateRoute>
            <Board />
          </PrivateRoute>
        }
      >
        <Route index element={<BoardKanbanTab />} />
        <Route path="list" element={<BoardListTab />} />
        <Route path="timeline" element={<BoardTimelineTab />} />
        <Route path="calendar" element={<BoardCalendarTab />} />
        <Route path="progress" element={<BoardProgressTab />} />
        <Route path="notes" element={<BoardNotesTab />} />
        <Route path="members" element={<BoardMembersTab />} />
      </Route>

      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <Search />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />

    </Routes>
  );
}
