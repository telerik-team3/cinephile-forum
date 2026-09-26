// Reads and writes the comments shown on the single-post page.
import { supabase } from '../config/supabase-config';

const COMMENT_WITH_AUTHOR = '*,author:profiles(username,avatar_url)';

export const getCommentsByPostId = async (postID) => {
  const { data, error } = await supabase
    .from('comments')
    .select(COMMENT_WITH_AUTHOR)
    .eq('post_id', postID)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

export const createComment = async (postID, authorID, content) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postID, author_id: authorID, content })
    .select(COMMENT_WITH_AUTHOR)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateComment = async (commentID, content) => {
  const { data, error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', commentID)
    .select(COMMENT_WITH_AUTHOR)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Without .select().single() a delete that RLS blocks would report success
// while the comment stays in the database.
export const deleteComment = async (commentID) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentID)
    .select('id')
    .single();

  if (error) {
    throw error;
  }
};
