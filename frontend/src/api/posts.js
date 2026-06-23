import { api } from "./api";

export const addPost = async (data) => {
    try {
        const response = await api.post(`/post/create`, data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getPostById = async (postId) => {
    try {
        const response = await api.get(`/post/by-id/${postId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getPosts = async (limit, offset) => {
    try {
        const response = await api.get(`/posts/all?limit=${limit}&offset=${offset}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export async function fetchPosts({ cursor = null }) {
    try {
        const params = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
        const res = await api.get('/post/posts' + params);
        return res.data;
    } catch (error) {
        throw error;
    }
}

export const likePost = async (postId) => {
    try {
        const response = await api.post(`/post/like?post_id=${postId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteLike = async (postId) => {
    try {
        const response = await api.delete(`/post/like?post_id=${postId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAlgorithmicFeed = async ({ cursor = null } = {}) => {
    const validCursor = (cursor && typeof cursor === 'string') ? cursor : '';
    try {

        const params = validCursor ? `?cursor=${encodeURIComponent(validCursor)}` : '';
        const res = await api.get('/post/feed' + params);
        return res.data;
    } catch (error) {
        throw error;
    }

}

export const addComment = async (postId, content) => {
    try {
        const response = await api.post(`/post/comment?post_id=${postId}`, { content });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteComment = async (commentId) => {
    try {
        const response = await api.delete(`/post/comment/${commentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addCommentReply = async (commentId, postId, content) => {
    try {
        const response = await api.post(`/post/comment/reply/${commentId}/${postId}`, { content });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;

    }
}

export const getReplyComments = async (commentId) => {
    try {
        const response = await api.get(`/post/comment/reply/${commentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteReplyComment = async (commentId) => {
    try {

        const response = await api.delete(`/post/comment/reply/${commentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deletePost = async (postId) => {
    try {
        const response = await api.delete(`/post/delete/${postId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const editPost = async (postId, content, images, deletedImageIds) => {
    try {
        console.log("Uslo")
        const formData = new FormData();
        formData.append('content', content);
        formData.append('deleted_image_ids', JSON.stringify(deletedImageIds) || []);
        if (images && images.length > 0) {
            images.forEach((image) => {
                formData.append('images', image);
            });
        }

        const response = await api.patch(`/post/${postId}/post`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
        });

        return response.data;
    } catch (error) {
        console.log(error.detail);
        throw error;
    }
}

export const followingFeedPost = async (limit, cursor = null) => {
    try {
        let url = `/post/friends-feed?limit=${limit}`;
        if (cursor) {
            url += `&cursor=${encodeURIComponent(cursor)}`;
        }
        const res = await api.get(url);
        return res.data;
    } catch (error) {
        throw error;
    }
}