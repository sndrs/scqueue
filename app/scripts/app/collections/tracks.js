define(function(require){
  'use strict';
          
  var Backbone = require('backbone'),
      Track    = require("app/models/track");

  return Backbone.Collection.extend({
    model: Track,

    initialize: function(){
      this.storageKey = 'SCQueue.tracks';
      this.loadFromStorage();
      $(window).on('storage', function(e) {
        e.originalEvent.key === this.storageKey && this.loadFromStorage();
      }.bind(this));
    },

    store: function(){
      localStorage.setItem(this.storageKey, JSON.stringify(this.toJSON()));
      return this;
    },

    loadFromStorage: function(){
      this.reset(JSON.parse(localStorage.getItem(this.storageKey)));
      return this;
    },

    addTrack: function(track){
      this.add(track).store();
      return this;
    },

    addTrackByURL: function(url){
      console.log(url);  
      SC.get('/resolve?url=' + url, function(response, error) {
        if (error) {
          alert('Unable to add the track — is the URL correct?');
          console.log(url, error.message);
        } else {
          this.addTrack(response);
        }
      }.bind(this));
      return this;
    },

    removeTrack: function(id, options){
      var track = this.get(id);
      this.remove(track, options).store();
      return this;
    },

    positionTrack: function(id, index){
      var track = this.get(id);
      this.remove(track, {silent: true}).add(track, {at: index, silent: true}).store();
      return this;
    },
  });

})