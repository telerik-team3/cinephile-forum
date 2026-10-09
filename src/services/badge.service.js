// Reads the numbers that decide which badges a user has earned (#47).
import { supabase } from '../config/supabase-config';

export const getBadgeStats = async (userID) => {
const {data,error} = await supabase
.rpc('get_badge_stats',{target_user:userID})
.single();

if (error) {
  throw error;
}

return data;
};

