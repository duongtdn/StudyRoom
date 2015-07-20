
var IB = {};
(function() {


    // Implementation of Interactive Board Object
    // Adopting singleton pattern
    IB = (function() {

        // private members

        // DOM and Canvas controlled objects
        // DOM controlled object used to control Dom elements such as intruction
        // and check board
        // Canvas controlled object is used to control interactive objects
        var board;
        var playGround;

        // index of each interactive game, staring with 0
        var id = 0;
        var dataObj = [];

        // private function that load a game
        function load(data) {

            // load DOM instruction element
            board.loadInstruction(data.instruction);

            // load new canvas
            playGround.new(data);

        }

        function clean() {
            playGround.clean();
        }

        // public members

        return {

            // method initilizes objects
            new: function(uri,callback) {

                // try to load json data from uri
                $.post(phpIBServer, {jsonUri:uri}, function(data, status) {
                    //console.log(data);

                    dataObj = jQuery.parseJSON(data);

                    // construct Dom controlled object
                    if (!board) {
                        board = IB.Factory.boardConstructor();
                    } else {
						board.clean();
					}

                    // construct Canvas controlled object
                    if (!playGround) {
                        playGround = IB.Factory.playGroundConstructor();
                    } else {
						playGround.clean();
					}

                    // load first game
                    id = 0;
                    load(dataObj[id]);
					
					if (callback) {
						callback();
					}

                }).fail(function() {
                    console.log( "IB: error getting data from server" );
                });

            },

            // method checks user interaction result
            check: function() {
				board.clean();
				var myCheck = playGround.check();
				if (myCheck) {
					board.loadCheckBoard('img/ib/correct_img.jpg','Congrats! You have made an impression');
				} else {
					board.loadCheckBoard('','WRONG');
				}
				board.showCheckBoard();
				return myCheck;
            },

            // method advances to next game
            next: function() {
                // increase id
                // if id is still in the range, load object
                // otherwise, end of interactive board game
                if (id < dataObj.length) {  // still in range
					if (IB.check()) {
						id++;
						clean();
						if (id == dataObj.length) {
							board.loadInstruction("click Next to continue...");
						} else {
							load(dataObj[id]);
						}
					}
                }
            },

            // method back to previous
            back: function() {

                if (id > 0) {
                    id--;
                    clean();
                    load(dataObj[id]);
                }

            },
			
			getCurrentId: function() {
				return id;
			},
			
			count: function() {
				return dataObj.length;				
			},
			
			clean: function() {
				board.clean();
				clean();
			}

        };


    })(); // end of IB

})();

