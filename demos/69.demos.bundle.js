/*! For license information please see 69.demos.bundle.js.LICENSE.txt */
(self.webpackChunk_agogpixel_phaser3_glyph_plugin=self.webpackChunk_agogpixel_phaser3_glyph_plugin||[]).push([[69,412],{54256:(i,t,s)=>{var e=s(69186),n=s(38236),h=s(38590),a=s(17321),c=s(37254),l=new e({Extends:n,initialize:function(i,t,s,e,l,o){n.call(this,i,"Sprite3D"),this.gameObject=new h(i,0,0,l,o),this.position=new c(t,s,e),this.size=new a(this.gameObject.width,this.gameObject.height),this.scale=new a(1,1),this.adjustScaleX=!0,this.adjustScaleY=!0,this._visible=!0},project:function(i){var t=this.position,s=this.gameObject;i.project(t,s),i.getPointSize(t,this.size,this.scale),this.scale.x<=0||this.scale.y<=0?s.setVisible(!1):(s.visible||s.setVisible(!0),this.adjustScaleX&&(s.scaleX=this.scale.x),this.adjustScaleY&&(s.scaleY=this.scale.y),s.setDepth(-1*s.z))},setVisible:function(i){return this.visible=i,this},visible:{get:function(){return this._visible},set:function(i){this._visible=i,this.gameObject.visible=i}},x:{get:function(){return this.position.x},set:function(i){this.position.x=i}},y:{get:function(){return this.position.y},set:function(i){this.position.y=i}},z:{get:function(){return this.position.z},set:function(i){this.position.z=i}}});i.exports=l},4081:(i,t,s)=>{var e=s(54256);s(66642).register("sprite3D",(function(i,t,s,n,h){var a=new e(this.scene,i,t,s,n,h);return this.displayList.add(a.gameObject),this.updateList.add(a.gameObject),a}))}}]);