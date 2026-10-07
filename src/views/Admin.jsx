// Admin dashboard

import UserSearch from '../components/UserSearch';
import PostModeration from '../components/PostModeration';

function Admin() {
  return (
    <div>
      <h1>Administration</h1>
      <UserSearch />
      <PostModeration />
    </div>
  );
}

export default Admin;
