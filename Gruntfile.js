/*global module:false*/
module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var host = "cmis.alfresco.com";
  var port = 80;
  var path = "/cmisbrowser";

  if (process.argv.indexOf('--host')!=-1) {
    host = process.argv[process.argv.indexOf('--host')+1];
  }

  if (process.argv.indexOf('--port')!=-1) {
    port = process.argv[process.argv.indexOf('--port')+1];
  }

  if (process.argv.indexOf('--path')!=-1) {
    path = process.argv[process.argv.indexOf('--path')+1];
  }

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '* <%= pkg.description %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: ['lib/{,*/}*.js'],
        dest: 'min/<%= pkg.name %>.min.js'
      },
      all:{
        src: ['node_modules/superagent/superagent.js','<%= uglify.dist.dest %>'],
        dest: 'min/<%= pkg.name %>.min-all.js'
      }
    },
    jshint: {
      options: grunt.file.readJSON('.jshintrc'),
      lib_test: {
        src: ['lib/{,*/}*.js']
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/*.js']
      }
    },
    connect: {
      server: {
        proxies: [
          {
              context: '/cmisbrowser',
              host: host,
              port: port,
              rewrite:{'^/cmisbrowser': path},
              changeOrigin: true
          }
        ],
        options: {
          port: 9000,
          keepalive: true,
          middleware: function (connect, options) {
            var config = [
                connect.static(options.base),
                connect.directory(options.base)
                ];
            var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
            config.unshift(proxy);
            return config;
          }
        },

      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }
    }
  });



  grunt.registerTask('dist', ['uglify']);
  grunt.registerTask('server', ['configureProxies:server','connect']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('hint', ['jshint']);

};
