import { supabase } from '../config/supabase-config';

export const createPost = async (authorID, title, content) => {
    const {data,error} = await supabase
    .from ('posts')
    .insert({author_id: authorID, title, content})
    .select()
    .single();


    if (error) {
        throw error;
    }

 return data;
}


export const getPostById = async (postID) => {
    const {data, error} = await supabase
    .from ('posts')
    .select('*,author:profiles(username,avatar_url)')
    .eq('id', postID)
    .maybeSingle();


    if (error) {
        throw error;
    }
  return data;
}

export const getPosts = async () => {
    const {data, error } = await supabase
    .from ('posts')
    .select('*,author:profiles(username,avatar_url)')
    .order('created_at', { ascending: false });



    if (error) {
        throw error;
    }

  return data;
}


export const updatePost = async (postID, title, content) => {
    const {data, error} = await supabase
    .from ('posts')
    .update({title, content})
    .eq('id', postID)
    .select()
    .single();

    if (error) {
        throw error;
    }

  return data;
}


export const deletePost = async (postID) => {
    const {error} = await supabase
    .from ('posts')
    .delete()
    .eq('id', postID);

    if (error) {
        throw error;
    }
}