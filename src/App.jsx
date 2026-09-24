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
import { getProfileById } from './services/profile.service';


function App() {

  // Tracks the current Supabase session and keeps it in sync across the app.
const [appState, setAppState] = useState({
  user: null,
  userData: null,
  loading: true,
});

useEffect (()=> {
// A visitor without a session has nothing left to load. A signed-in one still
  // needs a profile, so loading stays on until the matching row arrives below.
const applySession = session =>{
  const user = session?.user ?? null;

setAppState(prev =>({
  ...prev,
  user,
  userData : user ? prev.userData: null,
  loading: user? prev.userData?.id !== user.id : false,
}));

};
supabase.auth.getSession().then(({ data:{session} }) =>{
  applySession(session);
});

const {
data:{subscription},} = supabase.auth.onAuthStateChange ((_event,session)=> {
  applySession(session);
});
return () => subscription.unsubscribe();
},[]);

// Loads the profile row, which is what tells the app who is an administrator.
// Kept out of the listener above, because querying from inside that callback
// can deadlock the Supabase client.
useEffect(() => {
  const userId = appState.user?.id;

  if (!userId) {
    return;
  }

  let active = true;

  getProfileById(userId)
    .then(profile => {
      if (active) {
        setAppState(prev => ({ ...prev, userData: profile, loading: false }));
      }
    })
    .catch(error => {
      if (active) {
        console.error('Could not load the profile:', error);
        setAppState(prev => ({ ...prev, userData: null, loading: false }));
      }
    });

  return () => {
    active = false;
  };
}, [appState.user?.id]);


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