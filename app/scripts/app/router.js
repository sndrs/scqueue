define(function(require){
  'use strict';
          
  var $      = require('jquery'),
  Backbone   = require('backbone'),
  SC = require('soundcloud_sdk'),
  Tracks     = require("app/collections/tracks"),
  TracksView = require('app/views/tracks'),

  tracks     = new Tracks(),
  tracksView = new TracksView({collection: tracks});

  return Backbone.Router.extend({

    routes: {
      '': 'showTracks'
    },

    initialize: function(){
      SC.initialize({client_id:'19a6da49de97a8bffc737fb8cb1a1858'});
    },

    showTracks: function() {
      console.log('home');
      tracksView.render();
    }

  });

})