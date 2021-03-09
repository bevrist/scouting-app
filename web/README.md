# Tailwind Example

# Install
`npm install`

# Run Site Build
`npm run build`

# Watch Source and Rebuild on Changes
`npm run watch`

# TODO:
add comments to project
- add ARCHITECTURE.md file explaining high level overview of app and choices made
    - gulp.js: used as a task runner for compiling tailwindcss and handlebars
    - handlebars.js: simple templating engine, allows me to compile html snippets together into static html pages. I wanted a way to modularize the components such as the headerand all the forms while still generating static pages. static pages being most useful for simplifying the deployment of the service worker and offline capability. I have'nt learned react yet so dont @ me. 
    - tailwindcss: i anted something to make the site look pretty and tailwind has some nice features over bootstrap, maininly supporting fancy hover and animation states and crazy customization and most importantly build-time file trimming (the compiled tailwind css file goes from 4MB -> 20KB!!)

