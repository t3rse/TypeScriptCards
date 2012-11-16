/// <reference path="underscore.browser.d.ts" />

interface ICard{
    isFace():bool;
    getValue():number;
    getSuite():string;    
}

interface IGame { 
    dealOnFirstTurn: bool;
    playerTurnStrategy(player: Player);
    winningRule(players: Player[]):Player;    
}

class FaceCardTypes { 
    JACK: number = 11;
    QUEEN: number = 12;
    KING: number = 13;
    ACE: number = 1;
}

class Suites { 
    SPADES: number = 1; 
    HEARTS: number = 2;
    DIAMONDS: number = 3;
    CLUBS: number = 4;
}
// implement the ICard Interface
class Card implements ICard{
    private _value: number;
    private _suite: string;
    private _isFace: bool;

    // constructor with suffixes specifying type
    constructor(suite: string, value: number, isFace: bool){
        this._suite = suite;
        this._value = value;    
        this._isFace = isFace;
    }

    // must implement via interface
    public getValue(){
        return this._value;
    }

    // must implement via interface
    public getSuite(){
        return this._suite;
    }

    // must implement via interface
    public isFace(){ return this._isFace; }

    public asString() { 
        return this.getValue() + " of " + this.getSuite();
    }
}

// Inheriting the Card definition with extends 
class FaceCard extends Card{  
    private _faceType: string;
    constructor(faceType: string, suite: string, value: number){
        super(suite, value, true);
        this._faceType = faceType;
    }

    // override 
    public isFace() { return true; }

    // override
    public asString() { 
        return this._faceType + " " + super.getValue();
    }
}

class Deck { 
    public Cards: Card[];

    constructor () { 
        this.Cards = [];
        // for in, lets me get the string "SPADES", "CLUBS" etc
        for (var suite in new Suites()) {
            for (var i = 1; i < 11; i++) {
                this.Cards.push(new Card(suite, i, false));
            }
            var faceCardLookup = new FaceCardTypes();
            // for.. in, lets me get each facecard type "JACK", "QUEEN" but also look up 
            // it's numerical value like a property bag with faceCardLookup[face]
            for (var face in new FaceCardTypes()) { 
                this.Cards.push(new FaceCard(face, suite, faceCardLookup[face]));
            }
        }    
    }
}


class Player { 
    public name: string;
    public hand: Card[];
    private gameContext: GameEngine;
    public playerTurnStrategy: (player: Player, deck: Deck) =>{ };


    constructor (n:string) { 
        this.hand = [];
        this.name = n;
        
    }

    JoinGame(game: GameEngine) { 
        this.gameContext = game;
        this.playerTurnStrategy = game.playerTurnStrategy;
    }

    Shuffle(deck: Deck) { 
        return _.shuffle(deck);
    }

    PluckCards(count: number) { 
        // just deal yourself some cards
        this.Deal(this, count, this.gameContext.drawPile);
    }

    Discard(card:Card) { 
        this.gameContext.discardPile.push(card);

        this.hand = _.reject(this.hand, function (c:Card) { 
            return card == c;
        });

    }





    Deal(player: Player, cardCount: number, deck: Deck) { 
        // take out some cards
        var hand = _.take(deck.Cards, cardCount);

        // filter them out of the deck
        deck.Cards = _.reject(deck.Cards, function (card) { 
            return _.any(hand, function (handCard) { 
                return card == handCard;
            });
        });

        // push them into a player's hand
        _.each(hand, function (card) { player.hand.push(card); });
    }

    ShowHand() { 
        console.log("*****" + this.name + "*********");
        _.each(this.hand, function (card) { 
            console.log(card.asString());
        });
        console.log("**************");
    }
}


class GameEngine { 
    public players: Player[]; 
    public drawPile: Deck;
    public discardPile: Card[];
    public dealer: Player;
    public playerTurnStrategy: (player: Player, deck: Deck) =>{ };
    public winningRule: (players: Player[]) => { };
    // public evaluateWinner: 

    constructor (players: Player[], deck: Deck, 
                turnStrategy: (player: Player, deck: Deck) =>{ }, 
                winRule: (players: Player[]) => { }        
        ) { 
        this.players = players;
        var gameCtx = this;
        this.drawPile = deck;
        this.playerTurnStrategy = turnStrategy;
        this.winningRule = winRule;
        this.discardPile = [];

        _.each(players, function (p:Player) { 
            p.JoinGame(gameCtx);
        });

        
    }
    // PlayRound takes a function that defines the strategy 
    // for each player on their turn
    PlayRound() {
        var deck = this.drawPile;
        _.each(this.players, function (player:Player) { 
            // for each player, call the passed in function 
            // to invoke the strategy for them
            player.playerTurnStrategy(player, deck);
        });
    }

    HasWinner() { 
        return this.winningRule(this.players);        
    }

    // We can have static members 
    static Start(
                game: IGame,
                players: Player[]
    )
    { 
        return new GameEngine(players, new Deck(), game.playerTurnStrategy, game.winningRule);
    }
}

class TestGame implements IGame { 
    dealOnFirstTurn: bool;
    playerTurnStrategy(player: Player){ 
        if (player.hand.length == 0) {
            player.PluckCards(3);
        }
        else { 
            // find the lowest, discard and pick up a card
            var lowestCard = _.take(_.sortBy(player.hand, function (c:Card) { return c.getValue(); }), 1);
            // dump it and draw one in its place
            player.Discard(lowestCard.pop());
            player.PluckCards(1);
        }
    }
    winningRule(players: Player[]):Player{ 
                    var rankings = _.sortBy(players, function (player: Player) {
                        return _.reduce(player.hand, function (memo, card: Card) {
                            return memo + card.getValue()
                                * -1; // reverse order
                        }, 0);
                    });

                    _.each(rankings, function (p: Player) {
                        p.ShowHand();
                    });

                    return _.take(rankings, 1);    
    }
}

// TEST IT OUT WITH A GAME 

// define the players
var gamers = [new Player("Stan"), new Player("Jack"), new Player("Adi")];

// start the game
var game = GameEngine.Start(
                new TestGame(),
                gamers
);

//game.PlayRound();
//var winner = game.HasWinner();