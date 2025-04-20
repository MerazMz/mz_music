# Mz Music - Modern Web Music Player

A sleek, interactive music player web application with a modern UI, featuring both light and dark modes, powered by the YouTube API.

## Features

- 🎨 Modern, minimalist design with high contrast and vibrant colors
- 🌓 Light and dark mode toggle with smooth transitions
- 🎵 Full music playback controls (play, pause, next, previous)
- 🔊 Volume control slider
- 🔄 Shuffle and repeat functionality
- 📊 Interactive progress bar with seek functionality
- 📱 Fully responsive design for all screen sizes
- ✨ Beautiful animations and transitions using GSAP
- 📝 Interactive playlist with active track highlighting
- 🎭 Elegant typography and intuitive navigation
- 🔍 YouTube search integration to find and play any music
- 💾 Playlist management with save, clear, and remove functions
- 📦 Local storage to save your playlist between sessions

## Tech Stack

- HTML5 for structure
- Tailwind CSS for styling
- GSAP (GreenSock Animation Platform) for animations
- JavaScript for interactivity
- Font Awesome for icons
- YouTube API for video playback and search functionality

## Usage

1. Clone this repository
2. Open `index.html` in your browser
3. Search for your favorite songs using the search bar
4. Create and manage your playlist
5. Enjoy your music with a beautiful interface!

## YouTube API Integration

This player uses the YouTube API to:
- Search for music videos
- Play videos in the background (audio only)
- Create and manage playlists
- Control playback (play, pause, seek, etc.)

The YouTube API key is included in the `app.js` file. Note that in a production environment, it's recommended to secure your API key.

## Customization

You can easily customize this player by:
- Adding your own music tracks to the `playerState.tracks` array in `js/app.js`
- Changing the color scheme in the CSS variables in `css/styles.css`
- Modifying the layout and design using Tailwind classes
- Using your own YouTube API key (replace the existing one in `app.js`)

## Preview

The player features a large album artwork display, intuitive controls, and a clean playlist interface. The dark mode provides a stunning alternative look for nighttime listening. The search functionality allows you to find and play any song from YouTube's vast library.

## Credits

- YouTube API for video content
- Random album artwork from [Unsplash](https://unsplash.com/)
- GSAP for animations
- Tailwind CSS for styling

## License

MIT License 