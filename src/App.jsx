import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Authenticated from './hoc/Authenticated';
import AdminOnly from './hoc/AdminOnly';
import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import Feed from './views/Feed';
import SinglePost from './views/SinglePost';
import CreatePost from './views/CreatePost';
import UserProfile from './views/UserProfile';
import Admin from './views/Admin';
import NotFound from './views/NotFound';

import { useEffect, useState } from 'react';
import { AppContext } from './state/app.context';
import { supabase } from './config/supabase-config';

function App() {

  // Tracks the current Supabase session and keeps it in sync across the app.
const [appState, setAppState] = useState({
  user: null,
  userData: null,
  loading: true,
});

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setAppState(prev => ({
      ...prev,
      user: session?.user ?? null,
      loading: false,
    }));
  });

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setAppState(prev => ({
      ...prev,
      user: session?.user ?? null,
      loading: false,
    }));
  });

  return () => subscription.unsubscribe();
}, []);

  return (
    <BrowserRouter>
      <AppContext.Provider value={{ ...appState, setAppState }}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<Authenticated><Feed /></Authenticated>} />
          <Route path="/posts/:id" element={<Authenticated><SinglePost /></Authenticated>} />
          <Route path="/create-post" element={<Authenticated><CreatePost /></Authenticated>} />
          <Route path="/profile" element={<Authenticated><UserProfile /></Authenticated>} />
          <Route path="/admin" element={<AdminOnly><Admin /></AdminOnly>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppContext.Provider>
    </BrowserRouter>
  );
}
export default App;