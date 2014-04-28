module.exports = function(grunt) {
    var marked = require('marked'),
        highlightJS = require('highlight.js');

    marked.setOptions({
        highlight: function (code, lang) {
            if (lang) {
                return highlightJS.highlight(lang, code).value;
            } else {
                return code;
            }
        }
    });

    var extend = require('extend'),
        addCommand = 'git add -A .;',
        commitCommand = 'git add -A .;' +
        'git commit <%= \'-m "\' + grunt.option(\'message\') + \'"\' %>;' +
        'git push origin master;';

    var titleToId = function(title) {
            return title
                .replace(new RegExp(' ', 'g'), '-')
                .replace(new RegExp('\\.', 'g'), '-')
                .replace(new RegExp('--', 'g'), '')
                .toLowerCase();
        },
        blogPostId = function(date, title, escape) {
            return (escape ? titleToId(date) : date) + '-' + titleToId(title);
        },
        getConfig = function() {
            return grunt.file.readJSON('source/config.json');
        },
        stringToDate = function(string) {
            var parsed = string
                .split('.')
                .map(function(component) {
                    return parseInt(component);
                });

            return new Date(parsed[2], parsed[1] - 1, parsed[0])
        };

    var jade = function(pageName, src, dst, customData, customOptions) {
        var files = {},
            config = getConfig();

        files['www/' + dst] = 'source/template/' + src;

        customData = extend({}, {page: pageName}, customData || {});

        return {
            options: extend({
                data: extend({}, config, {
                    page: config.pages[pageName],
                    functions: {
                        titleToId: titleToId,
                        blogPostId: blogPostId,
                        stringToDate: stringToDate,
                        formatBlogEntryDate: function(string) {
                            var date = stringToDate(string),
                                config = getConfig();

                            return config.common.months[date.getUTCMonth()] +
                                ' ' + date.getUTCFullYear();
                        }
                    },
                    custom: customData
                })
            }, customOptions || {}),
            files: files
        };
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jade: extend({
            home: jade('home', 'home.jade', 'index.html'),

            page404: jade('page404', 'page404.jade', '404.html'),

            projects: jade('projects', 'projects.jade', 'projects/index.html'),
            'project-papa-carlo': jade('project-papa-carlo',
                'projects/papa-carlo.jade', 'projects/papa-carlo/index.html'),

            blog: jade('blog', 'blog.jade', 'blog/index.html'),

            rssRu: jade('blog', 'rss.jade', 'blog/feed-ru.rss', {},
                {pretty: true}),

            rssEn: jade('blog', 'rss.jade', 'blog/feed.rss',
                {filterEnglish: true}, {pretty: true})
        }, (function() {
            var blogConfig = getConfig().pages.blog,
                blogTasks = {};
            for (var index = 0, length = blogConfig.posts.length;
                 index < length;
                 index++) {
                var post = blogConfig.posts[index],
                    id =  blogPostId(post.date, post.title);

                if (post.post) {
                    var postUrl = '/blog/' + id + '/';

                    blogTasks['post-' + id] = jade(
                        'blog',
                        'post.jade',
                        'blog/' + id + '/index.html',
                        {
                            post: post,
                            title: post.title,
                            postUrl: postUrl,
                            disqus: {
                                threadId: 'blog/' + id,
                                title: post.title,
                                url: postUrl
                            }
                        }
                    );
                } else {
                    var link = null;

                    for (var refCaption in post.refs) {
                        if (post.refs.hasOwnProperty(refCaption)) {
                            link = post.refs[refCaption];
                            break;
                        }
                    }

                    if (link) {
                        blogTasks['post-' + id] = jade(
                            'redirect',
                            'redirect.jade',
                            'blog/' + id + '/index.html',
                            {redirectUrl: link}
                        );
                    }
                }
            }

            return blogTasks;
        })()),

        copy: {
            static: {
                expand: true,
                cwd: 'source/static/',
                src: ['**/*', '.nojekyll'],
                filter: 'isFile',
                dest: 'www/'
            },

            papaCarloDemo: {
                expand: true,
                cwd: 'external/papa-carlo/demo',
                src: ['*.js', '*.html', '*.json',
                    'target/scala-*/papa-carlo-opt.js'],
                filter: 'isFile',
                dest: 'www/projects/papa-carlo/demo/'
            }

        },

        less: {
            bootstrap: {
                options: {
                    paths: ['source/design'],
                    cleancss: true
                },

                files: {
                    'www/bootstrap.css': 'source/design/bootstrap.less'
                }
            },

            theme: {
                options: {
                    paths: ['source/design'],
                    cleancss: false
                },

                files: {
                    'www/theme.css': 'source/design/theme.less',
                    'www/home.css': 'source/design/home.less',
                    'www/blog.css': 'source/design/blog.less',
                    'www/works.css': 'source/design/works.less'
                }
            }
        },

        connect: {
            preview: {
                options: {
                    base: 'www',
                    hostname: '*',
                    port: 8000,
                    livereload: 8080
                }
            }
        },

        watch: {
            jade: {
                files: ['source/template/**/*', 'source/content/**/*',
                    'source/config.json'],
                expand: true,
                tasks: ['jade'],
                options: {spawn: false}
            },

            static: {
                expand: true,
                files: 'source/static/**/*',
                tasks: 'copy:static'
            },

            less: {
                expand: true,
                files: 'source/design/**/*.less',
                tasks: 'less'
            },

            livereload: {
                files: 'www/**/*',
                options: {livereload: 8080}
            }
        },

        exec: {
            pushSource: {
                cwd: 'source',
                cmd: commitCommand
            },

            addDest: {
                cwd: 'www',
                cmd: addCommand
            },

            pushDest: {
                cwd: 'www',
                cmd: commitCommand
            },

            pushRoot: {
                cmd: commitCommand
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('compile', ['jade', 'copy', 'less']);

    grunt.registerTask('checkMessageArg', function() {
        if (!grunt.option('message')) {
            grunt.fatal('"--message" argument is required');
        }
    });

    grunt.registerTask('publish', ['checkMessageArg', 'compile',
        'exec:pushSource', 'exec:pushDest', 'exec:pushRoot']);

    grunt.registerTask('save', ['checkMessageArg', 'compile',
        'exec:pushSource', 'exec:addDest', 'exec:pushRoot']);

    grunt.registerTask('default', ['compile', 'connect:preview', 'watch']);
};
