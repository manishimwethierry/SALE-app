import { Navigate } from "react-router-dom";
import { auth } from "../auth";

function ProtectedRoute({ children }) {
  const token = auth.getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
