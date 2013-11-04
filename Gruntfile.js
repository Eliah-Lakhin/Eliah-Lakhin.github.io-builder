module.exports = function(grunt) {
    var commitCommand = 'git add .;' +
        'git commit <%= \'-m "\' + grunt.option(\'message\') + \'"\' %>;' +
        'git push origin master;';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jade: {
            template: {
                options: {
                    pretty: true,
                    data: grunt.file.readJSON('source/jade.json')
                },
                files: [
                    {
                        cwd: 'source/template/',
                        src: ['**/*.jade', '!include/**'],
                        ext: '.html',
                        dest: 'www',
                        expand: true
                    }
                ]
            }
        },

        copy: {
            asset: {
                expand: true,
                cwd: 'source/asset/',
                src: '**/*',
                filter: 'isFile',
                dest: 'www/asset/'
            },

            favicon: {
                src: 'source/favicon.ico',
                dest: 'www/favicon.ico'
            }
        },

        connect: {
            preview: {
                options: {base: 'www'}
            }
        },

        watch: {
            jade: {
                files: ['source/template/**/*.jade', 'source/article/**/*.md',
                    'source/jade.json'],
                expand: true,
                tasks: ['jade:template'],
                options: {spawn: false}
            },

            assets: {
                expand: true,
                files: 'source/asset/**/*',
                tasks: 'copy:asset'
            },

            favicon: {
                files: 'source/favicon.ico',
                tasks: 'copy:favicon'
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
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('compile', ['jade:template', 'copy:asset',
        'copy:favicon']);

    grunt.registerTask('checkMessageArg', function() {
        if (!grunt.option('message')) {
            grunt.fatal('"--message" argument is required');
        }
    });

    grunt.registerTask('publish', ['checkMessageArg', 'exec:pushSource',
        'exec:pushDest', 'exec:pushRoot']);

    grunt.registerTask('default', ['compile', 'connect:preview', 'watch']);
};