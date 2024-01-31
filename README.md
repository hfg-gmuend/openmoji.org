OpenMoji.org
============

Website of the OpenMoji project 👉 http://openmoji.org/

⚠️ Please note that the master branch is in active development!

Developer Setup
---------------
### Installing:
1. Install [node.js](https://nodejs.org) (see version in the file [`.nvmrc`](.nvmrc#L1))
2. Open Terminal and navigate over to the `openmoji.org` folder that you downloaded onto your computer: `cd path/to/folder`

3. Run: `npm install`

### Starting:
Run `npm start`

**Note:** The gzipped openmoji.json (which is mainly responsible for the emojigrid on the home page and the search recommendations) is only loaded by the browser when using `npm start` (or on the actual server), not with `npm preview`. Assumable due to different server configurations.

### Build:
1. Run `npm run build`
2. The build will appear in `/docs`¹

**¹** The folder name */docs* was chosen, because it's a [restriction by Github Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#choosing-a-publishing-source) (which we will be using for staging).

### (Normally not necessary) Downloading Emojipedia-data:
1. Run `node get-emojipedia-data.js`
2. This will get all emoji-descriptions from Emojipedia and save them in `/src/data/emojipediaData.json`

Notes about structure
----

### Astro + Markdown:
Astro doesn't automatically resolve relative file paths yet. However, for convenient editting with a Markdown-editor all pages (e.g. `src/pages/samples/index.md`) have the necessary assets in next to them. These are copied to `public/` using gulp.

### Components:
`components/`-folder: Contains all Astro-components

`components/shared/` contains all components used across the whole site, all others are associated to the page they appear in (`components/about/`, `components/index/` & `components/library/`)

### Layouts:
`layouts/` contains the layouts used to render the markdown pages → [Astro docs](https://docs.astro.build/core-concepts/layouts/)

*BaseLayout* is a simple single column (e.g. used for FAQ) and *LayoutWithSidebar* has a side with table of contents (used on the styleguide and about page)

### Styles:
SCSS is now (where possible) moved to a component level and scoped ([thanks to Astro](https://docs.astro.build/guides/styling/))

All cross-site styles are located in `src/shared-styles/`
