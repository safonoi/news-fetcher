module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'config/*.js', 'src/**/*.js'],
      options: {
        reporter: require('jshint-stylish'),
        // Check js as ES6
        esnext: true
      }
    },
    babel: {
      options: {
        sourceMap: true,
        modules: "common"
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['**/*.js'],
          dest: 'build/',
          ext: ".js"
        }]
      }
    },
    watch: {
      scripts: {
        files: ['Gruntfile.js', 'src/**/*.js'],
        tasks: ['jshint', 'babel']
      },
      config: {
        files: ['config/*.js'],
        tasks: ['jshint']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['jshint', 'babel', 'watch']);
};
