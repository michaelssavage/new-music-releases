# new-music-releases

Automatically share my saved artist's new releases to a Spotify playlist.

Frontend
- Create a frontend for searching for artists, tracks, or albums, then save the selection to a database.
- Edit and delete options
- If I publish the site, I need authentication

Backend (scripts at the moment but want to make a [CSR pattern](https://devtut.github.io/nodejs/route-controller-service-structure-for-expressjs.html#model-routes-controllers-services-code-structure) with Express)
- Get and create a playlist on Spotify
- Get users saved artists from Spotify
- Get new releases if released that day

Vite / React / Typescript / Express/ MongoDB

TODO:

- store refresh token for CRON Job to call update playlist every day.