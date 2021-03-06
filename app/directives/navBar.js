/* global require, module, exports */
/* jslint browser: true */

var app = require('./_module_init.js');

app.directive('navBar', [function() {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/navBar.html',
        scope: {
            user: '=user',
            boardName: '=boardName',
            socketStatus: '=socketStatus',
            participants: '=participants',
            isScrumMaster: '=isScrumMaster'
        }, controller: function($scope, boardService) {
        }
    };
}]);

module.exports = app;