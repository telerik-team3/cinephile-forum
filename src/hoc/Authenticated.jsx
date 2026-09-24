// Accessible only if the user is authenticated, if no go to loggin

import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../state/app.context';

function Authenticated({ children }) {
  const { user, loading } = useContext(AppContext);
  const location = useLocation();

  // Until the session is known, a signed-in user would be mistaken for a visitor.
  if (loading) {
    return <p>Зареждане…</p>;
  }

  // The login page can send the user back here once it is built.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <div>{children}</div>;
}

export default Authenticated;
