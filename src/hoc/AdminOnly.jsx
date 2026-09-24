// Accessible to users with administrative rights

import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../state/app.context';

function AdminOnly({ children }) {
  const { user, userData, loading } = useContext(AppContext);
  const location = useLocation();

  // The profile carries the admin flag, so wait for it before deciding.
  if (loading) {
    return <p>Зареждане…</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!userData?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <div>{children}</div>;
}

export default AdminOnly;
