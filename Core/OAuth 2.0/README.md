# An OAuth2 demo

I wanted to get a better understanding of what's sent over the wire to the user and api servers when obtaining tokens and making requests with them. This app lets you setup registered (google, fitbit, etc) apps, manage access tokens, and make api requests.

Instructions

Download repo
Change directory to OAuth2 folder
Run npm install in terminal
Run node index.js in terminal
Click Setup API provider to add details of your registered app e.g. your google app, facebook app, etc.
- api access tokens will be requested, all going to plan you should see something like this:
Click API explorer and provide the endpoint to send a get request to (think very simple postman)
- if you get a bad response due to expired tokens, you can refresh (only google and fitbit) tokens; on the home screen click on the api provider's name and then Refresh token.


App structure (folder layout) inspired by https://scotch.io/tutorials/easy-node-authentication-setup-and-local