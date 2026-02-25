// src/api/postApi.js
import API from './axios';

export const getFeed = (page = 1, limit = 10) =>
  API.get(`/posts/feed?page=${page}&limit=${limit}`);

export const getExplorePosts = (page = 1, limit = 10) =>
  API.get(`/posts/explore?page=${page}&limit=${limit}`);

export const getUserPosts = (username, page = 1) =>
  API.get(`/posts/user/${username}?page=${page}`);

export const getHashtagPosts = (tag, page = 1) =>
  API.get(`/posts/hashtag/${tag}?page=${page}`);

export const createPost = (formData) =>
  API.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getPost = (postId) => API.get(`/posts/${postId}`);

export const updatePost = (postId, data) => API.put(`/posts/${postId}`, data);

export const deletePost = (postId) => API.delete(`/posts/${postId}`);

export const likePost = (postId) => API.post(`/posts/${postId}/like`);

export const unlikePost = (postId) => API.post(`/posts/${postId}/unlike`);

export const getPostLikes = (postId) => API.get(`/posts/${postId}/likes`);

export const addComment = (postId, data) =>
  API.post(`/posts/${postId}/comments`, data);

export const getComments = (postId) => API.get(`/posts/${postId}/comments`);

export const deleteComment = (postId, commentId) =>
  API.delete(`/posts/${postId}/comments/${commentId}`);

export const getCommentReplies = (postId, commentId) =>
  API.get(`/posts/${postId}/comments/${commentId}/replies`);

export const likeComment = (postId, commentId) =>
  API.post(`/posts/${postId}/comments/${commentId}/like`);

export const unlikeComment = (postId, commentId) =>
  API.post(`/posts/${postId}/comments/${commentId}/unlike`);