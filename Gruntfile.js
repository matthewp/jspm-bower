module.exports = function(grunt){
  grunt.initConfig({
    simplemocha: {
      def: {
        src: ['test/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('test', ['simplemocha:def']);
};
