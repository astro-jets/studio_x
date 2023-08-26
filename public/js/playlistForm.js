// Retrieve HTML elements
const playlistForm = document.getElementById('playlist-form');
const searchSongInput = document.getElementById('search-song');
const searchResultsContainer = document.getElementById('search-results');
const playlistContainer = document.getElementById('playlist');
const saveButton = document.getElementById('save-button');
// Position of the song in the playlist
let songPosition = 0;

// Store the playlist songs
let playlistSongsWithImages = [];
let playlistSongs = [];

// Handle form submission
playlistForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get the playlist name
  const playlistName = document.getElementById('playlist-name').value;
  const genres = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
    .map(checkbox => checkbox.value);
  // Validate playlist name and songs
  if (playlistName.trim() === '') {
    Swal.fire({
      title: "Error saving playlist",
      text: "Please enter a playlist name.",
      icon: "error",
      confirmButtonText: "Ok",
    });
    return;
  }

  if (playlistSongs.length === 0) {
    Swal.fire({
      title: "Error saving playlist",
      text: "Please add songs to the playlist.",
      icon: "error",
      confirmButtonText: "Ok",
    });
    return;
  }

  // Save the playlist
  savePlaylist(playlistName, playlistSongs, genres);
});

// Handle search input keyup event
searchSongInput.addEventListener('keyup', async (e) => {
  const searchTerm = e.target.value.trim();

  if (searchTerm === '') {
    searchResultsContainer.innerHTML = '';
    return;
  }

  // Perform search and display results
  const searchResults = await performSearch(searchTerm);
  displaySearchResults(searchResults);
});

// Perform search
async function performSearch(searchTerm) {
  try {
    const response = await fetch(`/admin/search/${searchTerm}`);
    const results = await response.json();
    return results;
  } catch (error) {
    console.error('Error performing search:', error);
    return [];
  }
}

// Display search results
function displaySearchResults(results) {
  if (results.length === 0) {
    searchResultsContainer.innerHTML = '<p>No results found.</p>';
    return;
  }

  const resultsHTML = results.map((result) => `
    <div class="card mb-3">
      <div class="row no-gutters">
        <div class="col-md-4">
          <img src="${result.artPath}" class="card-img" alt="${result.title}">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${result.title}</h5>
            <p class="card-text">${result.artist}</p>
            <p class="btn btn-primary add-song-btn">Add to Playlist</p>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  searchResultsContainer.innerHTML = resultsHTML;

  // Add event listeners to "Add to Playlist" buttons
  const addSongButtons = document.querySelectorAll('.add-song-btn');
  addSongButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const selectedSong = results[index];
      addSongToPlaylist(selectedSong);
    });
  });
}

// Add a song to the playlist
function addSongToPlaylist(song) {
  songPosition++;
  playlistSongs.push({
    id:song._id,
    position: songPosition,
    artist:song.artist,
    title:song.title,
    location:song.location
  });
  playlistSongsWithImages.push({
    id:song._id,
    position: songPosition,
    artPath: song.artPath,
    artist:song.artist,
    title:song.title,
    location:song.location
  });
  displayPlaylist();
}

// Display the playlist
function displayPlaylist() {
  if (playlistSongsWithImages.length === 0) {
    playlistContainer.innerHTML = '<p>No songs added to the playlist.</p>';
    return;
  }

  const playlistHTML = playlistSongsWithImages.map((song) => `
    <div class="card mb-3 bx">
      <div class="row no-gutters">
        <div class="col-md-1">
          <h5 class="song-number">${song.position}</h5>
        </div>
        <div class="col-md-5">
          <img class="avatar-img" src="${song.artPath}" alt="${song.title}">
        </div>
        <div class="col-md-6">
          <div class="card-body">
            <h5 class="song-title">${song.title}</h5>
            <p class="artist-name">${song.artist}</p>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  playlistContainer.innerHTML = playlistHTML;
}

function savePlaylist(playlistName, songs, genres) {
  const data = {
    title: playlistName,
    tracks: songs,
    genres: genres
  };

  fetch('/admin/playlist/new', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok) {
        // Display success pop-up
        return Swal.fire({
          icon: 'success',
          title: 'Playlist Saved',
          text: 'Playlist saved successfully!',
          showConfirmButton: true
        });
      } else {
        // Display error pop-up
        throw new Error('An error occurred while saving the playlist.');
      }
    })
    .then(result => {
      // Redirect to a different page when the success pop-up is clicked
      if (result.isConfirmed) {
        window.location.href = '/'; // Replace with your desired URL
      }
    })
    .catch(error => {
      console.error('Error saving playlist:', error);
      // Display error pop-up
      Swal.fire({
        icon: 'error',
        title: 'Failed to Save Playlist',
        text: 'An error occurred while saving the playlist.'
      });
    });
}

