/* jslint node: true */
"use strict";

var board = require('../models/board');
var Hapi = require('hapi');
var io = require('../config/socketSetup').instance;

module.exports = {
    createBoard: {
        handler: function (request, reply) {
            board.create(request.payload.user, request.payload.boardName, request.payload.scrumMasterKey, function (err, board) {
                if (err) {
                    var error = Hapi.error.badRequest('Cannot create board!');
                    error.output.statusCode = 400;
                    reply(error);
                } else {
                    reply(board);
                }
            });
        },
        app: {
            name: 'board'
        }
    },
    getBoard: {
        handler: function (request, reply) {
            board.get(request.params.id, function (err, board) {
                if (err) {
                    var error = Hapi.error.badRequest('Cannot find board!');
                    error.output.statusCode = 404;
                    reply(error);
                } else {
                    reply(board);
                }
            });
        },
        app: {
            name: 'board'
        }
    },
    getBoardParticipants: {
        handler: function (request, reply) {
            board.getBoardParticipants(request.params.id, function (err, board) {
                if (err) {
                    var error = Hapi.error.badRequest('Cannot find board!');
                    error.output.statusCode = 404;
                    reply(error);
                } else {
                    reply(board);
                }
            });
        },
        app: {
            name: 'board'
        }
    },
    setBoardPhase: {
        handler: function (request, reply) {
            board.setPhase(request.params.id, request.payload.phase, request.payload.scrumMasterKey, function(err, board){
                if(err){
                    var error;
                    if(err === "scrum master key mismatch") {
                        error = Hapi.error.badRequest('Cannot update board phase!');
                        error.output.statusCode = 400;
                    } else {
                        error = Hapi.error.badRequest('Cannot find board!');
                        error.output.statusCode = 404;
                    }
                    reply(error);
                } else {
                    if(request.payload.phase === 'voting-started') {
                        io.to(request.params.id).emit('begin-voting', board);
                    } else if(request.payload.phase === 'voting-ended') {
                        io.to(request.params.id).emit('collect-votes', board);
                    } else {
                        io.to(board.id).emit('refreshBoard', board);
                    }
                    reply(true);
                }
            });
        },
        app: {
            name: 'board'
        }
    },
    addFeedback: {
        handler: function (request, reply) {
            board.addFeedback(request.params.id, request.payload.feedback, function (err, feedback) {
                if (err) {
                    var error = Hapi.error.badRequest('Cannot find board!');
                    error.output.statusCode = 404;
                    reply(error);
                    } else {
                        reply(feedback);
                    }
                });
            },
        app: {
            name: 'board'
        }
    },
    getThemes: {
        handler: function (request, reply) {
            board.getThemes(request.params.id, function (err, themes) {
                if (err) {
                    var error = Hapi.error.badRequest('Cannot find board!');
                    error.output.statusCode = 404;
                    reply(error);
                } else {
                    reply(themes);
                }
            });
        },
        app: {
            name: 'board'
        }
    },
    addTheme: {
        handler: function (request, reply) {
            board.addTheme(request.params.id, request.payload.theme, function (err, themes) {
                if (err) {
                    var error = Hapi.error.badRequest('Cannot find board!');
                    error.output.statusCode = 404;
                    reply(error);
                } else {
                    io.to(request.params.id).emit('theme-added', themes);
                    reply(request.payload.theme);
                }
            });
        },
        app: {
            name: 'board'
        }
    },
    addVotes: {
        handler: function (request, reply) {
            board.addVotes(request.params.id, request.payload.themeIdVoteCollection, function (err, themes) {
                if (err) {
                    var error = Hapi.error.badRequest('Cannot find board!');
                    error.output.statusCode = 404;
                    reply(error);
                } else {
                    io.to(request.params.id).emit('theme-added', themes);
                    reply(true);
                }
            });
        },
        app: {
            name: 'board'
        }
    }
};