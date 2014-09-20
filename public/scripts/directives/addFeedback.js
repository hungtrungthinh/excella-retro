/* global require, module, exports */
/* jslint browser: true */

var app = require('./_module_init.js');

app.directive('addFeedback', [function() {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/addFeedback.html',
        scope: {
            boardId: '=boardId'
        },
        controller: function($scope, boardService) {
            $scope.userFeedback = [];
            $scope.sendFeedback = function() {
                boardService.sendFeedback($scope.boardId, $scope.feedback).then(function(savedFeedback) {
                    $scope.userFeedback.push(savedFeedback);
                    $scope.sendFeedbackForm.$setPristine();
                    $scope.feedback = '';
                }, function(validation){
                    if(typeof validation !== "object"){
                        validation = [validation];
                    }
                    $scope.validation = validation;
                });
            };
        }
    };
}]);

module.exports = app;