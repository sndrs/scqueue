define(function(require){
  'use strict';
          
  var Backbone = require('backbone');

  return Backbone.Collection.extend({

    initialize: function(){
      this.storageKey = 'SCQueue.tracks';
      this.loadFromStorage();

      // if the stored items changes (e.g. by a process in another browser window), reload them.
      $(window).on('storage', function(e) {
        e.originalEvent.key === this.storageKey && this.loadFromStorage();
      }.bind(this));
    },

    // Saves the queue to localStorage
    store: function(){
      localStorage.setItem(this.storageKey, JSON.stringify(this.toJSON()));
      return this;
    },

    // Loads the queue from localStorage into this collection.
    loadFromStorage: function(){
      this.reset(JSON.parse(localStorage.getItem(this.storageKey)));
      return this;
    },

    // Adds a track to the collection.
    // It doesn't allows dupes currently (built in to backbone) or warn why dupes have not been added. It should though...
    addTrack: function(track){
      track.kind === 'track' && this.add(track).store();
      return this;
    },

    // Takes a URL and tries to add the track.
    addTrackByURL: function(url){ 
      SC.get('/resolve?url=' + url, function(response, error) {
        if (error) {
          alert('Unable to add the track — is this a SoundCloud track URL?');
          console.log(url, error.message);
        } else {
          // If this is track, add it.
          if(response.kind === 'track'){
            this.addTrack(response);
          } else if (response.tracks){
            // If it has an array of tracks, add them.
            _(response.tracks).each(function(track){
              this.addTrack(track)
            }.bind(this))
          } else {
            alert('Unable to add the track — is this a SoundCloud track URL?');
          };
        }
      }.bind(this));
      return this;
    },

    removeTrack: function(id, options){
      var track = this.get(id);
      this.remove(track, options).store();
      return this;
    },

    // Adjust the position of a track in the list of tracks.
    // Does it silently since the re-ordering is triggered by a UI event anyway.
    positionTrack: function(id, index){
      var track = this.get(id);
      this.remove(track, {silent: true}).add(track, {at: index, silent: true}).store();
      return this;
    },
  });

})