var userStore = require('./../data_store/user-store.js');
var musicStore = require('./../data_store/music-store.js');

var NUM_RECOMMENDATIONS = 5;
var FOLLOWER_BIAS_COEFFICIENT = 2, ALREADY_LISTENED_COEFFICIENT = 1 / 100;

exports.recommendMusicFor = function (userId, callback) {
    try {
        var results = rec(userId);
        var ret = results.slice(0, NUM_RECOMMENDATIONS).map(function (entry) {
            return entry.musicId;
        });
        callback(undefined, ret);
    } catch (err) {
        console.error(err);
        callback(err, undefined);
    }
}

/**
 * Builds an index to keep how many times a user has listened to a certain genre.
 * Returns a dictionary such that dict[userId][genre] points to the number of times
 * userId has listened to genre.
 * For instance; buildGenreNumListenedByUserIndex()['user123']['rock'] might have a value of 3.
 */
var buildGenreNumListenedByUserIndex = function () {
    // fetch all userIds
    var userIds = userStore.getAllUserIds();
    var lenUserIds = userIds.length;
    var genreNumListened = {};
    // for each user,
    for (var i = 0; i < lenUserIds; ++i) {
        var userId = userIds[i];
        genreNumListened[userId] = {};
        var user = userStore.findById(userId);
        // for each music that the user has listened to
        var listenedMusics = user.musics;
        for (var musicId in listenedMusics) {
            var musicIdNumListened = listenedMusics[musicId];
            var genres = musicStore.findById(musicId).listOfGenres;
            var lenGenres = genres.length;
            // for each genre in that particular music
            for (var j = 0; j < lenGenres; ++j) {
                // update the number of times this user has listened to this genre
                var genre = genres[j];
                if (genreNumListened[userId][genre]) genreNumListened[userId][genre] += musicIdNumListened;
                else genreNumListened[userId][genre] = musicIdNumListened;
            }
        }
    }
    return genreNumListened;
};

/**
 * Computes the similarity between userId1's taste of music and userId2's taste of music.
 * The similarity is defined as SUM(number of times userId1 has listened to genre g for each g in M)
 * where M is the set of genres mutually listened by both userId1 and userId2.
 * Note that this function is not symmetric.
 * E.g it is possible that
 * computeSimilarity(_sameIndex_, userId1, userId2) != computeSimilarity(_sameIndex_, userId2, userId1)
 */
var computeSimilarity = function (genreNumListenedByUser, userId1, userId2) {
    var sim = 0;
    for (var genre in genreNumListenedByUser[userId1]) {
        if (genreNumListenedByUser[userId2][genre]) {
            var numListened = genreNumListenedByUser[userId1][genre];
            if (numListened) {
                sim += numListened > 1 ? (1 + 1 / numListened) : numListened;
            }
        }
    }
    return sim;
};

var addAllKeysInDictionaryToList = function (dict, list) {
    for (var key in dict) list.push(key);
};

/**
 * Performs a Breadth-First Search of the user graph to compute the shortest path from one user to another.
 * Returns the relationship degree between userId and otherUserId.
 * If userId follows otherUserId, degree is 1.
 * If userId follows a user that follows otherUserId, degree is 2 and so on.
 * A return value of 0 indicates that the graph is disconnected and no path exists between userId and otherUserId.
 */
var findFollowerRelationshipDegree = function (userId, otherUserId) {
    // base case
    // fetch the users that userId follows. if otherUserId is one of them, return 1.
    var followedUsers = userStore.findById(userId).followedUsers;
    if (followedUsers[otherUserId]) return 1;
    // otherUserId is not a direct neighbour.
    // perform a breadth-first search to find the degree.
    var visited = {}; // keep track of visited userIds to prevent infinite search in case cycles.
    var queue = [];
    addAllKeysInDictionaryToList(followedUsers, queue);
    // levelDelimeter object in a queue indicates that a new level starts in the search tree
    var levelDelimeter = function (level) {
        return {"levelDelimeter": {"level": level}};
    };
    queue.push(levelDelimeter(2));
    var lastLevelEncountered = 2; // keep track of the last level encountered in the search tree
    while (queue.length > 0) {
        var head = queue.shift(); // pop the head of the queue
        if (head["levelDelimeter"]) {
            // check if the current queue element is a level delimeter instead of a userId object.
            lastLevelEncountered = head["levelDelimeter"]["level"] + 1;
            continue;
        }
        if (visited[head]) continue;
        visited[head] = true;
        followedUsers = userStore.findById(head).followedUsers;
        if (followedUsers[otherUserId]) return lastLevelEncountered; // found
        addAllKeysInDictionaryToList(followedUsers, queue);
    }
    return 0;
};

