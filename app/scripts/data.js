'use strict';

angular.module('data', ['ng']).
  factory('data', function() {
    var SHEET = '0AngbRXPzHA7adDRoeDFVRkZ1UEY5SXBwSjdSLU1nX2c';
    var SPREADSHEETS_API = 'http://spreadsheets.google.com/feeds/cells/';
    var SPREADSHEETS_UI = 'https://docs.google.com/spreadsheet/ccc?key=';
    return {
      getDataSheetUrl: function(index) {
        var url =  SPREADSHEETS_API + SHEET + '/' + index + '/public/basic?alt=json-in-script&callback=JSON_CALLBACK';
        return url;
      },
      getDataSheetHumanUrl: function(index) {
        var url = SPREADSHEETS_UI + SHEET + "#gid=" + index;
        return url;
      },
      parseFromSpreadsheet: function (data) {
        var entries = data.feed.entry;
        var titles = this.getTitles(entries);
        var ret = [];
        var obj;
        for (var i = 0; i < entries.length; ++i) {
          var entry = entries[i];
          var id = entry.id.$t;
          id = this.getCompactId(id);
          if (this.isFirstRow(id)) {
            continue;
          } else {
            var column = this.getColumn(id);
            if (column == "1") {
              obj = {};
              ret.push(obj);
            }
            var content = entry.content.$t;
            obj[titles[column]] = content;
          }
        }
        return ret;
      },

      // returns a map b/w columns to titles. for example {1: "name", "3": 'value'}
      getTitles: function(entries) {
        var titles = {};
        for (var i = 0; i < entries.length; ++i) {
          var entry = entries[i];
          var id = entry.id.$t;
          id = this.getCompactId(id);
          if (this.isFirstRow(id)) {
            var column = this.getColumn(id);
            var content = entry.content.$t;
            titles[column] = content;
          } else {
            continue;
          }
        }
        return titles;
      },
      getColumn: function(id) {
        return id.split('C')[1]
      },
      getCompactId: function(id) {
        return id.substr(id.lastIndexOf('/') + 1);
      },
      isFirstRow: function(id) {
        return id.indexOf("R1C") == 0;
      },
      /**
       * @param target{Array#Object} the object to enrich
       * @param enrichment{Array#Object} the objects used for enrichment
       * @param enrichedFields{Array#Array} an array of [key1, key2] objects
       *        which are used as a foreign key for enrichment
       * @return {Array#Object} A copy of target with enriched fields, if found,
       *         from the enrichment collection
       */
      enrich: function(target, enrichment, enrichedFields) {
        target = angular.copy(target);
        for (var i = target.length - 1; i >= 0; i--) {
          var elem = target[i];
          for (var j = enrichedFields.length - 1; j >= 0; j--) {
            var field = enrichedFields[j];
            var left = field[0];
            var right = field[1];
            var leftVal = elem[left];
            var rightVals = enrichment.filter(function (e) {return e[right] == leftVal});
            if (rightVals && rightVals[0]) {
              elem[left] = rightVals.length == 1 ? rightVals[0] : rightVals;
            }
          };
        };
        return target;
      }
    }
  });
