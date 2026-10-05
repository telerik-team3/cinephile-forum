// Reads profile rows that back the signed-in user's application data.
import { supabase } from '../config/supabase-config';

export const getProfileById = async (userID) => {
const {data,error} =await supabase 
.from ('profiles')
.select('*')
.eq('id',userID)
.maybeSingle();

if (error) {
  throw error;
}

return data;
}


export const getUserCount = async () => {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count;
};

// Searches users for the admin dashboard. The database function checks that the
// caller is an admin, and only it can read the users' emails.
export const searchUsers = async(searchTerm) =>{
  const {data,error} = await supabase.rpc('admin_search_users',{search_term: searchTerm});
  if (error){
    throw error;
  }
  return data;
};