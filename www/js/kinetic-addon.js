(function(){

    // constants
    var TEXTBOX = "Textbox";
    var ATTR_CHANGE_LIST = ['fontFamily', 'fontSize', 'fontStyle', 'padding', 'lineHeight', 'text'],
        CHANGE_KINETIC = 'Change.kinetic',
        attrChangeListLen = ATTR_CHANGE_LIST.length;


    Kinetic.Textbox = function(config) {
        this.____init(config);
    };

    Kinetic.Textbox.prototype = {
        ____init: function(config) {
           var that = this;

           // new object textbox is actually a Kinetic.Group
           this.className = TEXTBOX;
           Kinetic.Group.call(this, config);

           // wrapped textbox by a Kinetic.Rect
           var border = new Kinetic.Rect({
               width : config.width,
               height : config.height,
               fill : config.fill || 'white' ,
               stroke : config.stroke || 'grey',
               opacity : config.opacity || 1
               //cornerRadius : config.cornerRadius
           });
           this.add(border);

           // delegate events of changing text content to text child
           // the 'add' event is set before actually add text child
           this.on('add.kinetic', function(evt) {
               that._addListeners(evt.child);
               that._sync();
           });

           // add Kinetic.Text as text of textbox
           var text = new Kinetic.Text({
               text : config.text || "",
               fontFamily : config.fontFamily || "",
               fontSize : config.fontSize || 12,
               padding: config.padding || 5,
               fill: config.textFill || 'black'
           });

           this.add(text);

           this.on('click.textbox', function(evt) {
               this.getTextObj().setText("|");
               var layer = this.getLayer();
               layer.draw();

           });




        },

        _addListeners : function(text) {
            var that = this,
                n;
            var func = function(){
                    that._sync();
                };

            // update text data for certain attr changes
            for(n = 0; n < attrChangeListLen; n++) {
                text.on(ATTR_CHANGE_LIST[n] + CHANGE_KINETIC, func);
            }

        },

        _sync: function() {
            var text = this.getTextObj(),
                border = this.getBorder(),
                width, height, x, y;

            if (text && border) {
                //width = text.getWidth();
                //height = text.getHeight();

                x = 0;
                y = 0;

                border.setAttrs({
                    x: -1 * x,
                    y: -1 * y,
                    width: width,
                    height: height
                });

                text.setAttrs({
                    x: -1 * x,
                    y: -1 * y
                });
            }
        },

        getTextObj : function () {
            return this.find('Text')[0];
        },

        getText: function () {
            return this.getTextObj().getText();
        },
        setText: function(text) {
            var str = Kinetic.Util._isString(text) ? text : text.toString();
            this._setAttr("text", str);
            var txt = this.getTextObj();
            if (txt !== undefined) {
                txt.setText(str);
            }
            return this;
        },

        getBorder : function () {
            return this.find('Rect')[0];
        }

   }; // end prototype

   Kinetic.Util.extend(Kinetic.Textbox, Kinetic.Group);

   Kinetic.Factory.addOverloadedGetterSetter(Kinetic.Textbox, 'text');

   Kinetic.Collection.mapMethods(Kinetic.Textbox);

})();
