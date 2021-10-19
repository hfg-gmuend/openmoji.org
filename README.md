(WIP) OpenMoji.org
============

---

**This is a port from the static OpenMoji page to the static site builder [Astro](https://github.com/snowpackjs/astro).**<br>
⚠️ It's still heavy work-in-progress! A lot (including the OpenMoji library) isn't working yet or doesn't completely look like in the original.

---

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

Structure
----

### Astro + Markdown:
Astro doesn't automatically resolve relative file paths yet. However, for convenient editting with a Markdown-editor all pages (e.g. `src/pages/samples/index.md`) have the necessary assets in a subfolder. These are copied to `public/` using gulp

Astro is gonna launch support for components inside Markdown files [soon](https://astro.build/blog/astro-021-preview/). This will enable us to have the dynamic authors list inside the .md for the about page. When I tried it didn't start yet, so we'll have to wait until release for this.

### Components:
`components/`-folder: Contains all Astro-components

`components/shared/` contains all components used across the whole site, all others are associated to the page they appear in (`components/about/`, `components/index/` & `components/library/`)

### Layouts:
`layouts/` contains the layouts used to render the markdown pages → [Astro docs](https://docs.astro.build/core-concepts/layouts/)

*BaseLayout* is a simple single column (e.g. used for FAQ) and *LayoutWithSidebar* has a side with table of contents (used on the styleguide and about page)

### Styles:
SCSS is now (where possible) moved to a component level and ([thanks to Astro](https://docs.astro.build/guides/styling/)) scoped

All cross-site styles are located in `src/shared-styles/`