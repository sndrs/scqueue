/*global define*/

define(['underscore', 'backbone'], function(_, Backbone) {
  'use strict';

  var TrackModel = Backbone.Model.extend({
    markAsUnavailable: function(){
      console.log('unavailable');
    }
  });

  return TrackModel;
});