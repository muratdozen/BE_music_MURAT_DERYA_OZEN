exports.recommendMusicFor = function (userId, callback) {
    var result = ["abc", "xyz", "abc", "xyz", "abc"];
    result = rec(userId).results;
    callback(result);
}
var musics = {    "m1": ["jazz", "old school", "instrumental"], "m2": ["samba", "60s"], "m3": ["rock", "alternative"], "m4": ["rock", "alternative"], "m5": ["folk", "instrumental"], "m6": ["60s", "rock", "old school"], "m7": ["alternative", "dance"], "m8": ["electronic", "pop"], "m9": ["60s", "rock"], "m10": ["60s", "jazz"], "m11": ["samba"], "m12": ["jazz", "instrumental"]};
var users = {    "a": {        "userId": "a", "followedUsers": {"b": true, "c": true}, "musics": {"m2": 1, "m6": 1}    }, "b": {        "userId": "b", "followedUsers": {"c": true, "d": true, "e": true}, "musics": {"m4": 1, "m9": 1}    }, "c": {        "userId": "c", "followedUsers": {"a": true}, "musics": {"m8": 1, "m7": 1}    }, "d": {        "userId": "d", "followedUsers": {}, "musics": {"m2": 1, "m6": 1, "m7": 1}    }, "e": {        "userId": "e", "followedUsers": {}, "musics": {"m11": 1}    }};

var buildGenreNumListenedByUserIndex = function (users) {
    var genreNumListened = {};
    for (var userId in users) {
        genreNumListened[userId] = {};
        var user = users[userId];
        var listenedMusics = user.musics;
        for (var musicId in listenedMusics) {
            var musicIdNumListened = listenedMusics[musicId];
            var genres = musics[musicId];
            var lenGenres = genres.length;
            for (var j = 0; j < lenGenres; ++j) {
                var genre = genres[j];
                if (genreNumListened[userId][genre]) genreNumListened[userId][genre] += musicIdNumListened; else genreNumListened[userId][genre] = musicIdNumListened;
            }
        }
    }
    return genreNumListened;
};
var calculateSimilarity = function (genreNumListenedByUser, userId1, userId2) {
    var sim = 0;
    for (var genre in genreNumListenedByUser[userId1]) {
        if (genreNumListenedByUser[userId2][genre]) {
            var numListened = genreNumListenedByUser[userId1][genre];
            if (numListened) {
                sim += numListened > 1 ? 1 + 1 / numListened : numListened;
            }
        }
    }
    return sim;
};
var addAllKeysInDictionaryToList = function (dict, list) {
    for (var key in dict) list.push(key);
};
var findFollowerRelationshipDegree = function (userId, otherUserId) {
    var followedUsers = users[userId].followedUsers;
    if (followedUsers[otherUserId]) return 1;
    var visited = {};
    var queue = [];
    addAllKeysInDictionaryToList(followedUsers, queue);
    var levelDelimeter = function (level) {
        return {"levelDelimeter": {"level": level}};
    };
    queue.push(levelDelimeter(2));
    var lastLevelEncountered = 2;
    while (queue.length > 0) {
        var head = queue.shift();
        if (head["levelDelimeter"]) {
            lastLevelEncountered = head["levelDelimeter"]["level"] + 1;
            continue;
        }
        if (visited[head]) continue;
        visited[head] = true;
        followedUsers = users[head].followedUsers;
        if (followedUsers[otherUserId]) return lastLevelEncountered; // found
        addAllKeysInDictionaryToList(followedUsers, queue);
    }
    return 0;
};
var calculateScoreForGenre = function (userSimilarity, followerDegree, alreadyListened) {
    var followerBiasCoefficient = 2, alreadyListenedCoefficient = 1 / 100;
    var followerBias = followerDegree && followerDegree != 0 && followerDegree < 4 ? followerBiasCoefficient * (1 / followerDegree) : 1 / 10;
    var alreadyListenedBias = alreadyListened ? alreadyListenedCoefficient : 1;
    return (userSimilarity != 0 ? userSimilarity : 1) * followerBias * alreadyListenedBias;
};
var musicStoreReverseIndex = function (musics) {
    var results = {};
    for (musicId in musics) {
        var genreList = musics[musicId];
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
}(musics);
var dictionaryKeySetDifferenceAMinusB = function (a, b) {
    var diff = [];
    console.log(JSON.stringify(a));
    console.log(JSON.stringify(b));
    for (var key in a) if (!b[key]) diff.push(key);
    console.log(JSON.stringify(diff));
    return diff;
};
var rec = function (userId) {
    var genreNumListenedByUser = buildGenreNumListenedByUserIndex(users);
    var genreRatings = {};
    for (var otherUserId in genreNumListenedByUser) {
        if (otherUserId == userId) continue;
        var similarity = calculateSimilarity(genreNumListenedByUser, userId, otherUserId);
        var followerDegree = findFollowerRelationshipDegree(userId, otherUserId);
        for (var genre in genreNumListenedByUser[otherUserId]) {
            var alreadyListened = genreNumListenedByUser[userId][genre] ? true : false;
            var score = calculateScoreForGenre(similarity, followerDegree, alreadyListened);
            if (genreRatings[genre]) genreRatings[genre] += score; else genreRatings[genre] = score;
        }
    }
    var musicRatings = {};
    for (var genre in genreRatings) {
        var genreRating = genreRatings[genre];
        var musicsReverseIndex = musicStoreReverseIndex[genre];
        var lenMusics = musicsReverseIndex.length;
        for (var i = 0; i < lenMusics; ++i) {
            var musicId = musicsReverseIndex[i];
            if (musicRatings[musicId]) musicRatings[musicId] += genreRating; else musicRatings[musicId] = genreRating;
        }
    }
    var nonRatedMusics = dictionaryKeySetDifferenceAMinusB(musics, musicRatings);
    var lenNonRatedMusics = nonRatedMusics.length;
    for (i = 0; i < lenNonRatedMusics; ++i) {
        musicRatings[nonRatedMusics[i]] = -1;
    }
    var results = [];
    for (var musicId in musicRatings) {
        var musicIdRating = musicRatings[musicId];
        results.push({"ranking": musicIdRating, "musicId": musicId});
    }
    results.sort(function (a, b) {
        return -(a.ranking - b.ranking);
    });
    return {"genreNumListened": genreNumListenedByUser, "genreRatings": genreRatings, "musicRatings": musicRatings, "results": results};
};
