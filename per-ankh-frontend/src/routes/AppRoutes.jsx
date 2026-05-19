import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Workspaces from "../pages/Workspaces";
import Kanban from "../pages/Kanban";
import Notes from "../pages/Notes";
import Notifications from "../pages/Notifications";
import Files from "../pages/Files";
import Tasks from "../pages/Tasks";

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
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
            />

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
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />

            <Route
                path="/workspaces"
                element={
                    <PrivateRoute>
                        <Workspaces />
                    </PrivateRoute>
                }
            />


            <Route
                path="/tasks"
                element={
                    <PrivateRoute>
                        <Tasks />
                    </PrivateRoute>
                }
            />
            <Route
                path="/kanban"
                element={
                    <PrivateRoute>
                        <Kanban />
                    </PrivateRoute>
                }
            />
            <Route
                path="/notes/:workspaceId"
                element={
                    <PrivateRoute>
                        <Notes />
                    </PrivateRoute>
                }
            />

            <Route
                path="/notifications"
                element={
                    <PrivateRoute>
                        <Notifications />
                    </PrivateRoute>
                }
            />

            <Route
                path="/files"
                element={
                    <PrivateRoute>
                        <Files />
                    </PrivateRoute>
                }
            />
        </Routes>
    );
}