module HelloWorld {  
    class Messenger {  
        repeat: number;  
  
        constructor (public message = "Hello World") {  
            this.repeat = 1;  
        }  
  
        speak() {  
            for (var i = 0; i < this.repeat; i++) {  
                console.log(this.message);  
            }  
        }  
  
        static SayHelloInSlang() {   
            new Messenger("'Sup World?").speak();  
        }  
    }  
  
    var m = new Messenger();  
    m.speak();  
  
    Messenger.SayHelloInSlang();  
}  