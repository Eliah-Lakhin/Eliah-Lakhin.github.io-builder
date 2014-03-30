Eliah-Lakhin.github.io-builder
================================

Static website compilation engine that I use to maintain my personal website:
http://lakhin.com.

It uses [Grunt](http://gruntjs.com/) to build static website's content from
Jade, Less, Markdown, JSON sources.

### Setup

1. Install NodeJS and NPM.
2. Install Grunt-cli.
3. `git clone git@github.com:Eliah-Lakhin/Eliah-Lakhin.github.io-builder.git`.
4. `cd Eliah-Lakhin.github.io-builder.git`.
5. `./bootstrap.sh` - will generate the site and place outputs into `www` dir.


### Commands

 * `grunt compile` - generates static website.
 * `grunt` - performs `grunt compile`, starts static webserver on port 8000, and
   watches for source code changes. Changes in the source code triggers
   appropriate compilation subtasks, so `www` directory is staying in touch with
   sources while the developer editing them. Opened site's web pages are also
   reloading on destination static content changes using `livereload`.
   Livereload holds port 8080.
 * `grunt publish --message "<commit message>"` - commits all changes with
   `<commit message>`, and pushes them to appropriate GitHub's repositories.
