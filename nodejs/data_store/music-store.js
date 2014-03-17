var musicsIndexedByMusicId = {};

/**
 * Search the musics in the index and return the music object associated with the given musicId.
 * @param musicId
 * @returns The music object associated with the given musicId or undefined if no such music is indexed.
 */
exports.findById = function(musicId) {
    return musicsIndexedByMusicId[musicId];
}

/**
 * Add a new music to the index if the given musicId does not exist in the index,
 * otherwise, update the music object associated with the given musicId.
 * @param music
 */
exports.save = function(music) {
    var musicId = music.musicId;
    musicsIndexedByMusicId[musicId] = music;
}

/**
 * Returns (but does not save to index) a new music object.
 * The new object will be initialized with given musicId and list of genres.
 * @param musicId
 * @returns A new music object.
 */
exports.newMusicObject = function(musicId, listOfGenres) {
    var newMusic = {};
    newMusic.musicId = musicId;
    newMusic.listOfSongs = listOfGenres;
    return newMusic;
}


exports.data = musicsIndexedByMusicId; // TODO REMOVE