/**
 * Calculates a rating based on user similarity score,
 * followerDegree (relationship/closeness in the graph)
 * and whether the user already listened to this genre or not
 * (so as to favor discovery of new genres).
 */
var calculateRatingForGenre = function (userSimilarity, followerDegree, alreadyListened) {
    var followerBias = followerDegree && followerDegree != 0 && followerDegree < 4 ? FOLLOWER_BIAS_COEFFICIENT * (1 / followerDegree) : 1 / 10;
    var alreadyListenedBias = alreadyListened ? ALREADY_LISTENED_COEFFICIENT : 1;
    return (userSimilarity != 0 ? userSimilarity : 1) * followerBias * alreadyListenedBias;
};

/**
 * Returns the set difference KA-KB, i.e KA (subtract) KB
 * where KA is the set of keys in dictionary a
 * and KB is the set of keys in dictionary b.
 */
var keySetDifferenceAMinusB = function (a, b) {
    var diff = [];
    for (var key in a) if (!b[key]) diff.push(key);
    return diff;
};

var computeGenreRatings = function (userId) {
    // build an index of how many times a user has listened to a certain genre
    var genreNumListenedByUser = buildGenreNumListenedByUserIndex();

    // assign a rating to each genre
    var genreRatings = {};
    // for each user
    for (var otherUserId in genreNumListenedByUser) {
        if (otherUserId == userId) continue;
        // compute the similarity between taste of music
        var similarity = computeSimilarity(genreNumListenedByUser, userId, otherUserId);
        // find the degree of connection between the two users
        var followerDegree = findFollowerRelationshipDegree(userId, otherUserId);
        for (var genre in genreNumListenedByUser[otherUserId]) {
            // record if this genre is already listened by the user
            var alreadyListened = genreNumListenedByUser[userId][genre] ? true : false;
            // calculate a rating for this genre based on similarity,
            // degree of connection, and whether he has discovered this genre before
            var rating = calculateRatingForGenre(similarity, followerDegree, alreadyListened);
            // update the ratings
            if (genreRatings[genre]) genreRatings[genre] += rating;
            else genreRatings[genre] = rating;
        }
    }
    return genreRatings;
}

/**
 * Returns music recommendations for userId.
 * Recommendations are based on what userId's taste of music
 * (what and how many times he has listened to before),
 * what the users connected to him listens to (connections of all degrees),
 * and the popularity of genres (hit genres).
 *
 * The return value is a list of objects that has two keys; a rating and a musicId.
 * The higher the rating, the stronger the recommendation.
 * The list is sorted in ascending order of ratings.
 */
var rec = function (userId) {
    // compute ratings for each genre
    var genreRatings = computeGenreRatings(userId);
    log("GENRE RATINGS", genreRatings);

    var genresToMusicIdsMap = musicStore.buildReverseIndexByGenre();

    // now that each genre is assigned a rating
    // compute ratings for each music to find out which music contains the highest rated genres.
    // the rating for a music M is equal to SUM(rating of 'g' for each genre 'g' in M)
    var musicRatings = {};
    for (var genre in genreRatings) {
        var genreRating = genreRatings[genre];
        var musicIds = genresToMusicIdsMap[genre];
        var lenMusics = musicIds.length;
        for (var i = 0; i < lenMusics; ++i) {
            var musicId = musicIds[i];
            if (musicRatings[musicId]) musicRatings[musicId] *= genreRating;
            else musicRatings[musicId] = genreRating;
        }
    }

    // there may still be musics that are not rated (if they are not listened to before by any user)
    // assign unheard musics a rating of -1
    var nonRatedMusics = keySetDifferenceAMinusB(musicStore.getAllMusicIdsAsSet(), musicRatings);
    var lenNonRatedMusics = nonRatedMusics.length;
    for (i = 0; i < lenNonRatedMusics; ++i) {
        musicRatings[nonRatedMusics[i]] = -1;
    }

    // gather the results in a list
    var results = [];
    for (var musicId in musicRatings) {
        var musicIdRating = musicRatings[musicId];
        results.push({"ranking": musicIdRating, "musicId": musicId});
    }

    // sort the results by ranking
    results.sort(function (a, b) {
        return -(a.ranking - b.ranking); // ascending sort
    });
    log("RECOMMENDATION RESULTS", results);
    return results;
};

var log = function(header, content) {
    console.log();
    console.log("**********************");
    console.log(header);
    console.log(content);
    console.log("**********************");
    console.log();
}
