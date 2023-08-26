
const Song = require("../models/Song")
const Playlist = require("../models/Playlist")
const Artist = require("../models/Artist")

// Studio XLanding Page
module.exports.index = async (req,res)=>{res.render('index')};

// Studio X Playlists/Charts Page
module.exports.charts = async (req,res)=>{
    const playlist = await Playlist.find();
    const charts = playlist.map(p => p.title);
    res.render('playlists',{charts})
}

// Studio X GET Playlists with playlist ID and the current selected track
module.exports.playlist = async (req,res)=>{
    try{
        const playlist = await renderPlaylist(req.params.playlist);
        res.status(200).send(playlist);
    }
    catch(err){
        console.log(err.message)
        res.status(500).send(err.message)
    }
}

// Studio X Blogs Page
module.exports.blogs = async (req,res)=>{res.render('blogs')}

// Studuio X single Blog
module.exports.blogSingle = async (req,res)=>{res.render('blogsingle')}

// Studuio X Events Page
module.exports.events = async (req,res)=>{res.render('events')};

// Studuio X Event Single
module.exports.eventSingle = async (req,res)=>{res.render('checkout')}

// Studuio X Artist Profile
module.exports.artistProfile = async (req,res)=>{res.render('profile')}

// Studuio X Album
module.exports.album = async (req,res)=>{res.render('album')}

// Studuio X One Song
module.exports.findSongbyId = async (req,res)=>{
    const id = req.params.id;
    try{
        const song = await Song.findById(id);
        const artist = await Artist.findById(song.artist);

        const track = {
            id:song.id,
            location:song.location,
            art:song.artPath,
            title:song.title,
            features:song.featuring,
            artist:artist.artistname
        }
        res.status(200).json(track)
    }catch(e){
        res.status(500).send(e.message);
    }
}
module.exports.song = async (req,res)=>{
    res.render('song');
}
module.exports.singleSong = async (req,res)=>{
    const song = await Song.findById(req.params.id);
    res.render('singleSong',{song});
}
module.exports.getplaylist = async (req,res)=>{
    const index = req.params.index;
    const playlist = await renderPlaylist(req.params.playlist);
    data = {
        index,
        playlist
    }
    res.status(200).send(data);
}

// Studio X Search Song
module.exports.searchSong = async (req, res) => {
  try {
    const searchQuery = req.body.search;

    // Search for songs that match the title
    const songResults = await Song.find({
      title: { $regex: searchQuery, $options: 'i' },
    }).populate('artist');

    // Search for artists that match the artist name
    const artist = await Artist.find({
      artistname: { $regex: searchQuery, $options: 'i' },
    });

    const combinedResults = [];

    // Convert song and artist results into the desired format and push to the combined array
    songResults.forEach(song => {
      combinedResults.push({
        song:song,
        artist: song.artist.artistname,
      });
    });

    for (let i = 0; i < artist.length; i++) {
        const a = artist[i];
        const tracks = await Song.find({artist:a.id});
        for (let i = 0; i < tracks.length; i++) {
            const t = tracks[i];
            combinedResults.push({
                song:t,
                artist: a.artistname,
            });  
        }
    }
      

    res.render("results",{results: combinedResults });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'An error occurred while searching.' });
  }
};


async function renderPlaylist(id)
{
    const playlist = await Playlist.findById(id);
    const tracks = []
    for(let i = 0; i < playlist.tracks.length; i++){
        const song = playlist.tracks[i];
        const s = await Song.findById(song.id);
        tracks.push({
            "id":s.id,
            "position":song.position,
            "artist":song.artist,
            "title":s.title,
            "art":s.artPath,
            "audio":s.location
        });
    }
    return(tracks);
}