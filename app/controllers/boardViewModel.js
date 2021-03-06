/* global require, module, exports */
/* jslint browser: true */

var app = require('./_module_init.js');
var constants = require('../../shared/constants/boardConstants');

app.controller('BoardController', ['$scope', '$routeParams', 'userProvider', 'boardService', '$location', '$rootScope', 'socket',
    function($scope, $routeParams, userProvider, boardService, $location, $rootScope, socket) {
    "use strict";
    $scope.phases = constants.phases;

    var hasNoBoardId = !$routeParams.id ;
    if(hasNoBoardId) {
        $location.path('/closed');
    }
    else {
        $scope.socketStatus = "Connecting...";
        var loadBoard = function(cb) {
            if($rootScope.user || $rootScope.scrumMasterKey) {
                boardService.getBoard($routeParams.id).then(function (board) {
                    $rootScope.boardId = $scope.boardId = board.id;
                    $scope.board = board;
                    $scope.themes = board.themes;
                    $scope.participants = board.participants;
                    setIsUserScrumMaster(board.scrumMaster, board.scrumMasterKey);
                    boardService.joinBoard($scope.boardId, $scope.user, $rootScope.scrumMasterKey);
                    $scope.boardStats = { wellCount: board.wellFeedback.length, improveCount: board.improveFeedback.length };
                    $scope.refresh = function () {
                        loadBoard();
                    };

                    // TODO: eventually make this promise-based, or find a better solution?
                    // shim for board refresh on viewThemes.js
                    if (cb) {
                        cb();
                    }
                }).catch(function () {
                    $location.path('/closed');
                });
            } else {
                $location.path('retro/' + $routeParams.id + '/join');
            }
        };

        var setIsUserScrumMaster = function (scrumMaster, boardsScrumMasterKey) {
            var user = userProvider.getUser();

            if (!user || user === '') {
                user = scrumMaster;
            }

            $scope.user = user;

            if ($rootScope.scrumMasterKey) {
                $rootScope.isScrumMaster = userProvider.isUserScrumMaster($rootScope.scrumMasterKey, boardsScrumMasterKey);
                userProvider.setScrumMasterKey($rootScope.scrumMasterKey);
            } else {
                $rootScope.isScrumMaster = false;
            }
        };

        socket.on('error', function (error) {
            $scope.socketStatus = 2;
        });

        socket.on('reconnecting', function (attemptNo) {
            $scope.socketStatus = 1;
        });

        socket.on('reconnect', function (attemptNo) {
            $scope.socketStatus = 0;
            socket.emit(constants.socketEmitters.joinBoard, $rootScope.boardId, $scope.user);
        });

        socket.on('reconnect_failed', function () {
            $scope.socketStatus = 2;
        });

        socket.onConnect(function(){
            $scope.socketStatus = 0;

            socket.on('disconnect', function () {
                $scope.socketStatus = 2;
            });

        });

        if($rootScope.scrumMasterKey) {
            socket.offOn(constants.socketEmitters.feedbackEdited, function (boardStats) {
                if (boardStats) {
                    $scope.boardStats = boardStats;
                }
            });
        }

        socket.offOn(constants.socketEmitters.joined, function(participants){
            $scope.participants = participants;
        });

        socket.offOn(constants.socketEmitters.themesEdited, function(themes){
            $scope.themes = themes;
        });

        socket.offOn(constants.socketEmitters.boardClosed, function(){
            $rootScope.boardId = null;
            $rootScope.scrumMasterKey = null;
            $scope.board = null;
            boardService.clearCache();
            $location.path('/closed');
        });

        socket.offOn(constants.socketEmitters.refreshBoard, function(board){
            $scope.board = board;
        });

        socket.offOn(constants.socketEmitters.wellFeedbackEdited, function(wellFeedback){
            $scope.board.wellFeedback = wellFeedback;
        });

        socket.offOn(constants.socketEmitters.improveFeedbackEdited, function(improveFeedback){
            $scope.board.improveFeedback = improveFeedback;
        });

        socket.offOn(constants.socketEmitters.actionItemsEdited, function(actionItems){
            $scope.board.actionItems = actionItems;
        });

        $rootScope.refreshBoard = this.refreshBoard = loadBoard;

        //Load the board
        loadBoard();
    }
}]);

module.exports = app;