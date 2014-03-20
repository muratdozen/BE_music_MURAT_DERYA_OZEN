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
 * @returns All musicIds in the index.
 */
exports.getAllMusicIdsAsSet = function () {
    var results = {};
    for (var musicId in musicsIndexedByMusicId) results[musicId] = true;
    return results;
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
 * Remove all musics from the index.
 */
exports.clear = function() {
    musicsIndexedByMusicId = {};
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

exports.buildReverseIndexByGenre = function () {
    var results = {};
    for (var musicId in musicsIndexedByMusicId) {
        var genreList = musicsIndexedByMusicId[musicId];
        var lenGenreList = genreList.length;
        for (var i = 0; i < lenGenreList; ++i) {
            var genre = genreList[i];
            if (results[genre]) {
                results[genre].push(musicId);
            } else {
                results[genre] = [musicId];
            }
        }
    }
    return results;
}


exports.data = musicsIndexedByMusicId; // TODO REMOVE