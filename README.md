# Avatar Creator

A small vanilla-JS avatar builder. Pick a head, hair, eyes, mouth and accessories,
save the result to localStorage, and share it as a PNG via the Web Share API.

## Run

Serve the folder over HTTP (ES modules won't load from `file://`):

```
npx serve .
```

Then open the printed URL.

## Structure

```
index.html                        editor page + saved-avatars list
css/
  main.css                        imports
  base.css                        page basics
  avatar-editor.css               editor + list styles
js/
  app.js                          page routing, window.game API
  controllers/avatar.controller.js  rendering + user actions
  services/avatar.service.js        avatar model, part catalog, CRUD
  services/async-storage.service.js localStorage-backed CRUD
  services/util.service.js          random int, CSS animation helper
img/avatar/                       avatar part sprites
lib/animate.css                   animate.css (used for part animations)
```

Avatar graphics created by Noble Master Games.
