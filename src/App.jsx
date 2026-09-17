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

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;