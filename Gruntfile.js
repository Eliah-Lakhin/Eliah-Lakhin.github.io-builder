module.exports = function(grunt) {
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

        markdown: {
            article: {
                cwd: 'source/article',
                src: ['**/*.md'],
                expand: true,
                dest: 'www/html/',
                ext: '.html',
                options: {
                    template: 'source/article/template.txt',
                    markdownOptions: {

                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('compile', ['jade:template']);
    grunt.registerTask('default', ['compile', 'connect:preview', 'watch']);
};