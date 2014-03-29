Instructions to start the server
=========

  - Clone Git repository at https://github.com/muratdozen/BE_music_MURAT_DERYA_OZEN/ 
  - On the terminal, change directory (```cd```) to *nodejs* directory. 
  - Issue the command ```npm install```. This will install required dependencies including the ones listed in package.json.
  - Issue the command ```node app.js```
  - The server shall start and you shall see an output similar to the following:
```
Last login: Thu Mar 20 04:23:37 on ttys001
murat:BE_music_MURAT_DERYA_OZEN murat$ pwd
/Users/murat/Documents/code/git/BE_music_MURAT_DERYA_OZEN
murat:BE_music_MURAT_DERYA_OZEN murat$ cd nodejs
murat:nodejs murat$ node app.js
Loading musics json file from '/Users/murat/Documents/code/git/BE_music_MURAT_DERYA_OZEN/nodejs/public/json/musics.json'
Express server listening on port 3000
```

Instructions to test
=========

  - After the server has started, ```cd``` to *nodejs* directory. 
  - Issue the command ```mocha "test/acceptance/test.user-acceptance.js" | grep "Recommendations result" -A 9```
  - This command (1) tells mocha to execute the acceptance test and (2) from output produced by mocha, grep the line containing *Recommendations result* and 9 other lines after it. 
  - The output should be similar to the following:

```
murat:nodejs murat$ mocha "test/acceptance/test.user-acceptance.js" | grep "Recommendations result" -A 9
Recommendations result for userId 'a':
{
  "list": [
    "m7",
    "m4",
    "m8",
    "m9",
    "m10"
  ]
}
```

If mocha is not listed under your *PATH* variable, providing the path for the executable should work out fine: ```./node_modules/.bin/mocha "test/acceptance/test.user-acceptance.js" | grep "Recommendations result" -A 9```

The acceptance test located at ```test/acceptance/test.user-acceptance.js``` loads and parses *follows.json* and *listen.json* files, feeds in these input to *POST /follow* and *POST /listen* endpoints and finally issues a *GET /recommendations* request for user *a* and outputs the results.

The json input files are located under ```test/acceptance/input```.
