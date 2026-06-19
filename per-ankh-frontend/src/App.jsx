import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function App() {
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}