var fs = require('fs');
var musicStore = require('./data_store/music-store.js');

/**
 * Load into musicStore the music objects from the json file located at the given path.
 * @param filePath
 */
exports.loadMusicsJsonFile = function (filePath) {
    console.log("Loading musics json file from '%s'", filePath);
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
            console.log('appStartupHelper.loadMusicsJsonFile failed to load musics json file:', err,
                'Path was', filePath);
            throw err;
        }

        data = JSON.parse(data);

        for (var musicId in data) {
            if (data.hasOwnProperty(musicId)) {
                var list = data[musicId];
                var musicObject = musicStore.newMusicObject(musicId, list);
                musicStore.save(musicObject);
            }
        }
    });
}

