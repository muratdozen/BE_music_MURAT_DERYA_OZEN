Describe in a high level the solution you have in mind.
--------------
#### Architecture and design
NodeJs application with ExpressJs as the web framework. For the tests, I used Mocha + ShouldJs + Supertest (for http requests).
#### Recommendation
I came up with my own algorithm which is mostly based on user-based collaborative filtering. 

Recommendations are based on:
  - User’s taste of music (what and how many times he has listened to a certain genre): The genres listened by the user are less likely to be recommended (they still are, but with low probability, so as to increase the odds of discovering new songs) but they affect how similar the user is to another user in the system.
  - What the users connected to him listens to (connections of all degrees). Degree of connection is inversely proportional with recommendation rating of genres. I.e, a 3rd degree connection’s genres would affect the recommendations more than a 4th degree connection’s genres. 
  - The similarity of a user and his connection. The more similar a connection or a connection of a connection, the stronger that connection’s musics affect suggestions. Similarity is affected by the number of mutual genres listened by both users and the number of times a certain genre listened by the user. For instance, if *userA* listened to rock 4 times and jazz 1 time, *userX* listened to rock 1 time and *userY* listened to jazz 1 time, then *userA* would be more similar to *userX* than *userY*.
  - Popularity of a certain genre among all users (how many times it has been listened to system-wide).
The system favors unheard genres. However, for the data provided by you, when you get recommendations for user *a*, the musics will include things he has listened before.  This case is intentional and happens because either his similar connections also like this genre very much, or the genre has been listened to many times system wide. To disallow recommendations of already listened genres, we can simply decrease the ```ALREADY_LISTENED_COEFFICIENT``` variable. We can also play with ```FOLLOWER_BIAS_COEFFICIENT``` which indicates how biased genres will be rated for a follower. It is calculated as ```followerDegree < 4 ? FOLLOWER_BIAS_COEFFICIENT * (1 / followerDegree) : 1 / 10```

Experimenting with *computeSimilarity* and *calculateRatingForGenre* functions will also yield interesting results.

What other data could you use to improve recommendations?
--------------

#### User provided data: 
  - Likes/dislikes given to songs by the user,
  - Ratings submitted by the user.

#### System generated analytics data:
  - How conservative is this user in his choice of music? Does he listen to the same type of music all the time, or is he open to different genres? (We can apply clustering algorithms on genres to see how related one genre is to another). Therefore; we can either feel free to suggest new popular things or mostly stick with his type of music.
  - Can we form clusters of listened songs based on time of the day, day of the week, or month of the year? A particular person might enjoy party songs on Saturday nights and chill-out songs in the morning on weekdays. 
  - Among the recommendations I presented to the user, which type of recommendations did the user like and which ones he didn’t like?
  - Which recommendations did he listen to fully? Which recommendations did he listen to more than once?
  - Which recommendations did he start listening to but cut the song at half and jumped to another one?
  - Regardless of connection degree or similarity, which user’s songs are most listened by this user?

Assume a more real world situation where you could have more data you described above, and more time to implement, could you think of a possibly more efficient way to recommend?
--------------

Yes. The current algorithm computes everything from scratch for every recommendation, which is really slow. Although I mostly preferred dictionary as the data structure of choice for most parts, pre-computation and heavier indexing would immensely increase throughput.

As for assigning ratings, we can look into more scientific methods. For instance, to compute the similarity between users, we can apply a Jaccard index and introduce and experiment with formulas such as Pearson correlation calculation, cosine similarity, hamming distance, etc.

We could also introduce unsupervised learning techniques such as clustering to better extract meaning from the data. Bayesian networks and Markov models are also other great applications for this problem.

More importantly, it would be more beneficial and efficient to follow an item-based filtering technique. User-based filtering requires comparing the user to every other user in the system, which is clearly not scalable. Items and item ratings do not change as quickly as users do. In this case, the general technique is to compute the similarity between items, rather than users. This is harder to implement but easier to manage indexes and pre-computed indexes.

Assume you have more than one implementation of recommendations, how could you test which one is more effective using data generated by user actions?
--------------

We can test different implementations of recommendations through experimentation. To do this, we can issue split A/B tests. The same user can be presented with one implementation for a week and another implementation for another week. Or, a certain user group would be presented an implementation while the rest of the users are presented with another implementation.
In such an experiment, knowing what data to measure, what variables to control and what variables to fix are crucial. Some of the data we can track would be:
  - Rate of change in his overall engagement with the system,
  - Number of songs he found manually vs. the number of songs he found through recommendations,
  - The like/dislike or rating he submitted for the recommendations,
  - Whether he listened to the recommendations fully, partially, once or multiple times, 
  - Heat maps of his engagement with UI etc.

How long did this assignment take? Please be honest it's relativelly new.
--------------

Honestly, the assignment took 13 to 14 hours (including small breaks) spread over 5 days. My initial prediction was between 7 to 9 hours but writing and maintaining the tests took more than I expected. I also spent sometime writing an initial helloworld app to test mocha, shouldjs, routers etc. which counts into the 13 hours.

Where would be the bottlenecks of this solution you have implemented?
--------------

Scalability.
In terms of scaling the development effort when the project grows into a larger one, a TODO list would contain:
  - Refactor recommendationService to allow for a more flexible design where new algorithms are easier to integrate and test and the current algorithm is easier to make changes on,
  - Introduce a config.development.json configuration file to provide certain application configurations which are currently hardcoded,
  - Refactor the user router integration test,
  - Add more exhaustive tests to increase coverage and granularity.
In terms of scaling the system, number of users and throughput, we could:
  - Prefer an item-based collaborative filtering approach rather than a user-based one. Item-based filtering is known to scale and perform better for increased number of users mainly because items do not change as often as users do and pre-computation and caching becomes easier,
  - Pre-compute and/or cache certain indexes (especially those related to ratings) and update these caches at each change rather than computing everything from scratch for each request,
  - Introduce multithreading for the recommendation algorithm as this is a problem that does not need sequential execution for each step. Even better, divide the work into worker machines in a cluster.

What was the hardest part?
--------------

Managing time constraints, maintaining the tests and trying to get things to work with Mocha. The dynamically typed nature of Javascript also takes some getting used to as the code base grows larger.

Did you learn something new?
--------------

I was already familiar with Javascript but I hadn’t developed an entire application in it. It was fun to learn NodeJs from scratch. I also wanted this application for me to be a start to TDD. This was very new too, and I’m glad I gave a start!

Do you feel your skills were under tested?
--------------

Partly. Because the technology can always be learned with all the tutorials on the internet. NodeJs and developing an entire application in Javascript was entirely new to me. But the paradigm (imperative) is quite similar to that of Java, Python etc. Functional side of Javascript is not pure and similar to Python. I also had previous exposure to similar non-blocking architectures through the use of Akka framework in Java. 

However, I really enjoyed the assignment overall mainly because I was meaning to learn NodeJs for sometime plus I was very interested in starting a new project with TDD principles (although I can’t say that I fulfilled that mission completely). About 2-3 years ago, I had a strong interest in machine learning and therefore recommendation algorithms, so that was a fun part as well! Thank you for that.

Murat Derya Ozen.
