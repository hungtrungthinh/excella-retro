/* global require, angular, module, exports */
/* jslint browser: true */

require('../../bower_components/angular/angular');
var _ = require('../../bower_components/lodash/dist/lodash');

var app = angular.module('remoteRetro.boardService', []);
app.factory('boardService', ['$http', '$q', 'userProvider',
        function($http, $q, userProvider){
            "use strict";
            var boardUrl = '../board';

            return {
                createBoard: function (user, boardName, scrumMasterKey) {
                    var deferred = $q.defer();
                    $http.post(boardUrl, { user: user, boardName: boardName, scrumMasterKey: scrumMasterKey }).then(function (ctx) {
                        deferred.resolve(ctx.data);
                    }, function (ctx) {
                        deferred.reject(ctx.data);
                    });
                    return deferred.promise;
                },
                getBoard: function (boardId) {
                    var deferred = $q.defer();
                    $http.get(boardUrl + '/' + boardId).then(function (ctx) {
                        deferred.resolve(ctx.data);
                    }, function (ctx) {
                        deferred.reject(ctx.data);
                    });
                    return deferred.promise;
                },
                getBoardParticipants: function (boardId) {
                    var deferred = $q.defer();
                    $http.get(boardUrl + '/' + boardId + '/participants').then(function (ctx) {
                        deferred.resolve(ctx.data);
                    }, function (ctx) {
                        deferred.reject(ctx.data);
                    });
                    return deferred.promise;
                },
                joinBoard: function (boardId, user) {
                    var deferred = $q.defer();
                    $http.put(boardUrl + '/' + boardId + '/join', {user: user}).then(function (ctx) {
                        deferred.resolve(ctx.data);
                    }, function (ctx) {
                        deferred.reject(ctx.data);
                    });
                    return deferred.promise;
                },
                sendFeedback: function (boardId, feedback) {
                    var deferred = $q.defer();
                    $http.post(boardUrl + '/' + boardId + '/feedback', {feedback: feedback}).then(function (ctx) {
                        deferred.resolve(ctx.data);
                    }, function (ctx) {
                        deferred.reject(ctx.data);
                    });
                    return deferred.promise;
                },
                getJoinBoardUrl: function (boardId) {
                    return window.location.origin + '/#/board/' + boardId + '/join';
                },
                getScrumMasterAccessUrl: function (boardId, scrumMasterKey) {
                    return window.location.origin + '/#/board/' + boardId + '/' + scrumMasterKey;
                },
                save: function (board) {
                    var deferred = $q.defer();
                    $http.put(boardUrl + board._id, { user: userProvider.getUser(), board: board }).then(function (ctx) {
                        _.extend(board, ctx.data);
                        deferred.resolve(board);
                    }, function (ctx) {
                        deferred.reject(ctx.data);
                    });
                    return deferred.promise;
                }
            };
        }]);

module.exports = app;

