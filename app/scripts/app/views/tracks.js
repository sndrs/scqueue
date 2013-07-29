define(function(require) {
  'use strict';

  var $      = require('jquery'),
    _        = require('underscore'),
    Backbone = require('backbone'),
    JST      = require('templates'),
    $UI      = require('jqueryui'),
    $UITouch = require('jqueryui_touch');

  return Backbone.View.extend({

    template: JST['app/scripts/templates/tracks.ejs'],
    el: '#scq-queue',

    events: {
      'click #scq-add_track': 'addTrackByURL',
      'click .scq-track-remove': 'removeTrack',
      'click .scq-track-play': 'togglePlayback'
    },

    initialize: function() {
      this.nowPlaying = null;
      this.listenTo(this.collection, 'add', this.showTrack);
      this.listenTo(this.collection, 'remove', this.hideTrack);
      this.listenTo(this.collection, 'reset', this.render);
      _.bindAll(this, 'positionTrack', 'loadFirstTrack', 'finishPlayback');
    },

    render: function() {
      // render the queue
      this.$('#scq-queue-tracks').html(this.template(this.collection.toJSON())).sortable({
        handle: '.scq-track-grabber',
        axis: 'y',
        opacity: 0.5,
        items: "> li:not(.scq-track-playing)",
        stop: this.positionTrack
      })


      // if the queue isn't empty, load the first track
      this.collection.length > 0 && this.loadFirstTrack();

      return this;
    },

    // Loads the first track. Adds a class that reveals the play button etc, and plays it if conditions are met.
    loadFirstTrack: function(options) {
      var track  = this.collection.first(),
          $track = this.$('[data-scq-track_id=' + track.get('id') + ']');
      
      // Do nothing if we can't stream this.
      // This doesn't take account of tracks whose streamable status has changed since they were added to the queue. 
      // It should but no time :)
      if(!track.get('streamable')){return this;};

      _.defaults(options || (options = {}), {
        autoPlay: false
      });

      $track.addClass('scq-track-loaded');

      // if the last is still being played (i.e. we're skipping it), stop it, and flag autoPlay as true.
      if(this.nowPlaying && this.nowPlaying.playState === 1 && !this.nowPlaying.paused){ 
        this.nowPlaying.stop();
        options.autoPlay = true; 
      };

      // load the actual track and play it if we should
      SC.stream(track.get('uri'), function(sound) {
        this.nowPlaying = sound;
        options.autoPlay && this.togglePlayback();
      }.bind(this));
      
      return this;
    },

    // Append a track to the dom list.
    showTrack: function(track) {
      $('#scq-queue-tracks').append(JST['app/scripts/templates/track.ejs'](track.toJSON()));
      this.delegateEvents();

      // If this is the first track, load it.
      $('.scq-track-loaded').length > 0 || this.loadFirstTrack();
      return this;
    },

    // handle delete button clicks. Tells the collection to remove a model.
    removeTrack: function(e) {
      this.collection.removeTrack($(e.target).closest('[data-scq-track_id]').data('scq-track_id'));
      return this;
    },

    // handle removal of models from the collection.
    hideTrack: function(track) {
      var $track = this.$('[data-scq-track_id=' + track.get('id') + ']');
      if($track.length > 0){
        $track.remove();
        // if the queue is not empty now, and nothing is loaded 
        // (i.e. we've just deleted the playing track), load the next track. otherwise, stop any playback.
        if(this.collection.length > 0 && !$('.scq-track-loaded').length > 0){
          this.loadFirstTrack();
        } else {
          this.nowPlaying && this.nowPlaying.stop();
        }
      }
    },

    // update the collection after sorting the list in the UI.
    positionTrack: function(e, ui) {
      this.collection.positionTrack(ui.item.data('scq-track_id'), ui.item.index());
      // If we've adjusted the position of the loaded track, unload it and load the new top track.
      if(!$('.scq-track').first().hasClass('scq-track-loaded')){      
        $('.scq-track-loaded').removeClass('scq-track-loaded');
        this.loadFirstTrack();
      }
      return this;
    },

    // handle tracks added in the box.
    addTrackByURL: function() {
      var $textBox = $('#scq-add-url');
      this.collection.addTrackByURL($textBox.val());
      $textBox.val('').focus();
      return this;
    },

    // start and stop audio playback.
    // Doesn't error handle e.g. tracks which have been marked as unstreamable in apps since being added to the queue, which it should...
    togglePlayback: function() {
      if (this.nowPlaying !== null) {
        this.$('.scq-track-loaded').toggleClass('scq-track-playing')
          .find('.scq-track-play').toggleClass('sc-button-play sc-button-pause');
        if (this.nowPlaying.playState === 0) {
          this.nowPlaying.play({
            onfinish: this.finishPlayback
          })
        } else {
          this.nowPlaying.togglePause();
        }
      }
      return this;
    },

    finishPlayback: function() {
      this.$('.scq-track-loaded').remove();
      this.collection.removeTrack(this.collection.first(), {silent: true});
      this.loadFirstTrack({
        autoPlay: true
      });
      return this;
    }

  });

})