module.exports = function(grunt) {
    var commitCommand = 'git add .;' +
        'git commit <%= grunt.option(\'message\') ? \'-m "\' + grunt.option(\'message\') + \'"\' : \'\' %>;' +
        'git push origin master;';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jade: {
            template: {
                options: {
                    pretty: true
                },
                files: {
                    'www/index.html': 'source/template/index.jade'
                }
            }
        },

        connect: {
            preview: {
                options: {base: 'www'}
            }
        },

        watch: {
            jade: {
                files: ['source/template/**/*.jade', 'source/article/**/*.md'],
                expand: true,
                tasks: ['jade:template'],
                options: {spawn: false}
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
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('compile', ['jade:template']);

    grunt.registerTask('publish', ['exec:pushSource', 'exec:pushDest', 'exec:pushRoot']);

    grunt.registerTask('default', ['compile', 'connect:preview', 'watch']);
};