// FACTORY
(function(){

    // Defined constant

    // Constant for DOM
    var
        BODY        = "body",
        OVERLAY     = "ib-overlay",
        BOX         = "ib-resultbox",
        IMAGE       = "ib-resultimg",
        MESSAGE     = "ib-message",
        CLOSE       = "ib-btn-close"
    ;

    // Constant for Canvas
    var
        CONTAINER   = "cv-container",
        WIDTH       = 578,
        HEIGHT      = 500
    ;

    IB.Factory = {

        // constructor of DOM controlled object
        boardConstructor : function() {

            // private member

            // create DOM elements
            var instruction = $("#instruction");
            var checkBoard = {};
            // overlay
            $(BODY).append(
                "<div class='" + OVERLAY + "'></div>"
            );
            checkBoard.overlay = $("." + OVERLAY);
            // wrap box
            checkBoard.overlay.append(
                "<div class='" + BOX + "'></div>"
            );
            checkBoard.box = $("." + BOX);
            // image display correct or incorrect
            checkBoard.box.append(
                "<image class='" + IMAGE + "'>"
            );
            checkBoard.image = $("." + IMAGE);
            // message coresponding to user answer
            checkBoard.box.append(
                "<div class='" + MESSAGE + "'></div>"
            );
            checkBoard.message = $("." + MESSAGE);
            // button allow close box
            checkBoard.box.append(
                "<button type='button' class='btn btn-info " + CLOSE + "'>Close</button>"
            );
            checkBoard.closeBtn = $("." + CLOSE);
            checkBoard.closeBtn.click(function(){
                checkBoard.overlay.hide();
            });

            checkBoard.overlay.hide();




            // public interface
            return {

                // method load a message into the instruction
                loadInstruction: function(msg) {
                    instruction.html(msg);
                },

                // method load content to check-board
                loadCheckBoard: function(uri, msg) {

                    // change the image attr src to uri
                    // and update message with msg
                    checkBoard.image.attr("src",uri);
                    checkBoard.image.show();
                    checkBoard.message.html(msg);

                },

                // method display check-board
                showCheckBoard: function() {
                    checkBoard.overlay.show();
                },

                // method hide check-board
                hideCheckBoard: function() {
                    checkBoard.overlay.hide();
                },

                // method empty content of DOM element
                clean: function() {

                    // empty instruction
                    //instruction.html("");

                    // empty checkBoard
                    checkBoard.image.hide();
                    checkBoard.message.html("");
                }

            };

        },

        // constructor of Canvas controlled object
        playGroundConstructor: function () {

            // private members

            // kinetic stage
            var stage = new Kinetic.Stage({
                container   : CONTAINER,
                width       : WIDTH,
                height      : HEIGHT
            });

            // background layer & front layer
            // background layer contains static objects
            // front layer contains interactive objects
            var bgLayer = new Kinetic.Layer();
            var ftLayer = new Kinetic.Layer();



            // background canvas objects and front (interactive) objects
            var bgObjs = [];
            var ftObjs = [];
            var zones  = [];

            // function creates an array of Kinetic objects
            function createBackgroundObj (data) {
                for (var i=0, len=data.length; i<len; ++i) {
                    var objData = data[i];
                    var kobj = new Kinetic[objData.shape](objData.attr);
                    bgObjs.push(kobj);
                }
            }

            // function creates an array of extended Kinetic objects (for
            // interactive objects)
            function createFrontObj (data) {
                for (var i=0, len=data.length; i<len; ++i) {
                    var objData = data[i];
                    // generate kinetic object
                    if (objData.type == 'dom') {
                        objData.inst = new Dometic[objData.shape](objData.attr);
                        objData.inst.parentObj = objData;
                    } else {
                        objData.inst = new Kinetic[objData.shape](objData.attr);
                        objData.inst.parentObj = objData;

                        // preset event for case of dragging
                        if (objData.inst.getDraggable() === true) {
                            // when drag start, the zone contain it mus be empty
                            objData.inst.on("dragstart",presetEvent.dragstart);
                            // when drag end, try to snap object if it near or insude a zone
                            objData.inst.on("dragend", presetEvent.dragend);
                        } // end if

                        // preset event for case of select
                        if (objData.selectable === true) {
                            objData.inst.on("click",presetEvent.click);
                        }
                    }

                        ftObjs.push(objData);
                }
            }

            // function generate zone  list
            function createZoneObj (data) {
                for (var i=0, len=data.length; i<len; ++i) {
                    var objData = data[i];
                    zones.push(objData);
                }
            }

            // function find a zone according its id
            function findZonebyId (id) {
                for (var i=0, len=zones.length; i<len; ++i) {
                    if (zones[i].id === id) {
                        return zones[i];
                    }
                }
            }

            // functions provide built-in methods for events
            presetEvent = {};

            presetEvent.dragstart = function () {
                this.moveToTop();
                if (this.parentObj.zone !== null && this.parentObj.zone !== "") {
                    var zone = findZonebyId(this.parentObj.zone);
                    zone.container = "";
                }
            }; // end presetEvent.dragstart

            presetEvent.dragend = function () {
                // get the left top corner & the dimension of the object
                var objLeft = this.getLeft(),
                    objRight = objLeft + this.getWidth(),
                    objTop = this.getTop(),
                    objBottom = objTop + this.getHeight();

                // sweep through all zone to check whether obj fall into
                // any zone
                for (var i=0, len=zones.length; i<len; ++i) {

                    // get the zone attribute and expand the area
                    var zone = zones[i];

                    var expand = 20;
                    var zoneLeft = zone.x - expand,
                        zoneRight =  zone.x + zone.width + expand,
                        zoneTop = zone.y - expand,
                        zoneBottom = zone.y + zone.height + expand;

                    // check whether obj fall to expanded zone
                    if ((objLeft >= zoneLeft) && (objTop >= zoneTop) &&
                        (objRight <= zoneRight) && (objBottom <= zoneBottom)) {

                            // snap object to center of zone
                            var deltaX = (this.getX() - this.getLeft()),
                                deltaY = (this.getY() - this.getTop());
                            var left = zone.x + (zone.width - this.getWidth())/2 + deltaX,
                                top = zone.y + (zone.height - this.getHeight())/2 + deltaY;

                            this.setPosition({x:left, y:top});

                            // if this zone has contain an object
                            // then dismiss that object
                            if (zone.container !== null && zone.container !== "" && zone.container !== undefined) {
                                var poorObj = zone.container;
                                poorObj.inst.setPosition({x:poorObj.attr.x,y:poorObj.attr.y});
                                poorObj.zone = "";
                            }

                            // recored zone id to obj attr and
                            // set obj to zone container
                            this.parentObj.zone = zone.id;
                            zone.container = this.parentObj;

                            ftLayer.draw();

                            return;

                    } // end if



                } // end for

                // if it reach here, object is not dragged to any zone, and previously not belong to any zone
                // then, we can set obj back to its original position
                this.setPosition({x:this.parentObj.attr.x, y:this.parentObj.attr.y});

                // object is than not belongged to any zone
                this.parentObj.zone = "";
                ftLayer.draw();
            }; // end presetEvent.dragend

            presetEvent.click = function() {
                this.parentObj.selected = !this.parentObj.selected;
                if (this.parentObj.selected) {
                    this.setStrokeWidth(this.parentObj.selectedStrokeWidth);
                    this.setStroke(this.parentObj.selectedStroke);
                    this.setOpacity(1);
                } else {
                    this.setStrokeWidth(this.parentObj.attr.strokeWidth);
                    this.setStroke(this.parentObj.attr.stroke);
                    this.setOpacity(this.parentObj.attr.opacity);
                }
                ftLayer.draw();
            }; // end presetEvent.click

            function highlightFallObj (obj) {
                if (obj.type == 'dom') {
                    obj.inst.setStroke("red");
                    obj.inst.setStrokeWidth("3px");
                } else if (obj.type == 'canvas') {
                    obj.inst.setStroke("red");
                    obj.inst.setStrokeWidth("3");
                    ftLayer.draw();
                }
            }

            function restoreObjApperance(obj) {
                if (obj.type == 'dom') {
                    obj.inst.resetStroke();
                    obj.inst.resetStrokeWidth();
                } else if (obj.type == 'canvas') {
                    if (!obj.selected) {
                        obj.inst.setStroke(obj.attr.stroke);
                        obj.inst.setStrokeWidth(obj.attr.strokeWidth);
                        ftLayer.draw();
                    }
                }
            }



            // public members

            return {

                // methods draw start interactive games by loading and
                // drawing canvas objects
                new: function(data) {

                    // user interaction may change some property of
                    // the original data object such as selected & value
                    // therefore, clone data to assure interaction will not
                    // affact original data.
                    // Since it is purely data object (i.e. no function),
                    // using json.parse and json.stringify is efffective
                    var cloneData = JSON.parse(JSON.stringify(data));

                    var bgData = cloneData.background,
                        ftData = cloneData.front,
                        zoneData = cloneData.zone;

                    // create background objects
                    createBackgroundObj(bgData);

                    // add background object to background layer
                    for (var i=0, len=bgObjs.length; i<len; ++i) {
                        bgLayer.add(bgObjs[i]);
                    }
                    stage.add(bgLayer);

                    // create front object
                    createFrontObj(ftData);

                    // add them to front layer
                    for (var j=0, jlen=ftObjs.length; j<jlen; ++j) {
                        if (ftObjs[j].type == 'canvas') {
                            ftLayer.add(ftObjs[j].inst);
                        }
                    }
                    stage.add(ftLayer);

                    // prepare zone object for check rule if nesessary
                    createZoneObj(zoneData);

                }, // end new()

                // method destroys all objects
                clean: function() {

                    bgLayer.destroyChildren();
                    ftLayer.destroyChildren();
                    stage.destroyChildren();
                    //bgLayer.draw();
                    //ftLayer.draw();

                    Dometic.Utils.clean();

                    bgObjs = [];
                    ftObjs = [];

                }, // end clean()

                // method checks user interactive answer is correct
                // or wrong by checking interactive condition of each
                // object
                check: function() {

                    var checkResult = true;

                    for (var i=0, len=ftObjs.length; i<len; ++i) {

                        var obj = ftObjs[i];

                        // read obj condition to get check rule
                        var rule = obj.rule;

                        // depend on the check rule, apply corresponding method
                        // split the rule into condition and requirement parts
                        var splitRule = rule.split("=");
                        var condition = splitRule[0].trim(),
                            requirement = splitRule[1].trim();

                        // take action according to rule condition and requirement
                        if (obj[condition] == requirement) {
                            // rule is satisfied
                            obj.check = true;
                            restoreObjApperance(obj);
                        } else {
                            // rule is unsatisfied
                            obj.check = false;
                            checkResult = false;
                            highlightFallObj(obj);
                        }

                    } // end for

                    return checkResult;

                } // end check()
            };

        },

    };
})();

