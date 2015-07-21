/* -----------------------------------------------------------------------------
   PROJECT OnTrain
   DESCRIPTION
   DEPENDENCIES multimedia.js
   AUTHOR DuongTDN
   USAGE

   -------------------------------------------------------------------------- */

/* update history --------------------------------------------------------------


*/

var lesson = {};
var topic = [];

var user = {};
    user.topic = [];

var angularApplyChange = function(ctrlId, ctrlAlias, obj) {
    var el = angular.element(document.getElementById(ctrlId));
    var ctrl = el.scope();
    if (typeof ctrl != 'undefined') {
        ctrl.$apply(function(){
            var alias = ctrl[ctrlAlias];
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    alias[prop] = obj[prop];
                }
            }
        });
    } else {
        console.log("info: angular failed to return scope");
    }
};

var startLesson = function(uri) {
    $.post(phpLessonServer, {jsonUri:uri}, function(data, status) {
        console.log("received lesson");
        if (typeof data !== undefined) {
            lesson = jQuery.parseJSON(data);

            // temp code to generate user data
            // will be replaced
            for (var j = 0, jlen = lesson.topic.length; j < jlen; ++j ) {
                if (j===0) {
                    user.topic.push({status: 'waiting', current: 'yes'});
                } else {
                    user.topic.push({status: 'waiting', current: 'no'});
                }
            }

            // prepare topic list from lesson and user status
            // topic[i].name from lesson.topic[i].name
            // topic[i].status from user.course().topic[i].status
            // topic[i].current from user.course().topic[i].current
            for (var i = 0, len = lesson.topic.length; i < len; ++i ) {
                topic.push({id: lesson.topic[i].id,
                            name: lesson.topic[i].name,
                            status: user.topic[i].status,
                            current: user.topic[i].current});
            }

            // notify changes to angular
            var obj = {
                'name' : lesson.name,
                'snippet' : lesson.snippet,
                'topic' : topic,
                'downloadable' : lesson.downloadable
            };
            angularApplyChange('lessonCtrl', 'lesson', obj);
            // callback function
            loadLesson();
        }
    }).fail(function() {
        console.log( "error getting lesson from server" );
    });
};


//(function(){

