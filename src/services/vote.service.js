import { supabase } from '../config/supabase-config';


export const createVote = async (postID, authorID, rating) => {
    const { data, error} = await supabase
    .from('votes')
    .insert({post_id: postID, author_id: authorID, rating})
    .select()
    .single();

    if (error) {
        throw error;
    }


    return data;
}



export const updateVote = async (postID, authorID, rating) => {
    const {data, error} = await supabase
    .from('votes')
    .update({rating})
    .eq('post_id', postID)
    .eq('author_id', authorID)
    .select()
    .single();

    if (error) {
        throw error;
    }

    return data;
}


export const deleteVote = async (postID, authorID) => {
    const {error} = await supabase
    .from('votes')
    .delete()
    .eq('post_id', postID)
    .eq('author_id', authorID)

    if (error) {
        throw error;
    }
}

export const getCurrentVote = async (postID, authorID) => { 
    const {data, error} = await supabase
    .from('votes')
    .select('rating')
    .eq('post_id', postID)
    .eq('author_id', authorID)
    .maybeSingle();

    if (error) {
        throw error;
    }

    return data?.rating ?? 0;
    
}

export const getVoteScore = async (postID) => {
    const {data, error} = await supabase
    .from('votes')
    .select('rating')
    .eq('post_id', postID);
    
    

    if (error) {
        throw error;
    }

    return data.reduce((acc, curr) => acc + curr.rating, 0)
}