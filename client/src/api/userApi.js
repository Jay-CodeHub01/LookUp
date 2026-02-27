// src/api/userApi.js
import API from './axios';

export const getUserProfile = (username) => API.get(`/users/${username}`);

export const searchUsers = (query) => API.get(`/users/search?q=${query}`);

export const updateProfile = (data) => API.put('/users/profile', data);

export const updateProfilePicture = (formData) =>
  API.put('/users/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProfilePicture = () => API.delete('/users/profile-picture');

export const updateCoverPhoto = (formData) =>
  API.put('/users/cover-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const togglePrivacy = () => API.put('/users/toggle-privacy');

export const followUser = (userId) => API.post(`/users/${userId}/follow`);

export const unfollowUser = (userId) => API.post(`/users/${userId}/unfollow`);

export const cancelRequest = (userId) => API.delete(`/users/${userId}/cancel-request`);

export const removeFollower = (userId) => API.delete(`/users/${userId}/remove-follower`);

export const getFollowRequests = () => API.get('/users/follow-requests');

export const acceptFollowRequest = (id) => API.put(`/users/follow-requests/${id}/accept`);

export const rejectFollowRequest = (id) => API.put(`/users/follow-requests/${id}/reject`);

export const getFollowers = (username) => API.get(`/users/${username}/followers`);

export const getFollowing = (username) => API.get(`/users/${username}/following`);