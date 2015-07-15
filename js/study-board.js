(function(){

    var app = angular.module('StudyBoard', ['ngSanitize']);

    app.controller('ClassController', function($scope, $timeout){
        this.name = oclass.name;
        this.lesson = oclass.lesson;
    }); // End of ClassController

    app.controller('LessonController', function($scope, $timeout){

        // variables
        this.name = '';
        this.snippet = '';
        this.topic = [];
        this.downloadable = [];


        // these functions check whether a topic has been studied or being studied
        this.isDone = function (id) {
            return this.topic[id].status === 'done' && this.topic[id].current === 'no';
        };
        this.isViewing = function (id) {
            return this.topic[id].current === 'yes';
        };

        this.moveToTopic = function (id) {
            goToTopic(id);
        };

    }); // End of LessonController

    app.controller('QuizController', function($rootScope, $scope, $timeout){

        // this.quizData and the pointer
        // $rootScope.quizData = []
        this.quizData = [];

        var quizId      = 0;

        // boolean variable that toggle show/hide of pannels
        this.showResult = false;

        // store current answers of user
        this.selectAns = [];
        this.checkAns = [];

        // record answers of user
        var recordedAns = [];
        this.testAns = recordedAns;

        // status of the progress
        this.progress = [];
        this.refreshProgress = function() {
            if (this.progress.length === 0) {
                this.progress.push('processing');
                for (var i=1, len=this.quizData.length; i<len; ++i) {
                    this.progress.push('queue');
                }
            }
        };


        // retrieved quiz
        var quiz         = this.quizData[quizId];

        this.title       = '';
        this.problem     = '';
        this.figures     = [];
        this.question    = '';
        this.hint        = '';
        this.instruction = '';

        this.type        = '';
        this.choices     = [];

        // function reset quiz state
        this.resetQuiz = function () {
            quizId = 0;
            this.progress = [];
            recordedAns.length = 0;

            this.refreshProgress();
            this.refreshQuiz();
            this.offShowResult();
        };

        // check whether there is hint in the quiz
        this.emptyHint = function() {
            return this.hint === undefined || this.hint === null || this.hint.length === 0;
        };

        // functions to check status of the progress
        this.isQueue = function (state) {
            return state === 'queue';
        };
        this.isProcessing = function (state) {
            return state === 'processing';
        };
        this.isDone = function (state) {
            return state === 'done';
        };


        //  function update answers by recording user answers
        this.updateAns = function() {
            // clone the select answer array
            var userAns = [];
            for (var i=0, len= this.selectAns.length; i<len; ++i) {
                if ((this.selectAns[i] != 'no') && (this.selectAns[i] !== null) && (this.selectAns[i] !== undefined)) {
                    userAns.push(this.selectAns[i].toString());
                }
            }
            // record the answer
            if (quizId > recordedAns.length-1) {
                // new user selected answers
                recordedAns.push(userAns);
            } else {
                // user update previous selected answers
                recordedAns[quizId] = userAns;
            }
        };

        // function refreshes UI with new question
        this.refreshQuiz = function() {
            if (quizId < this.quizData.length) {
                // load new quiz identified by quizId
                quiz             = this.quizData[quizId];

                this.title       = quiz.title;
                this.problem     = quiz.problem;
                this.figures     = quiz.figures;
                this.question    = quiz.question;
                this.hint        = quiz.hint;
                this.instruction = quiz.instruction;

                this.type        = quiz.type;
                this.choices     = quiz.choices;

                // update status of the progress
                //if (quizId < this.quizData.length) {
                    this.progress[quizId] = 'processing';
                //}

                // refresh selected answer to new or restore recoreded one
                this.selectAns = [];
                if (quizId < recordedAns.length) {
                    var userAns = recordedAns[quizId];
                    if (this.type == 'sc') {
                        for (var i=0, len=userAns.length; i<len; ++i) {
                            this.selectAns.push(userAns[i].toString());
                        }
                    } else if (this.type == 'mc') {
                        // NOTE: using shift() is fast but it is correct as
                        // long as all answer is in order as in quest data
                        // otherwise, the algorithm does not work
                        var choiceLst = this.choices.slice();
                        var answerLst = userAns.slice();
                        for (var j=0, jlen=choiceLst.length; j<jlen; ++j) {
                            if (choiceLst[j].id !== answerLst[0]) {
                                this.selectAns.push(undefined);
                            } else {
                                this.selectAns.push(answerLst.shift());
                            }
                        }
                    }
                }
            }
        };

        // move to next quiz
        this.nextQuiz = function() {
            if (quizId < this.quizData.length) {
                this.updateAns();
                this.progress[quizId] = 'done';
                quizId++; // overflow quizId is allowed to indicate end of all quizs
                if(quizId == this.quizData.length) {
                    // show result panel
                    this.onShowResult();
                } else {
                    // continue to next quiz
                    this.refreshQuiz();
                }
            }
        };

        // back to previous quiz
        this.previousQuiz = function() {
            if (quizId > 0) {
                if (quizId < this.quizData.length) {
                    this.updateAns();
                    this.progress[quizId] = 'done';
                }
                quizId--;
                this.refreshQuiz();
                this.offShowResult();
            }
        };

        // goto a quiz by index
        this.goTo = function(id) {
            quizId = id;
            this.refreshQuiz();
            this.offShowResult();
        };

        // these functions is used to analyze user answers
        // i.e. number of answerred answers, right answers, wrong answers...

        // validate legal answers
        // a legal answer must be not undefined or null
        var validateAns = function (ans) {
            if (typeof ans == 'undefined') {
                return false;
            }
            if (ans.length === 0) {
                return false;
            }
            return true;
        };

        // check whether the answer of a quiz is correct
        var checkAns = function (ans, ref) {
            if (!validateAns(ans)) {
                return false;
            } // end if
            if (ans.length != ref.length) {
                return false;
            } else {
                for (var i = 0, len = ans.length; i < len; ++i) {
                    if (ans[i] != ref[i]) {
                        return false;
                    }
                } // end for
            } // end if

            return true;
        };

        // return true if a quiz is correct
        this.isCorrect = function (id) {
            var ans = recordedAns[id],
                ref = this.quizData[id].answers;
            return checkAns(ans,ref);
        };

        // return true if a quiz is wrong
        this.isWrong = function (id) {
            var ans = recordedAns[id],
                ref = this.quizData[id].answers;
            return !checkAns(ans,ref) &  validateAns(ans);
        };

        // return true if quiz is not answerred
        this.isNotAnswer = function (id) {
            var ans = recordedAns[id];
            return !validateAns(ans);
        };

        // count total quiz
        this.countTotal = function() {
            return this.quizData.length;
        };

        // count answerred quiz
        this.countAnswerred = function() {
            var count = 0;
            for (var i = 0, len = recordedAns.length; i < len; ++i) {
                if (recordedAns[i].length !== 0) {
                    ++count;
                }
            }
            return count;
        };

        // count correct answers
        this.countCorrect = function() {
            var count = 0;
            for (var i = 0, len = recordedAns.length; i < len; ++i) {
                if (this.isCorrect(i)) {
                    ++count;
                }
            }
            return count;
        };

        // count wrong answers
        this.countWrong = function() {
            var count = 0;
            for (var i = 0, len = recordedAns.length; i < len; ++i) {
                if (this.isWrong(i)) {
                    ++count;
                }
            }
            return count;
        };

        // function control display of quiz-sum
        this.onShowResult = function() {
            this.showResult = true;
        };
        this.offShowResult = function() {
            this.showResult = false;
        };

        // functions to identify whether it is the first or last quiz
        // it is used to control the display of quiz navigation buttin
        // the back button should be hide in the firt quiz
        // the next button should be hide in the sum panel
        this.isFirstQuiz = function() {
            return quizId === 0;
        };
        this.isLastQuiz = function() {
            return quizId === this.quizData.length;
        };

    }); // End of QuizController
	
	app.controller('IBController', function($scope, $timeout){
		this.current = IB.getCurrentId();
		this.total = IB.count();
		
		this.next = function() {
			IB.next();
		};
		
		this.back = function() {
			IB.back();
		};
		
		this.isFirst = function() {
			return IB.getCurrentId() === 0;
		};
		
		this.isLast = function() {
			return IB.getCurrentId() === IB.count();
		};
		
	}) // End of IBController;

    oclass = {
        name : "Verilog Beginner Course",
        lesson : [
            {name: 'Lesson 1', snippet: 'Verilog Day 1', url: 'http://localhost/hvm/studyroom.php?lesson=lesson1'},
            {name: 'Lesson 2', snippet: 'Verilog Day 2', url: 'http://localhost/hvm/studyroom.php?lesson=lesson2'},
            {name: 'Lesson 3', snippet: 'Verilog Day 3', url: 'http://localhost/hvm/studyroom.php?lesson=lesson3'},
            {name: 'Lesson 4', snippet: 'Verilog Day 4', url: 'http://localhost/hvm/studyroom.php?lesson=lesson4'},
            {name: 'Lesson 5', snippet: 'Verilog Day 5', url: 'http://localhost/hvm/studyroom.php?lesson=lesson5'}
        ]
    };


})();
