# Avatar models

Drop a generic humanoid `.glb` here (e.g. `src/assets/humanoid.glb`, served from
`public/models/humanoid.glb` in production) and set:

```env
VITE_AVATAR_URL=/models/humanoid.glb
```

Name the meshes after body parts (`lat_l`, `chest`, `biceps_r`, `quad_l`, ...)
so the dolly-zoom target highlight can find them — matching is
case-insensitive substring search (see `MUSCLE_KEYWORDS` in
`src/components/Avatar3D.jsx`).

Without a `.glb`, the built-in procedural muscle model is used.
