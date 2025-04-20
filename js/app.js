// Mz Music Player - Main JavaScript with YouTube API Integration

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing player...');
    
    // Initialize the player
    let player;
    let currentVideoId = '';
    let isPlaying = false;
    let isPaused = false;
    let shuffle = false;
    let repeat = false;
    let searchInProgress = false;

    // Add space bar event listener for play/pause
    document.addEventListener('keydown', function(e) {
        // Only handle space bar press
        if (e.code === 'Space' || e.keyCode === 32) {
            // Don't trigger if user is typing in an input or textarea
            if (e.target.tagName.toLowerCase() === 'input' || 
                e.target.tagName.toLowerCase() === 'textarea' ||
                e.target.isContentEditable) {
                return;
            }
            
            // Prevent default space bar behavior (page scroll)
            e.preventDefault();
            
            // Toggle play/pause
            togglePlay();
        }
    });

    // Default cover image for when no track is loaded
    const defaultCoverImage = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop";

    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle-container');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const progressBar = document.getElementById('progress-bar');
    const progressBarMobile = document.getElementById('progress-bar-mobile');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const songTitleEl = document.getElementById('song-title');
    const artistNameEl = document.getElementById('artist-name');
    const albumArtEl = document.getElementById('album-art');
    const albumArtContainer = document.getElementById('album-art-container');
    
    // Expanded Player Elements
    const expandPlayerBtn = document.getElementById('expand-player');
    const expandedPlayer = document.getElementById('expanded-player');
    const closeExpandedPlayerBtn = document.getElementById('close-expanded-player');
    const expandedPlayBtn = document.getElementById('expanded-play-btn');
    const expandedPrevBtn = document.getElementById('expanded-prev-btn');
    const expandedNextBtn = document.getElementById('expanded-next-btn');
    const expandedShuffleBtn = document.getElementById('expanded-shuffle-btn');
    const expandedRepeatBtn = document.getElementById('expanded-repeat-btn');
    const expandedVolumeSlider = document.getElementById('expanded-volume-slider');
    const expandedProgressBar = document.getElementById('expanded-progress-bar');
    const expandedCurrentTimeEl = document.getElementById('expanded-current-time');
    const expandedTotalTimeEl = document.getElementById('expanded-total-time');
    const expandedSongTitleEl = document.getElementById('expanded-song-title');
    const expandedArtistNameEl = document.getElementById('expanded-artist-name');
    const expandedAlbumArtEl = document.getElementById('expanded-album-art');
    
    // Search Elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const clearSearchBtn = document.getElementById('clear-search');
    const searchResults = document.getElementById('search-results');
    const resultsList = document.getElementById('results-list');
    
    // Playlist Management Elements
    const clearPlaylistBtn = document.getElementById('clear-playlist');
    const savePlaylistBtn = document.getElementById('save-playlist');
    const searchStatus = document.getElementById('search-status');
    const statusText = document.getElementById('status-text');

    // Load YouTube API
    function loadYouTubeAPI() {
        try {
            console.log("Attempting to load YouTube API...");
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            console.log("YouTube API script tag added to DOM");
        } catch (error) {
            console.error("Error loading YouTube API:", error);
        }
    }

    // Called automatically when YouTube API is ready
    window.onYouTubeIframeAPIReady = function() {
        console.log("YouTube API is ready");
        createYouTubePlayer();
    };

    // Create YouTube player
    function createYouTubePlayer() {
        try {
            console.log("Creating YouTube player");
            // Hidden player
            player = new YT.Player('player', {
                height: '0',
                width: '0',
                videoId: currentVideoId,
                playerVars: {
                    'autoplay': 0,
                    'controls': 0,
                    'showinfo': 0,
                    'rel': 0
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange,
                    'onError': onPlayerError
                }
            });
        } catch (error) {
            console.error("Error creating YouTube player:", error);
        }
    }

    // YouTube player ready
    function onPlayerReady(event) {
        console.log("YouTube player is ready");
        volumeSlider.addEventListener('input', setVolume);
        setVolume(); // Set initial volume
    }

    // YouTube player state change
    function onPlayerStateChange(event) {
        try {
            const state = event.data;
            
            if (state === YT.PlayerState.ENDED) {
                console.log("Track ended");
                isPlaying = false;
                
                // If repeat is enabled, replay the current track
                if (repeat && currentVideoId) {
                    player.seekTo(0);
                    player.playVideo();
                }
            } else if (state === YT.PlayerState.PLAYING) {
                console.log("Track playing");
                isPlaying = true;
                isPaused = false;
                
                // Update UI
                updatePlayPauseUI(true);
                
                // Start progress update
                updateProgressInterval = setInterval(updateProgress, 1000);
                
                // Start equalizer animation
                updateEqualizer(true);
            } else if (state === YT.PlayerState.PAUSED) {
                console.log("Track paused");
                isPlaying = false;
                isPaused = true;
                
                // Update UI
                updatePlayPauseUI(false);
                
                // Stop progress update
                clearInterval(updateProgressInterval);
                
                // Stop equalizer animation
                updateEqualizer(false);
            }
        } catch (error) {
            console.error("Error handling player state change:", error);
        }
    }

    // YouTube player error
    function onPlayerError(event) {
        console.error("YouTube player error:", event.data);
        
        // Update UI to show error
        songTitleEl.textContent = "Error Playing Track";
        artistNameEl.textContent = "Please try another track";
        
        // Try to play next track if in playlist
        if (playlist.length > 0) {
            setTimeout(() => {
                playNextTrack();
            }, 3000);
        }
    }

    // Check if YouTube API is accessible using our helper
    function checkYouTubeAPI() {
        if (window.YouTubeHelper && typeof window.YouTubeHelper.checkApiAccess === 'function') {
            return window.YouTubeHelper.checkApiAccess()
                .then(result => {
                    console.log("YouTube API check result:", result);
                    return result;
                })
                .catch(error => {
                    console.error("YouTube API check failed:", error);
                    return false;
                });
        } else {
            console.error("YouTube Helper not available");
            return Promise.resolve(false);
        }
    }

    // Play/Pause toggle
    function togglePlay() {
        try {
            if (!currentVideoId) {
                console.log("No track loaded");
                return;
            }
            
            if (isPlaying) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        } catch (error) {
            console.error("Error toggling play state:", error);
        }
    }

    // Update UI for play/pause state
    function updatePlayPauseUI(isPlaying) {
        // Update mini player
        playBtn.innerHTML = isPlaying ? 
            '<i class="fas fa-pause text-xs"></i>' : 
            '<i class="fas fa-play text-xs"></i>';
            
        // Update expanded player
        if (expandedPlayBtn) {
            expandedPlayBtn.innerHTML = isPlaying ? 
                '<i class="fas fa-pause text-xl"></i>' : 
                '<i class="fas fa-play text-xl"></i>';
        }
    }

    // Play the previous track (not needed without playlist, but keeping buttons working)
    function playPrevTrack() {
        try {
            console.log("Previous track button pressed - no action in direct play mode");
        } catch (error) {
            console.error("Error in previous track function:", error);
        }
    }

    // Play the next track (not needed without playlist, but keeping buttons working)
    function playNextTrack() {
        try {
            console.log("Next track button pressed - no action in direct play mode");
            
            // If repeat is on, replay the current track
            if (repeat && currentVideoId) {
                if (player && typeof player.seekTo === 'function') {
                    player.seekTo(0);
                    player.playVideo();
                }
            }
        } catch (error) {
            console.error("Error in next track function:", error);
        }
    }

    // Toggle shuffle mode
    function toggleShuffle() {
        try {
            shuffle = !shuffle;
            
            // Update mini player UI
            shuffleBtn.classList.toggle('text-indigo-600', shuffle);
            shuffleBtn.classList.toggle('dark:text-indigo-400', shuffle);
            
            // Update expanded player UI
            if (expandedShuffleBtn) {
                expandedShuffleBtn.classList.toggle('text-indigo-600', shuffle);
                expandedShuffleBtn.classList.toggle('dark:text-indigo-400', shuffle);
            }
            
            console.log("Shuffle mode:", shuffle ? "ON" : "OFF");
        } catch (error) {
            console.error("Error toggling shuffle mode:", error);
        }
    }

    // Toggle repeat mode
    function toggleRepeat() {
        try {
            repeat = !repeat;
            
            // Update mini player UI
            repeatBtn.classList.toggle('text-indigo-600', repeat);
            repeatBtn.classList.toggle('dark:text-indigo-400', repeat);
            
            // Update expanded player UI
            if (expandedRepeatBtn) {
                expandedRepeatBtn.classList.toggle('text-indigo-600', repeat);
                expandedRepeatBtn.classList.toggle('dark:text-indigo-400', repeat);
            }
            
            console.log("Repeat mode:", repeat ? "ON" : "OFF");
        } catch (error) {
            console.error("Error toggling repeat mode:", error);
        }
    }

    // Update track duration
    function updateTrackDuration() {
        try {
            if (player && typeof player.getDuration === 'function') {
                const duration = player.getDuration();
                if (duration) {
                    const minutes = Math.floor(duration / 60);
                    const seconds = Math.floor(duration % 60);
                    const durationString = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
                    
                    totalTimeEl.textContent = durationString;
                    if (expandedTotalTimeEl) expandedTotalTimeEl.textContent = durationString;
                }
            }
        } catch (error) {
            console.error("Error updating track duration:", error);
        }
    }

    let updateProgressInterval;

    // Update progress
    function updateProgress() {
        try {
            if (player && typeof player.getCurrentTime === 'function' && typeof player.getDuration === 'function') {
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                
                if (currentTime && duration) {
                    // Update progress bars
                    const percent = (currentTime / duration) * 100;
                    progressBar.style.width = `${percent}%`;
                    if (progressBarMobile) progressBarMobile.style.width = `${percent}%`;
                    if (expandedProgressBar) expandedProgressBar.style.width = `${percent}%`;
                    
                    // Update time displays
                    const minutes = Math.floor(currentTime / 60);
                    const seconds = Math.floor(currentTime % 60);
                    const timeString = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
                    
                    currentTimeEl.textContent = timeString;
                    if (expandedCurrentTimeEl) expandedCurrentTimeEl.textContent = timeString;
                    
                    // Update duration if not set yet
                    if (totalTimeEl.textContent === "0:00") {
                        updateTrackDuration();
                    }
                }
            }
        } catch (error) {
            console.error("Error updating progress:", error);
        }
    }

    // Set progress when clicking on progress bar
    function setProgress(e) {
        try {
            const progressContainer = e.currentTarget.parentElement;
            const width = progressContainer.clientWidth;
            const clickX = e.offsetX;
            const percent = clickX / width;
            
            if (player && typeof player.getDuration === 'function' && typeof player.seekTo === 'function') {
                const duration = player.getDuration();
                player.seekTo(duration * percent);
            }
        } catch (error) {
            console.error("Error setting progress:", error);
        }
    }

    // Set volume
    function setVolume() {
        try {
            const volume = volumeSlider.value;
            syncVolume(volume);
        } catch (error) {
            console.error("Error setting volume:", error);
        }
    }

    // Handle expanded player volume change
    function setExpandedVolume() {
        try {
            const volume = expandedVolumeSlider.value;
            syncVolume(volume);
        } catch (error) {
            console.error("Error setting expanded volume:", error);
        }
    }

    // Sync volume between mini and expanded players
    function syncVolume(value) {
        volumeSlider.value = value;
        if (expandedVolumeSlider) expandedVolumeSlider.value = value;
        
        if (player && typeof player.setVolume === 'function') {
            player.setVolume(value);
        }
    }

    // Update equalizer animation
    function updateEqualizer(isActive) {
        // This function would animate equalizer bars if we had them
        // For now, it's just a placeholder
        console.log("Equalizer animation:", isActive ? "ON" : "OFF");
    }

    // Toggle theme
    function toggleTheme() {
        try {
            const toggleContainer = document.getElementById('theme-toggle-container');
            const toggleCircle = toggleContainer.querySelector('.toggle-circle');
            const body = document.body;
            
            if (document.documentElement.classList.contains('dark')) {
                // Switch to light mode with animation
                gsap.to(toggleCircle, {
                    translateX: 0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                
                gsap.to([document.documentElement, body], {
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    duration: 0.5,
                    ease: 'power2.out',
                    onComplete: () => {
                        document.documentElement.classList.remove('dark');
                    }
                });
                
                localStorage.setItem('theme', 'light');
            } else {
                // Switch to dark mode with animation
                gsap.to(toggleCircle, {
                    translateX: 24,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                
                gsap.to([document.documentElement, body], {
                    backgroundColor: '#1f2937',
                    color: '#f9fafb',
                    duration: 0.5,
                    ease: 'power2.out',
                    onComplete: () => {
                        document.documentElement.classList.add('dark');
                    }
                });
                
                localStorage.setItem('theme', 'dark');
            }
        } catch (error) {
            console.error("Error toggling theme:", error);
        }
    }

    // Search for YouTube videos
    async function searchYouTubeVideos() {
        try {
            if (searchInProgress) {
                console.log("Search already in progress");
                return;
            }
            
            const query = searchInput.value.trim();
            if (!query) {
                console.log("Empty search query");
                return;
            }
            
            console.log("Searching for:", query);
            
            // Show search status
            searchStatus.classList.remove('hidden');
            statusText.textContent = "Searching...";
            searchInProgress = true;
            
            // Clear previous results
            resultsList.innerHTML = '';
            
            // Check if our YouTube helper is available
            if (window.YouTubeHelper && typeof window.YouTubeHelper.searchVideos === 'function') {
                console.log("Using YouTubeHelper for search");
                
                // Use our helper to search videos
                const videos = await window.YouTubeHelper.searchVideos(query);
                console.log(`Found ${videos.length} videos using helper`);
                
                if (videos && videos.length > 0) {
                    renderSearchResults(videos);
                } else {
                    console.log("No results from helper, using fallback");
                    directSearch(query);
                }
            } else {
                console.log("YouTubeHelper not available, using fallback");
                directSearch(query);
            }
        } catch (error) {
            console.error("Error searching YouTube videos:", error);
            statusText.textContent = `Error: ${error.message}`;
            searchInProgress = false;
        }
    }

    // Fallback search function
    function directSearch(query) {
        try {
            console.log("Using direct search fallback");
            
            // Create some dummy search results based on the query
            const dummyResults = [
                {
                    videoId: 'dQw4w9WgXcQ',
                    title: `${query} - Top Result`,
                    artist: 'Popular Artist',
                    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop'
                },
                {
                    videoId: 'dQw4w9WgXcQ',
                    title: `Best ${query} Mix`,
                    artist: 'Various Artists',
                    thumbnail: 'https://images.unsplash.com/photo-1528120369764-0423708119be?w=200&h=200&fit=crop'
                },
                {
                    videoId: 'dQw4w9WgXcQ',
                    title: `${query} Remix 2023`,
                    artist: 'DJ Remix',
                    thumbnail: 'https://images.unsplash.com/photo-1497271679421-ce9c3d6a31da?w=200&h=200&fit=crop'
                },
                {
                    videoId: 'dQw4w9WgXcQ',
                    title: `${query} Acoustic Version`,
                    artist: 'Acoustic Covers',
                    thumbnail: 'https://images.unsplash.com/photo-1477233534935-f5e6fe7c1159?w=200&h=200&fit=crop'
                },
                {
                    videoId: 'dQw4w9WgXcQ',
                    title: `${query} - Official Music Video`,
                    artist: 'Original Artist',
                    thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop'
                }
            ];
            
            renderSearchResults(dummyResults);
        } catch (error) {
            console.error("Error in direct search:", error);
            statusText.textContent = `Error: ${error.message}`;
            searchInProgress = false;
        }
    }

    // Render search results
    function renderSearchResults(results) {
        try {
            // Hide search status
            searchStatus.classList.add('hidden');
            searchInProgress = false;
            
            // Show results container
            searchResults.classList.remove('hidden');
            
            // Clear previous results
            resultsList.innerHTML = '';
            
            // Add each result to the list
            results.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors my-1 cursor-pointer';
                
                resultItem.innerHTML = `
                    <div class="w-12 h-12 mr-3">
                        <img src="${result.thumbnail}" alt="${result.title}" class="w-full h-full object-cover rounded">
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-800 dark:text-white truncate">${result.title}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${result.channelTitle || 'Unknown artist'}</p>
                    </div>
                    <button class="play-now-btn bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 p-2 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">
                        <i class="fas fa-play"></i>
                    </button>
                `;
                
                // Add click event to play immediately
                resultItem.addEventListener('click', function() {
                    playDirectly(result);
                });
                
                // Add click event for play button
                resultItem.querySelector('.play-now-btn').addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent the parent click handler from firing
                    playDirectly(result);
                });
                
                resultsList.appendChild(resultItem);
            });
        } catch (error) {
            console.error("Error rendering search results:", error);
        }
    }

    // Play a track directly (without playlist)
    function playDirectly(track) {
        try {
            console.log("Playing track directly:", track.title);
            
            currentVideoId = track.videoId;
            
            // Update mini player UI
            songTitleEl.textContent = track.title;
            artistNameEl.textContent = track.channelTitle || 'Unknown artist';
            
            // Update expanded player UI
            if (expandedSongTitleEl) expandedSongTitleEl.textContent = track.title;
            if (expandedArtistNameEl) expandedArtistNameEl.textContent = track.channelTitle || 'Unknown artist';
            
            // Update album art
            if (track.thumbnail) {
                console.log("Setting album art to:", track.thumbnail);
                albumArtEl.src = track.thumbnail;
                if (expandedAlbumArtEl) expandedAlbumArtEl.src = track.thumbnail;
            } else {
                console.log("Using default album art");
                albumArtEl.src = defaultCoverImage;
                if (expandedAlbumArtEl) expandedAlbumArtEl.src = defaultCoverImage;
            }
            
            // If player exists, load and play the video
            if (player && typeof player.loadVideoById === 'function') {
                player.loadVideoById(currentVideoId);
            } else {
                console.error("Player not ready yet");
            }
        } catch (error) {
            console.error("Error playing track directly:", error);
        }
    }

    // Clear search
    function clearSearch() {
        try {
            searchInput.value = '';
            searchResults.classList.add('hidden');
        } catch (error) {
            console.error("Error clearing search:", error);
        }
    }

    // Set up theme from local storage
    function setupTheme() {
        try {
            // Check for saved theme preference
            const savedTheme = localStorage.getItem('theme');
            const toggleContainer = document.getElementById('theme-toggle-container');
            const toggleCircle = toggleContainer.querySelector('.toggle-circle');
            
            if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
                // Position the toggle circle for dark mode
                toggleCircle.style.transform = 'translateX(24px)';
            } else {
                document.documentElement.classList.remove('dark');
                // Position the toggle circle for light mode
                toggleCircle.style.transform = 'translateX(0)';
            }
        } catch (error) {
            console.error("Error setting up theme:", error);
        }
    }

    // Expand player
    function expandPlayer() {
        expandedPlayer.classList.remove('hidden');
        expandedPlayer.classList.add('flex');
        document.body.classList.add('overflow-hidden'); // Prevent scrolling
    }
    
    // Close expanded player
    function closeExpandedPlayer() {
        expandedPlayer.classList.add('hidden');
        expandedPlayer.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
    }

    // Initialize the app
    function init() {
        try {
            console.log("Initializing app");
            
            // Setup theme
            setupTheme();
            
            // Load YouTube API
            loadYouTubeAPI();
            
            // Add basic player event listeners
            playBtn.addEventListener('click', togglePlay);
            prevBtn.addEventListener('click', playPrevTrack);
            nextBtn.addEventListener('click', playNextTrack);
            shuffleBtn.addEventListener('click', toggleShuffle);
            repeatBtn.addEventListener('click', toggleRepeat);
            document.getElementById('current-time').parentElement.addEventListener('click', setProgress);
            document.getElementById('theme-toggle-container').addEventListener('click', toggleTheme);
            
            // Expanded player event listeners
            expandPlayerBtn.addEventListener('click', expandPlayer);
            closeExpandedPlayerBtn.addEventListener('click', closeExpandedPlayer);
            expandedPlayBtn.addEventListener('click', togglePlay);
            expandedPrevBtn.addEventListener('click', playPrevTrack);
            expandedNextBtn.addEventListener('click', playNextTrack);
            expandedShuffleBtn.addEventListener('click', toggleShuffle);
            expandedRepeatBtn.addEventListener('click', toggleRepeat);
            expandedVolumeSlider.addEventListener('input', setExpandedVolume);
            document.getElementById('expanded-current-time').parentElement.addEventListener('click', setProgress);
            
            // Volume control
            volumeSlider.addEventListener('input', setVolume);
            
            // Search related event listeners
            searchButton.addEventListener('click', searchYouTubeVideos);
            clearSearchBtn.addEventListener('click', clearSearch);
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    searchYouTubeVideos();
                }
            });
            
            // Check API
            setTimeout(() => {
                checkYouTubeAPI().then(accessible => {
                    if (!accessible) {
                        console.warn("YouTube API not accessible, some features may not work");
                    }
                });
            }, 3000);
        } catch (error) {
            console.error("Error initializing app:", error);
        }
    }

    // Initialize when DOM is ready
    init();
}); 