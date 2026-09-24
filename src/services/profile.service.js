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