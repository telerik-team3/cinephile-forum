// Admin dashboard: user management and post moderation, one tab at a time.

import { useState } from 'react';
import UserSearch from '../components/UserSearch';
import PostModeration from '../components/PostModeration';

function Admin() {
  const [tab, setTab] = useState('users');

  return (
    <div>
      <h1>Administration</h1>
      {/* role="group" makes Pico draw the buttons as one switch. aria-pressed tells
          screen readers and our CSS which tab is selected. */}
      <div role="group">
        <button onClick={() => setTab('users')} aria-pressed={tab === 'users'}>
          Users
        </button>
        <button onClick={() => setTab('posts')} aria-pressed={tab === 'posts'}>
          Posts
        </button>
      </div>
      {tab === 'users' ? <UserSearch /> : <PostModeration />}
    </div>
  );
}

export default Admin;