var loadLesson = function() {

    // index of current topic
    var topicId = 0;

    // index of current scene in the current topic
    var sceneId = 0;

    // current scene
    scene = lesson.topic[topicId].scene[sceneId];

    // Prepare player, depending on player services is YT or others
    if (lesson.service == 'YT') {
        // For Youtube service, load the IFrame Player API code asynchronously.
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/player_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // demo conf
        var conf = {
            player  : 'player',
            service : lesson.service,
            height  : '480',
            width   : '854',
            src     : lesson.topic[0].scene[0].src,
            vars    : { 'theme':'dark', 'autohide':0, 'modestbranding':1, 'showinfo':1, 'controls':1, 'rel':0}
        };

        // create youtube player
        var player = new VideoPlayer(conf);

        // register to global YouTube API function
        window.onYouTubePlayerAPIReady = function() {
            player.setApiReady(true);
        };

    }

    // Controll the flow


    // Global function
    // when finish a sence, it can load a next video
    onSenceFinish = function(nextScene){

        // check whether the finished scene is the end scene of the topic
        switch (scene.type) {
            case 'video' :
				// stop current video
				player.player.stopVideo();
				// find the next one
                if (scene.next === 0) {
                    // finish a topic
                    finishTopic();
                } else {
                    sceneId = findSceneId(scene.next);
                }
                break;
            case 'break' :
                if (typeof nextScene == 'undefined') {
                    nextScene = scene.defaultNext;
                }
                if (nextScene === 0) {
                    // finish a topic
                    finishTopic();
                } else {
                    sceneId = findSceneId(nextScene);
                }
                break;
            case 'quiz' :
                if (scene.next === 0) {
                    // finish a topic
                    finishTopic();
                } else {
                    sceneId = findSceneId(scene.next);
                }
                break;
			case 'ib' :
                if (scene.next === 0) {
                    // finish a topic
                    finishTopic();
                } else {
                    sceneId = findSceneId(scene.next);
                }
                break;

        }

        updateScene();

    };

    onGoBack = function() {
		if (scene.type == 'video') {
			// stop current video
			player.player.stopVideo();
		}
        if (topicId == lesson.topic.length) {
            topicId--;
        }
        if (scene.previous === 0) {
            previousTopic();
        } else {
            sceneId = findSceneId(scene.previous);
        }
        updateScene();
    };

    var finishTopic = function() {
        if (topicId < lesson.topic.length) {
            // update lesson status of finished topic
            updateTopicStatus(topicId, 'done');
            updateTopicCurrent(topicId, 'no');
            // move to next topic
            topicId++;
            sceneId = 0;
            if (topicId == lesson.topic.length) {
                // finish lesson, move to next lesson
            } else {
                // update lesson status of studying topic
                //updateTopicStatus(topicId, 'ongoing');
                updateTopicCurrent(topicId, 'yes');
            }
            angularApplyChange('lessonCtrl', 'lesson', {'topic':topic});
        }
    };

    var previousTopic = function() {
        if (topicId > 0) {
            if (topicId < lesson.topic.length) {
                updateTopicCurrent(topicId, 'no');
            }
            // move to previous topic
            topicId--;
            // find last scene of topic
            if (topic[topicId].status == 'done') {
                sceneId = findLastSceneId();
            } else {
                sceneId = 0;
            }
            // update lesson status of studying topic
            updateTopicCurrent(topicId, 'yes');
            angularApplyChange('lessonCtrl', 'lesson', {'topic':topic});
        }
    };

    goToTopic = function(id) {
        if (id >= 0 && id < lesson.topic.length) {
            updateTopicCurrent(topicId, 'no');
            topicId = id;
            sceneId = 0;
            updateTopicCurrent(topicId, 'yes');
            updateScene();
        }
    };

    var findLastSceneId = function() {
        var sceneLst = lesson.topic[topicId].scene;
        for (var i = 0; i < sceneLst.length; ++i) {
            if ((typeof sceneLst[i].defaultNext != 'undefined') && (sceneLst[i].defaultNext === 0)) {
                if (sceneLst[i].previous === 0) {
                    topicId--;
                    return findLastSceneId();
                } else {
                    return findSceneId(sceneLst[i].previous);
                }
            }
            if (sceneLst[i].next === 0){
                return i;
            }
        }
    };

    var findSceneId = function(seq) {
        var sceneLst = lesson.topic[topicId].scene;
        for (var i = 0; i < sceneLst.length; ++i) {
            if (sceneLst[i].seq == seq) {
                return i;
            }
        }
    };

    var updateTopicStatus = function(id, status) {
        if (id < topic.length) {
            topic[id].status = status;
        }
    };

    var updateTopicCurrent = function(id, status) {
        if (id < topic.length) {
            topic[id].current = status;
        }
    };


    var updateScene = function() {
        if (topicId < lesson.topic.length) {
            scene = lesson.topic[topicId].scene[sceneId];
            hideAllScene();
            switch (scene.type) {
                case 'video' :
                    var src = scene.src;
                    player.player.cueVideoById({videoId:src});
                    showVideoPlayer();
                    break;
                case 'break' :
                    renderBreakPage(scene.content);
                    showBreakPage();
                    break;
                case 'quiz' :
                    loadQuizData(scene.uri);
                    showQuizPanel();
                    break;
				case 'ib' :
					loadIB(scene.uri)					
					showIB();
					break;
            }
        }
    };

    // display player depend on scene type

    var hideAllScene = function() {
        $(".study-videoplayer").addClass("hidden");
        $(".study-breakpage").addClass("hidden");
        $(".study-quiz").addClass("hidden");
		$(".study-ib").addClass("hidden");
    };

    var showVideoPlayer = function() {
        $(".study-videoplayer").removeClass("hidden");
    };

    var showBreakPage = function() {
        $(".study-breakpage").removeClass("hidden");
    };

    var showQuizPanel = function(){
        $(".study-quiz").removeClass("hidden");
    };
	
	var showIB = function() {
		$(".study-ib").removeClass("hidden");
	};


    // default behavior of break screne
    // $("#btn-break").click(function() {
    //     onSenceFinish();
    // });

    // render break page
    var renderBreakPage = function (content) {

        // display title
        $(".break-title").html('heyzo');

        // display text content
        $(".break-text").html(content.text);

        // display all option

        // remove all current option
        $(".break-btn").remove();

        // add new option
        for (var i = 0, len = content.opt.length; i < len; ++i) {
            var nextScene = content.opt[i].next;
            var btn = "<button type='button' class='btn btn-info break-btn' onclick='onSenceFinish(";
            btn = btn.concat(nextScene).concat(")'>").concat(content.opt[i].label).concat("</button>");
            $(".break-opt").append(btn);
        }

    };

    var getQuiz = function(uri, fn) {
        $.post(phpQuizServer,{jsonUri:uri}, function(data, status) {
            console.log("received quiz");
            if (typeof data !== undefined) {
                var quizDB = jQuery.parseJSON(data);
                fn(quizDB);
            }
        }).fail(function() {
            console.log( "error in getting quiz" );
        });

    };

    // load a quizDB based
    var loadQuizData = function(uri) {
        // may find a way to not download quiz if quiz is not change
        getQuiz(uri, function(quizData) {
            // refresh quiz to apply changed data
            // it is done by invoking the refreshQuiz() of QuizController
            // however, since I use quiz as allias name for the controller
            // then I must clarify (hardcode) quiz when trying to retrieve in controller scope
            // it is bad.
            // in addition, have to know the element id of the div which contain the controller
            // so it is purely MVC, bad!!!
            var anelem = angular.element(document.getElementById('quizCtrl'));
            var quizCtrl = anelem.scope();
            quizCtrl.$apply(function(){
                var quiz = quizCtrl.quiz;
                quiz.quizData = quizData;
                quiz.resetQuiz();
            });
        });
/*
        // must aware angular that quizData has been changed
        // first, get the $rootScope
        var elem = angular.element(document.querySelector('[ng-app]'));
        var injector = elem.injector();
        var $rootScope = injector.get('$rootScope');
        // then, apply changes
        $rootScope.$apply(function(){
            $rootScope.quizData = quizData;
        });
*/

    };
	
	var loadIB = function(uri) {
		IB.new(uri, function() {
			var anelem = angular.element(document.getElementById('IBCtrl'));
			var IBCtrl = anelem.scope();
			IBCtrl.$apply(function(){
				var ib = IBCtrl.ib;			
				ib.reset();
			});
		});
	}

};

