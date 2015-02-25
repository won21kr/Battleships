var Reflux = require('Reflux')
  , socket = require('../socket')
  , _ = require('lodash')
  , phase = require('../gamePhase')
  , Actions = require('../actions')
  , gameEvents = require('../../game/gameEvents')
  , GamePhaseStore = require('./GamePhaseStore')
  , FacebookStore = require('./FacebookStore');

var UserStore = Reflux.createStore({
  init() {

    this.state = {
      signedIn: false,
      isPlaying: false,
      user: null,
      opponent: null
    };

    this.listenTo(FacebookStore, this.signInToFb);
    this.listenTo(Actions.init.signInToGame, this.signInToGame);
    this.listenTo(GamePhaseStore, this.updateIsPlaying);

    socket.on(gameEvents.server.enterLobbyStatus, (result) => {
      if(result.isSuccessful) {
        this.state.signedIn = true;
        this.state.user = result.user;
        this.trigger(this.state);
      }
    });

    socket.on(gameEvents.server.gameStarted, (result) => {
      if (result.isSuccessful) {
        this.state.isPlaying = true;
        this.state.opponent = result.opponent;
        this.trigger(this.state);
      }
    });
  },

  updateIsPlaying(game) {
    var {state} = this;
    state.isPlaying = (game.phase > phase.inLobby);
    if(game.phase <= phase.inLobby) {
      state.opponent = null;
    }
    this.trigger(state);
  },

  signInToFb(fbState) {
    this.fbUser = fbState.user;
  },

  signInToGame() {
    this.initStores();

    socket.connect();

    this.enterLobbyCallback = this.enterLobbyCallback || function() {
      socket.emit(gameEvents.client.enterLobby, {id: this.fbUser.id, name: this.fbUser.name});
    }.bind(this);

    socket.removeListener('connect', this.enterLobbyCallback);
    socket.on('connect', this.enterLobbyCallback);
  },

  initStores() {
    require('./ConfigStore');
  }
});

module.exports = UserStore;
