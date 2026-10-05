import { supabase } from '../config/supabase-config';


const POST_WITH_AUTHOR = '*,author:profiles(username,avatar_url)';

const POST_WITH_FULL_DETAILS = `${POST_WITH_AUTHOR}, comments(count), votes(rating)`;

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
    .select(POST_WITH_AUTHOR)
    .eq('id', postID)
    .maybeSingle();


    if (error) {
        throw error;
    }
  return data;
}

export const getPosts = async (oldest = false) => {
    const {data, error } = await supabase
    .from ('posts')
    .select(POST_WITH_FULL_DETAILS)
    .order('created_at', { ascending: oldest });



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
    .select(POST_WITH_AUTHOR)
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



export const getPostCount = async () => {
  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count;
};


export const searchPosts = async (term, oldest = false) => {
  const { data, error} = await supabase
  .from('posts')
  .select(POST_WITH_FULL_DETAILS)
  .or(`title.ilike.%${term}%,content.ilike.%${term}%`)
  .order('created_at', { ascending: oldest });


  if (error) {
    throw error;
  }

  return data;
};


export const getNewestPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_WITH_AUTHOR)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw error;
  }

  return data;
};

export const getMostCommentedPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_WITH_FULL_DETAILS);

  if (error) {
    throw error;
  }

  const sorted = [...data].sort(
    (a, b) => b.comments[0].count - a.comments[0].count
  );

  return sorted.slice(0, 10);
};


export const getPostsByAuthor = async (authorID) => {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_WITH_FULL_DETAILS)
    .eq("author_id", authorID)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};