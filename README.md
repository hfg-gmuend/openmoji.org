(WIP) OpenMoji.org
============

Website of the OpenMoji project 👉 http://openmoji.org/

⚠️ Please note that the master branch is in active development! You can view the most recent version under the [staging instance](https://hfg-gmuend.github.io/openmoji.org/).  

Developer Setup
---------------
### Install
1. Install [node.js](https://nodejs.org) (see version in the file [`.nvmrc`](.nvmrc#L1))
2. Open Terminal and navigate over to the `openmoji.org` folder that you downloaded onto your computer:

```
cd path/to/folder
```

3. Run:

```
npm install
```

### Run
```
npm start
```

### Build
```
npm run build
```

Notes
----
- This is a port from the static OpenMoji page to the static site builder [Astro](https://github.com/snowpackjs/astro)
- It's still heavy work-in-progress! A lot (including the OpenMoji library) isn't working yet.
- Astro doesn't automatically resolve relative file paths yet. However, for convenient editting with a Markdown-editor all pages (e.g. `src/pages/samples/index.md`) have the necessary assets in a subfolder. These are copied to `public/` using gulp