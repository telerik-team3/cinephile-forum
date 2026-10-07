// Admin dashboard: user management and post moderation, one tab at a time.

import { useState } from 'react';
import UserSearch from '../components/UserSearch';
import PostModeration from '../components/PostModeration';

function Admin() {
  const [tab, setTab] = useState('users');

  return (
    <div>
      <h1>Administration</h1>
      <div>
        <button onClick={() => setTab('users')} disabled={tab === 'users'}>
          Users
        </button>
        <button onClick={() => setTab('posts')} disabled={tab === 'posts'}>
          Posts
        </button>
      </div>
      {tab === 'users' ? <UserSearch /> : <PostModeration />}
    </div>
  );
}

export default Admin;
