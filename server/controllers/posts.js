import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import PostMessage from '../models/postMessage.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackDataFile = path.join(__dirname, '..', 'data', 'posts.json');

let fallbackPosts = [];

const loadFallbackPosts = () => {
    try {
        if (fs.existsSync(fallbackDataFile)) {
            const rawPosts = fs.readFileSync(fallbackDataFile, 'utf8');
            fallbackPosts = JSON.parse(rawPosts);
        }
    } catch (error) {
        console.log('Unable to load fallback posts:', error.message);
        fallbackPosts = [];
    }
};

const saveFallbackPosts = () => {
    try {
        fs.mkdirSync(path.dirname(fallbackDataFile), { recursive: true });
        fs.writeFileSync(fallbackDataFile, JSON.stringify(fallbackPosts, null, 2));
    } catch (error) {
        console.log('Unable to save fallback posts:', error.message);
    }
};

const isMongoConnected = () => mongoose.connection.readyState === 1;

loadFallbackPosts();

export const getPosts = async (req, res) => { 
    if (!isMongoConnected()) {
        res.status(200).json(fallbackPosts);
        return;
    }

    try {
        const postMessages = await PostMessage.find();
                
        res.status(200).json(postMessages);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getPost = async (req, res) => { 
    const { id } = req.params;

    try {
        const post = await PostMessage.findById(id);
        
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createPost = async (req, res) => {
    const { title, message, selectedFile, creator, tags } = req.body;

    if (!isMongoConnected()) {
        const newPostMessage = {
            _id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            title,
            message,
            selectedFile,
            creator,
            tags: Array.isArray(tags) ? tags : [],
            likeCount: 0,
            createdAt: new Date().toISOString(),
        };

        fallbackPosts = [newPostMessage, ...fallbackPosts];
        saveFallbackPosts();

        res.status(201).json(newPostMessage);
        return;
    }

    const newPostMessage = new PostMessage({ title, message, selectedFile, creator, tags })

    try {
        await newPostMessage.save();

        res.status(201).json(newPostMessage );
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, message, creator, selectedFile, tags } = req.body;

    if (!isMongoConnected()) {
        const existingPostIndex = fallbackPosts.findIndex((post) => post._id === id);

        if (existingPostIndex === -1) {
            return res.status(404).send(`No post with id: ${id}`);
        }

        const updatedPost = {
            ...fallbackPosts[existingPostIndex],
            creator,
            title,
            message,
            tags: Array.isArray(tags) ? tags : [],
            selectedFile,
            _id: id,
        };

        fallbackPosts[existingPostIndex] = updatedPost;
        saveFallbackPosts();

        return res.json(updatedPost);
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    const updatedPost = { creator, title, message, tags, selectedFile, _id: id };

    await PostMessage.findByIdAndUpdate(id, updatedPost, { new: true });

    res.json(updatedPost);
}

export const deletePost = async (req, res) => {
    const { id } = req.params;

    if (!isMongoConnected()) {
        fallbackPosts = fallbackPosts.filter((post) => post._id !== id);
        saveFallbackPosts();
        return res.json({ message: 'Post deleted successfully.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    try {
        const deletedPost = await PostMessage.findByIdAndDelete(id);

        if (!deletedPost) return res.status(404).send(`No post with id: ${id}`);

        return res.json({ message: 'Post deleted successfully.' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const likePost = async (req, res) => {
    const { id } = req.params;

    if (!isMongoConnected()) {
        const existingPostIndex = fallbackPosts.findIndex((post) => post._id === id);

        if (existingPostIndex === -1) {
            return res.status(404).send(`No post with id: ${id}`);
        }

        const updatedPost = {
            ...fallbackPosts[existingPostIndex],
            likeCount: (fallbackPosts[existingPostIndex].likeCount || 0) + 1,
        };

        fallbackPosts[existingPostIndex] = updatedPost;
        saveFallbackPosts();

        return res.json(updatedPost);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    try {
        // Increment in MongoDB so rapid clicks cannot overwrite one another.
        const updatedPost = await PostMessage.findByIdAndUpdate(
            id,
            { $inc: { likeCount: 1 } },
            { new: true },
        );

        if (!updatedPost) return res.status(404).send(`No post with id: ${id}`);

        return res.json(updatedPost);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


export default router;
