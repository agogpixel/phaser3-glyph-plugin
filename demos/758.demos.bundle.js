/*! For license information please see 758.demos.bundle.js.LICENSE.txt */
(self.webpackChunk_agogpixel_phaser3_glyph_plugin=self.webpackChunk_agogpixel_phaser3_glyph_plugin||[]).push([[758,412],{54256:(e,t,i)=>{var s=i(69186),l=i(38236),a=i(38590),n=i(17321),r=i(37254),o=new s({Extends:l,initialize:function(e,t,i,s,o,p){l.call(this,e,"Sprite3D"),this.gameObject=new a(e,0,0,o,p),this.position=new r(t,i,s),this.size=new n(this.gameObject.width,this.gameObject.height),this.scale=new n(1,1),this.adjustScaleX=!0,this.adjustScaleY=!0,this._visible=!0},project:function(e){var t=this.position,i=this.gameObject;e.project(t,i),e.getPointSize(t,this.size,this.scale),this.scale.x<=0||this.scale.y<=0?i.setVisible(!1):(i.visible||i.setVisible(!0),this.adjustScaleX&&(i.scaleX=this.scale.x),this.adjustScaleY&&(i.scaleY=this.scale.y),i.setDepth(-1*i.z))},setVisible:function(e){return this.visible=e,this},visible:{get:function(){return this._visible},set:function(e){this._visible=e,this.gameObject.visible=e}},x:{get:function(){return this.position.x},set:function(e){this.position.x=e}},y:{get:function(){return this.position.y},set:function(e){this.position.y=e}},z:{get:function(){return this.position.z},set:function(e){this.position.z=e}}});e.exports=o},76639:(e,t,i)=>{var s=i(90062),l=i(38596),a=i(78757),n=i(7973),r=i(54256);a.register("sprite3D",(function(e,t){void 0===e&&(e={});var i=n(e,"key",null),a=n(e,"frame",null),o=new r(this.scene,0,0,i,a);return void 0!==t&&(e.add=t),s(this.scene,o,e),l(o,e),o}))},90062:(e,t,i)=>{var s=i(87626),l=i(7973);e.exports=function(e,t,i){t.x=l(i,"x",0),t.y=l(i,"y",0),t.depth=l(i,"depth",0),t.flipX=l(i,"flipX",!1),t.flipY=l(i,"flipY",!1);var a=l(i,"scale",null);"number"==typeof a?t.setScale(a):null!==a&&(t.scaleX=l(a,"x",1),t.scaleY=l(a,"y",1));var n=l(i,"scrollFactor",null);"number"==typeof n?t.setScrollFactor(n):null!==n&&(t.scrollFactorX=l(n,"x",1),t.scrollFactorY=l(n,"y",1)),t.rotation=l(i,"rotation",0);var r=l(i,"angle",null);null!==r&&(t.angle=r),t.alpha=l(i,"alpha",1);var o=l(i,"origin",null);if("number"==typeof o)t.setOrigin(o);else if(null!==o){var p=l(o,"x",.5),c=l(o,"y",.5);t.setOrigin(p,c)}return t.blendMode=l(i,"blendMode",s.NORMAL),t.visible=l(i,"visible",!0),l(i,"add",!0)&&e.sys.displayList.add(t),t.preUpdate&&e.sys.updateList.add(t),t}},38596:(e,t,i)=>{var s=i(7973);e.exports=function(e,t){var i=s(t,"anims",null);if(null===i)return e;if("string"==typeof i)e.anims.play(i);else if("object"==typeof i){var l=e.anims,a=s(i,"key",void 0);if(a){var n=s(i,"startFrame",void 0),r=s(i,"delay",0),o=s(i,"repeat",0),p=s(i,"repeatDelay",0),c=s(i,"yoyo",!1),h=s(i,"play",!1),u=s(i,"delayedPlay",0),y={key:a,delay:r,repeat:o,repeatDelay:p,yoyo:c,startFrame:n};h?l.play(y):u>0?l.playAfterDelay(y,u):l.load(y)}}return e}}}]);