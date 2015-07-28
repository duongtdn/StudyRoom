/* -----------------------------------------------------------------------------
   PROJECT OnTrain
   DESCRIPTION This creates new class type named VideoPlayer taht used to
               control video lessons.
   DEPENDENCIES http://www.youtube.com/player_api
   AUTHOR DuongTDN
   USAGE

   -------------------------------------------------------------------------- */

/* update history --------------------------------------------------------------


*/

// Declare Class type
var VideoPlayer = {};

// New obj instance from the class
(function(){

    VideoPlayer = function(conf) {
        this.apiReady = false;
        this.playerReady = false;
        this.setConf(conf);
    };

})();

// Prototype of the class
(function(){
    VideoPlayer.prototype = {

        // getter/setter
        setConf: function(conf) {
            this.conf = conf;
        },
        setApiReady: function(val) {
            if (typeof(val) == 'boolean' ) {
                this.apiReady = val;
                this.preparePlayer(this.conf);
            }
        },
        getApiReady: function() {
            return this.apiReady;
        },
        setPlayerReady: function(val) {
            if (typeof(val) == 'boolean' ) {
                this.playerReady = val;
            }
        },
        getPlayerReady: function() {
            return this.playerReady;
        },

        // configure the player
        preparePlayer: function(conf) {
            // depend on the service, setup the player
            if (conf.service == 'YT' && this.apiReady === true) {
                this.player = new YT.Player(conf.player, {
                    height      : conf.height,
                    width       : conf.width,
                    videoId     : conf.src,
                    playerVars  : conf.vars,
                    events      : {
                        'onReady' : this.onReady,
                        'onStateChange' : this.finishPlaying
                    }
                });
            }
        },

        // play a video defined in conf
        onReady: function(event) {
            //event.target.playVideo();
            this.playerReady = true;
        },


        // when finish playing a video
        finishPlaying: function(event) {
            if (event.data === 0) {
                onSenceFinish();
            //    event.target.cueVideoById({videoId:src});
            //    executeEventFunction(window, ['alert', 'HI']);
            }
        },

    };
})();
