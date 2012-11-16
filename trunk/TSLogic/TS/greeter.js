var HelloWorld;
(function (HelloWorld) {
    var Messenger = (function () {
        function Messenger(message) {
            if (typeof message === "undefined") { message = "Hello World"; }
            this.message = message;
            this.repeat = 1;
        }
        Messenger.prototype.speak = function () {
            for(var i = 0; i < this.repeat; i++) {
                console.log(this.message);
            }
        };
        Messenger.SayHelloInSlang = function SayHelloInSlang() {
            new Messenger("'Sup World?").speak();
        }
        return Messenger;
    })();    
    var m = new Messenger();
    m.speak();
    Messenger.SayHelloInSlang();
})(HelloWorld || (HelloWorld = {}));

