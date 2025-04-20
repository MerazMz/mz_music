/**
 * YouTube API Helper
 * This file contains helper functions for interacting with the YouTube API
 * directly, without using the YouTube IFrame API for playback.
 */

const YouTubeHelper = (function() {
    // YouTube API Key
    const API_KEY = 'AIzaSyBKyfBYM55sZ5z_J8xNNaMZNQYlmnuU1ys';
    
    // Cache for video data
    const videoCache = {};
    
    /**
     * Search for videos on YouTube
     * @param {string} query - The search query
     * @param {number} maxResults - Maximum number of results to return
     * @returns {Promise} - Resolves to an array of video objects
     */
    async function searchVideos(query, maxResults = 10) {
        console.log('YouTubeHelper: Searching for videos with query:', query);
        
        try {
            const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${API_KEY}`;
            
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                console.log('YouTubeHelper: No search results found');
                return [];
            }
            
            const videoResults = data.items.map(item => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                channelTitle: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : null
            }));
            
            console.log('YouTubeHelper: Found', videoResults.length, 'videos');
            return videoResults;
        } catch (error) {
            console.error('YouTubeHelper: Error searching videos:', error);
            throw error;
        }
    }
    
    /**
     * Get details for a specific YouTube video
     * @param {string} videoId - The YouTube video ID
     * @returns {Promise} - Resolves to a video details object
     */
    async function getVideoDetails(videoId) {
        // Return from cache if available
        if (videoCache[videoId]) {
            console.log('YouTubeHelper: Returning cached video details for', videoId);
            return videoCache[videoId];
        }
        
        console.log('YouTubeHelper: Getting video details for', videoId);
        
        try {
            const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`;
            
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                console.log('YouTubeHelper: Video not found');
                return null;
            }
            
            const videoDetails = {
                videoId: videoId,
                title: data.items[0].snippet.title,
                channelTitle: data.items[0].snippet.channelTitle,
                thumbnail: data.items[0].snippet.thumbnails.high ? data.items[0].snippet.thumbnails.high.url : null,
                duration: data.items[0].contentDetails.duration // ISO 8601 duration format
            };
            
            // Cache the result
            videoCache[videoId] = videoDetails;
            
            return videoDetails;
        } catch (error) {
            console.error('YouTubeHelper: Error getting video details:', error);
            throw error;
        }
    }
    
    /**
     * Check if the YouTube API is accessible
     * @returns {Promise} - Resolves to a boolean indicating if the API is accessible
     */
    async function checkApiAccess() {
        console.log('YouTubeHelper: Checking API access');
        
        try {
            // Try to get details for a known video (Rick Astley's Never Gonna Give You Up)
            const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=${API_KEY}`;
            
            const response = await fetch(apiUrl);
            const success = response.ok;
            
            console.log('YouTubeHelper: API access check result:', success);
            return success;
        } catch (error) {
            console.error('YouTubeHelper: API access check failed:', error);
            return false;
        }
    }
    
    /**
     * Format ISO 8601 duration to minutes:seconds
     * @param {string} isoDuration - ISO 8601 duration string
     * @returns {string} - Formatted duration string (MM:SS)
     */
    function formatDuration(isoDuration) {
        // Parse the ISO 8601 duration
        const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        
        let hours = 0;
        let minutes = 0;
        let seconds = 0;
        
        if (match[1]) hours = parseInt(match[1].slice(0, -1));
        if (match[2]) minutes = parseInt(match[2].slice(0, -1));
        if (match[3]) seconds = parseInt(match[3].slice(0, -1));
        
        // Convert hours to minutes
        minutes += hours * 60;
        
        // Format the duration
        return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    }
    
    // Return public API
    return {
        searchVideos,
        getVideoDetails,
        checkApiAccess,
        formatDuration
    };
})();

// Make the helper available globally
window.YouTubeHelper = YouTubeHelper; 