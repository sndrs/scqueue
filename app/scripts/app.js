/*global require*/
'use strict';

require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery',
    jqueryui: 'vendor/jquery-ui-1.10.3.custom',
    jqueryui_touch: '../bower_components/jquery-ui-touch-punch/jquery.ui.touch-punch',
    backbone: '../bower_components/backbone/backbone',
    underscore: '../bower_components/underscore/underscore',
    soundcloud_sdk: '//connect.soundcloud.com/sdk'
  },
  shim: {
    jqueryui: {
        deps: ['jquery']
    },
    jqueryui_touch: {
        deps: ['jquery', 'jqueryui']
    },
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    soundcloud_sdk: {
      exports: 'SC'
    }
  }
});

require(['backbone', 'app/router'], function(Backbone, Router) {
  var router = new Router();
  Backbone.history.start();
});