var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var FaceCardTypes = (function () {
    function FaceCardTypes() {
        this.JACK = 11;
        this.QUEEN = 12;
        this.KING = 13;
        this.ACE = 1;
    }
    return FaceCardTypes;
})();
var Suites = (function () {
    function Suites() {
        this.SPADES = 1;
        this.HEARTS = 2;
        this.DIAMONDS = 3;
        this.CLUBS = 4;
    }
    return Suites;
})();
var Card = (function () {
    function Card(suite, value, isFace) {
        this._suite = suite;
        this._value = value;
        this._isFace = isFace;
    }
    Card.prototype.getValue = function () {
        return this._value;
    };
    Card.prototype.getSuite = function () {
        return this._suite;
    };
    Card.prototype.isFace = function () {
        return this._isFace;
    };
    Card.prototype.asString = function () {
        return this.getValue() + " of " + this.getSuite();
    };
    return Card;
})();
var FaceCard = (function (_super) {
    __extends(FaceCard, _super);
    function FaceCard(faceType, suite, value) {
        _super.call(this, suite, value, true);
        this._faceType = faceType;
    }
    FaceCard.prototype.isFace = function () {
        return true;
    };
    FaceCard.prototype.asString = function () {
        return this._faceType + " " + _super.prototype.getValue.call(this);
    };
    return FaceCard;
})(Card);
var Deck = (function () {
    function Deck() {
        this.Cards = [];
        for(var suite in new Suites()) {
            for(var i = 1; i < 11; i++) {
                this.Cards.push(new Card(suite, i, false));
            }
            var faceCardLookup = new FaceCardTypes();
            for(var face in new FaceCardTypes()) {
                this.Cards.push(new FaceCard(face, suite, faceCardLookup[face]));
            }
        }
    }
    return Deck;
})();
var Player = (function () {
    function Player(n) {
        this.hand = [];
        this.name = n;
    }
    Player.prototype.JoinGame = function (game) {
        this.gameContext = game;
        this.playerTurnStrategy = game.playerTurnStrategy;
    };
    Player.prototype.Shuffle = function (deck) {
        return _.shuffle(deck);
    };
    Player.prototype.PluckCards = function (count) {
        this.Deal(this, count, this.gameContext.drawPile);
    };
    Player.prototype.Discard = function (card) {
        this.gameContext.discardPile.push(card);
        this.hand = _.reject(this.hand, function (c) {
            return card == c;
        });
    };
    Player.prototype.Deal = function (player, cardCount, deck) {
        var hand = _.take(deck.Cards, cardCount);
        deck.Cards = _.reject(deck.Cards, function (card) {
            return _.any(hand, function (handCard) {
                return card == handCard;
            });
        });
        _.each(hand, function (card) {
            player.hand.push(card);
        });
    };
    Player.prototype.ShowHand = function () {
        console.log("*****" + this.name + "*********");
        _.each(this.hand, function (card) {
            console.log(card.asString());
        });
        console.log("**************");
    };
    return Player;
})();
var GameEngine = (function () {
    function GameEngine(players, deck, turnStrategy, winRule) {
        this.players = players;
        var gameCtx = this;
        this.drawPile = deck;
        this.playerTurnStrategy = turnStrategy;
        this.winningRule = winRule;
        this.discardPile = [];
        _.each(players, function (p) {
            p.JoinGame(gameCtx);
        });
    }
    GameEngine.prototype.PlayRound = function () {
        var deck = this.drawPile;
        _.each(this.players, function (player) {
            player.playerTurnStrategy(player, deck);
        });
    };
    GameEngine.prototype.HasWinner = function () {
        return this.winningRule(this.players);
    };
    GameEngine.Start = function Start(game, players) {
        return new GameEngine(players, new Deck(), game.playerTurnStrategy, game.winningRule);
    }
    return GameEngine;
})();
var TestGame = (function () {
    function TestGame() { }
    TestGame.prototype.playerTurnStrategy = function (player) {
        if(player.hand.length == 0) {
            player.PluckCards(3);
        } else {
            var lowestCard = _.take(_.sortBy(player.hand, function (c) {
                return c.getValue();
            }), 1);
            player.Discard(lowestCard.pop());
            player.PluckCards(1);
        }
    };
    TestGame.prototype.winningRule = function (players) {
        var rankings = _.sortBy(players, function (player) {
            return _.reduce(player.hand, function (memo, card) {
                return memo + card.getValue() * -1;
            }, 0);
        });
        _.each(rankings, function (p) {
            p.ShowHand();
        });
        return _.take(rankings, 1);
    };
    return TestGame;
})();
var gamers = [
    new Player("Stan"), 
    new Player("Jack"), 
    new Player("Adi")
];
var game = GameEngine.Start(new TestGame(), gamers);
