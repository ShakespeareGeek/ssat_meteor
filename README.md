# SSAT Vocabulary Practice

I needed a project to help me learn Meteor.

My daughter needed something to help her learn the SSAT vocabulary.

So, this is the result. They said the best projects start by solving a problem for yourself.

1) The server seeds the database from a JSON file of words and definitions, if necessary.
2) The game gives you 60 seconds.
3) The player is shown a word (or definition) and then two choices (either two definitions, or to words).
4) Click on the correct choice.
5) Your score is the total number of correct answers.
6) If the user creates an account and sign in, a personal high score will be saved and reported in the right column.

TODO

* Sometimes (such as on Meteor.com's free tier) there is a significant delay before the database is spun up.
  The game should not start until it is ready. The user should get some feedback, such as a disabled Start button.
  
* Since the high score does not count bad answers, users have figured out that just mindlessly clicking the 
  clues as fast as you can will get you a high score. Need to come up with a formula where bad guesses count
  against you.
  
