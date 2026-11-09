# Ghar Wali Diwali

A warm, playable 3D Diwali neighbourhood. Wander through homes, prepare and light a diya, make rangoli, exchange sweets, join pooja, eat with the family and play cards at **bkhh**.

## Run locally

Requires Node.js for checks and Python 3 for the local server. No package installation or build is needed.

```sh
npm run check
npm run dev
```

Open http://localhost:4178/. Three.js and fonts are bundled locally.

## Play

- WASD / arrow keys: walk; drag: look around; tap a destination to walk there.
- E: interact; V: change view; F: fullscreen; Escape: leave an activity or room.
- Use the compass for house travel and the bottom toolbar for Diwali activities.
- On touch devices, use the movement pad.
- At bkhh, six friends play fixed-limit Texas Hold’em with play chips. Eeshita is your seat, with Abheek beside you, plus Anshu, Yash, Aayush and Ekansh. Actions are at the bottom of the screen.

The clock and 8 PM pooja use in-game time. Progress is saved locally in your browser. The game is a first-person browser experience, not a headset/WebXR implementation.

## Deployment

The GitHub Actions workflow checks the game and deploys `dist/` to GitHub Pages on pushes to `main`. Repository Settings → Pages must use **GitHub Actions** as the publishing source.

## Checks

`npm run check` covers hand rankings, 480 simulated poker hands, chip conservation and side pots, 660 character poses, limb connections, hand placement, wrist movement and animated dealing/betting transitions.

## Third-party assets

Three.js: `dist/vendor/THREE-LICENSE.txt`. Kalam and Nunito fonts: the OFL notices in `dist/fonts/`.
