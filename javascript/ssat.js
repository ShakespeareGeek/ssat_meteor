Words = new Mongo.Collection("words");
HighScores = new Mongo.Collection("high_scores");
if (Meteor.isClient) {

  var clock = 0;
  Session.set("time", -1);

  Session.setDefault('counter', 0);
  Session.setDefault('score', 0);
  Session.setDefault('used-words',[]);
  Meteor.subscribe('high_scores');

  Accounts.ui.config({
   passwordSignupFields: "USERNAME_ONLY"
  });

  function resetColors() {
    $(".answer").removeClass('correct');
    $(".answer").removeClass('incorrect');
  }

  function chooseTemplate() {
    var choice = Math.floor(Math.random()*4);
    Session.set("template", choice);
  }

  function updateHighScore() {
    if (!Meteor.userId()) {
      return;
    }
    var currentBest = HighScores.find({name:Meteor.user().username}).fetch();
    if (currentBest.length==0) {
      HighScores.insert({name:Meteor.user().username, score:Session.get("score")});
    } else {
      currentBest = currentBest[0];
      if (Session.get("score") > currentBest.score) {
        HighScores.upsert(currentBest._id, {name:Meteor.user().username, score:Session.get("score")});
      }
    }
  }

  var timeLeft = function() {
    if (clock > 0) {
      clock--;
      Session.set("time", clock/10);
    } else if (clock==0 && Session.get("time")!=-1) {
      clock--;
      updateHighScore();
      return Meteor.clearInterval(interval);
    } else {
      console.log("Still running");
    }
  };

  function loadNextWord() {
      used_words = Session.get('used-words');
      Meteor.call('nextWord', {used:used_words}, function(err, data){
      if (err) {
        console.log(err);
      } else {
        Session.set('word', data);
        Session.set('used-words', used_words);
      }
    });
  }

  Template.registerHelper('equals',
      function(v1, v2) {
          return (v1 === v2);
      }
  );

  Template.registerHelper('not',
      function(v1) {
          return (!v1);
      }
  );

  Template.registerHelper("time", function() {
     return Session.get("time");
   });


  Template.game.helpers({
    guest: function() {
      return !Meteor.userId();
    },
    highScores: function() {
      return HighScores.find({}, {sort:{score:-1}});
    },
    highScore: function() {
      if (!Meteor.userId())
        return {name:''}
      else
        return HighScores.find({name:Meteor.user().username}).fetch()[0];
    },
    showTimer: function() {
      return Session.get("time")>0;
    },
    newGame: function() {
      return Session.get("time")==-1;
    },
    gameOver: function() {
      return Session.get('time')==0;
    },
    showDescription: function() {
      return Session.get("time")<0;
    },
    question: function() {
      return Session.get('word')
    },
    counter: function() {
      return Session.get('counter')
    },
    score: function() {
      return Session.get('score')
    },
    template0Chosen: function() {
      return Session.get("template")==0;
    },
    template1Chosen: function() {
      return Session.get("template")==1;
    },
    template2Chosen: function() {
      return Session.get("template")==2;
    },
    template3Chosen: function() {
      return Session.get("template")==3;
    }
  });

  Template.game.events({
    'tap .playAgain, click .playAgain' : function(event) {
      clock=600;
      interval = Meteor.setInterval(timeLeft, 100);
      Session.set('counter', 0);
      Session.set('score', 0);
      loadNextWord();
      $('.game').focus();

    },
    'touchend .answer, tap .answer, click .answer': function(event) {
      Session.set('counter', Session.get('counter')+1);
      var definition = Session.get("word").right.definition;
      var word = Session.get("word").right.word;
      var answer = $(event.currentTarget).contents().first().text();
      console.log("Does "+answer+" == "+definition)
      if (answer==definition || answer==word) {
        $(event.currentTarget).addClass('correct');
        Session.set('score', Session.get('score')+1);
      } else {
        $(event.currentTarget).addClass('incorrect');
      }
      setTimeout(function () {
        chooseTemplate();
        resetColors();
        loadNextWord();
      }, 100);

  }});
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    //HighScores.remove({});
    // code to run on server at startup
    if (Words.find().count() === 0) {
           console.log("Importing private/products.json to db");

           var data = JSON.parse(Assets.getText("words.json"));
           data.forEach(function (item, index, array) {
               Words.insert(item);
           })
       }
  });

  Meteor.publish('high_scores', function() {
    return HighScores.find({}, {limit:10});
  });

//  Meteor.publish('words', function() {
//    return Words.find({}, {limit: 1000});
//  });

  Meteor.methods({
    'nextWord': function(used) {
      var arr = used['used'];
      var array = Words.find().fetch();
      var randomIndex1 = Math.floor( Math.random() * array.length );

      while (arr!='' && arr.indexOf(array[randomIndex1])>-1) {
        randomIndex1 = Math.floor( Math.random() * array.length );
      }

      var randomIndex2 = randomIndex1;
      while(randomIndex1==randomIndex2) {
        randomIndex2 = Math.floor( Math.random() * array.length );
      }
      var element1 = array[randomIndex1];
      var element2 = array[randomIndex2];
      return {right:element1, wrong:element2};
    }
  });
}