// Dometic class
var Dometic = {};
(function(){

    // Constant
    var
        IBOARD = "interactive-board";


    Dometic = {
        version : '0.0.1',

        Utils : {},

        Textbox : function (config) {
            this._init(config);
        }
    };

    Dometic.Utils.clean = function() {
        // this utils clean all element under IBOARD
        // however, the div element for kinetic should not be clean
        // work around solution here is to get that div,
        // remove all, than append it to IBOARD again
        // getting div element required a hardcoded it id, that is so bad
        var iboard = document.getElementById(IBOARD);
        var canvasChild = document.getElementById("cv-container"); // hardcoded name of canvas here is bad
        while (iboard.lastChild) {
            iboard.removeChild(iboard.lastChild);
        }
        iboard.appendChild(canvasChild);
    };

    Dometic.Textbox.prototype = {
        _init: function(config) {
            this.attr = config;

            // generate dom elements
            var divElement = document.createElement("div");

            if (this.attr.placeholder) {
                divElement.appendChild(document.createTextNode(this.attr.placeholder));
            }

            if (this.attr.editable) {
                divElement.setAttribute("contentEditable", this.attr.editable);
                divElement.setAttribute("class", "single-line");
            }

            divElement.style.position = 'absolute';


            if (this.attr.x) {
                divElement.style.left = this.attr.x + "px";
            } else {
                divElement.style.left = 0;
            }

            if (this.attr.y) {
                divElement.style.top = this.attr.y + "px";
            } else {
                divElement.style.top = 0;
            }

            if (this.attr.width) {
                divElement.style.width = this.attr.width + "px";
            }

            if (this.attr.height) {
                divElement.style.height = this.attr.height + "px";
            }

            if (this.attr.stroke) {
                divElement.style.borderColor  = this.attr.stroke;
                divElement.style.border = 'solid';
            }

            if (this.attr.strokeWidth) {
                divElement.style.borderWidth  = this.attr.strokeWidth + "px";
            }

            if (this.attr.fill) {
                divElement.style.backgroundColor = this.attr.fill;
            }

            if (this.attr.opacity) {
                divElement.style.opacity = this.attr.opacity;
            }

            if (this.attr.fontFamily) {
                divElement.style.fontFamily = this.attr.fontFamily;
            }

            if (this.attr.fontStyle) {
                divElement.style.fontStyle = this.attr.fontStyle;
            }

            if (this.attr.fontSize) {
                divElement.style.fontSize = this.attr.fontSize;
            }

            // bind native event
            divElement.addEventListener("keyup", function(evt) {
                // update value based on enterred content
                var content = this.innerHTML.replace(/<div>|<\/div>|<br>/gi,"");
                this.parentObj.parentObj.value = content;
                //console.log (this.innerHTML + " - " + content);
            });
            divElement.addEventListener("keydown", function(evt) {
                if (evt.keyCode == 13) {
                   // console.log (evt.keyCode);
                }
            });



            var iboard = document.getElementById(IBOARD);
            iboard.appendChild(divElement);

            divElement.parentObj = this;

            this.element = divElement;
        }, // end init

        // set stroke of element
        setStroke : function(val) {
            this.element.style.borderColor = val;
        },
        resetStroke : function() {
            this.element.style.borderColor = this.attr.stroke;
        },

        setStrokeWidth : function(val) {
            this.element.style.borderWidth = val;
        },
        resetStrokeWidth : function() {
            this.element.style.borderWidth = this.attr.strokeWidth;
        },

        setFill : function(val) {
            this.element.style.backgroundColor = val;
        },
        resetFill : function() {
            this.element.style.backgroundColor = this.attr.fill;
        },

        setOpacity : function(val) {
            this.element.style.opacity = val;
        },
        resetOpacity : function() {
            this.element.style.opacity = this.attr.opacity;
        }
    };


})();
