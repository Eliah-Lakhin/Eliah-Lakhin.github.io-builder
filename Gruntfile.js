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
        commitCommand = 'git add -A .;' +
        'git commit <%= \'-m "\' + grunt.option(\'message\') + \'"\' %>;' +
        'git push origin master;';

    var jade = function(custom, src, dst) {
        var files = {},
            config = grunt.file.readJSON('source/page.json');

        files['www/' + dst] = 'source/page/' + src;

        return {
            options: {
                data: extend({}, config, {
                    page: config.pages[custom],
                    functions: {
                        titleToId: function(title) {
                            return title
                                .replace(new RegExp(' ', 'g'), '-')
                                .toLowerCase();
                        }
                    }
                })
            },
            files: files
        };
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jade: {
            index: jade('index', 'index.jade', 'index.html'),
            projects: jade('projects', 'projects.jade', 'projects/index.html'),
            'project-papa-carlo': jade('project-papa-carlo',
                'projects/papa-carlo.jade', 'projects/papa-carlo/index.html')
        },

        copy: {
            other: {
                expand: true,
                cwd: 'source/other/',
                src: ['**/*', '.nojekyll'],
                filter: 'isFile',
                dest: 'www/'
            }
        },

        less: {
            bootstrap: {
                options: {
                    paths: ['source/design'],
                    cleancss: true
                },

                files: {'www/bootstrap.css': 'source/design/bootstrap.less'}
            },

            bootstrapTheme: {
                options: {
                    paths: ['source/design'],
                    cleancss: false
                },

                files: {'www/bootstrap-theme.css': 'source/design/theme.less'}
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
                files: ['source/page/**/*', 'source/article/**/*.md',
                    'source/article/**/*.jade', 'source/page.json'],
                expand: true,
                tasks: ['jade'],
                options: {spawn: false}
            },

            other: {
                expand: true,
                files: 'source/other/**/*',
                tasks: 'copy:other'
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

    grunt.registerTask('compile', ['jade', 'copy:other', 'less']);

    grunt.registerTask('checkMessageArg', function() {
        if (!grunt.option('message')) {
            grunt.fatal('"--message" argument is required');
        }
    });

    grunt.registerTask('publish', ['checkMessageArg', 'compile',
        'exec:pushSource', 'exec:pushDest', 'exec:pushRoot']);

    grunt.registerTask('default', ['compile', 'connect:preview', 'watch']);
};