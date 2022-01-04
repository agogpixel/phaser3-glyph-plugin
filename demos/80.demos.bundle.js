/*! For license information please see 80.demos.bundle.js.LICENSE.txt */
(self.webpackChunk_agogpixel_phaser3_glyph_plugin=self.webpackChunk_agogpixel_phaser3_glyph_plugin||[]).push([[80],{84262:(e,t,i)=>{var r=i(22603),n=i(69186),s=i(99370),a=i(26729),l=i(14999),h=i(25738),c=i(76076),o=i(53013),u=i(17109),d=i(96609),f=i(38590),p=new n({Extends:a,initialize:function(e,t,i){a.call(this),i?t&&!Array.isArray(t)&&(t=[t]):Array.isArray(t)?o(t[0])&&(i=t,t=null):o(t)&&(i=t,t=null),this.scene=e,this.children=new d,this.isParent=!0,this.type="Group",this.classType=h(i,"classType",f),this.name=h(i,"name",""),this.active=h(i,"active",!0),this.maxSize=h(i,"maxSize",-1),this.defaultKey=h(i,"defaultKey",null),this.defaultFrame=h(i,"defaultFrame",null),this.runChildUpdate=h(i,"runChildUpdate",!1),this.createCallback=h(i,"createCallback",null),this.removeCallback=h(i,"removeCallback",null),this.createMultipleCallback=h(i,"createMultipleCallback",null),this.internalCreateCallback=h(i,"internalCreateCallback",null),this.internalRemoveCallback=h(i,"internalRemoveCallback",null),t&&this.addMultiple(t),i&&this.createMultiple(i),this.on(s.ADDED_TO_SCENE,this.addedToScene,this),this.on(s.REMOVED_FROM_SCENE,this.removedFromScene,this)},addedToScene:function(){this.scene.sys.updateList.add(this)},removedFromScene:function(){this.scene.sys.updateList.remove(this)},create:function(e,t,i,r,n,s){if(void 0===e&&(e=0),void 0===t&&(t=0),void 0===i&&(i=this.defaultKey),void 0===r&&(r=this.defaultFrame),void 0===n&&(n=!0),void 0===s&&(s=!0),this.isFull())return null;var a=new this.classType(this.scene,e,t,i,r);return a.addToDisplayList(this.scene.sys.displayList),a.addToUpdateList(),a.visible=n,a.setActive(s),this.add(a),a},createMultiple:function(e){if(this.isFull())return[];Array.isArray(e)||(e=[e]);var t=[];if(e[0].key)for(var i=0;i<e.length;i++){var r=this.createFromConfig(e[i]);t=t.concat(r)}return t},createFromConfig:function(e){if(this.isFull())return[];this.classType=h(e,"classType",this.classType);var t=h(e,"key",void 0),i=h(e,"frame",null),n=h(e,"visible",!0),s=h(e,"active",!0),a=[];if(void 0===t)return a;Array.isArray(t)||(t=[t]),Array.isArray(i)||(i=[i]);var l=h(e,"repeat",0),o=h(e,"randomKey",!1),d=h(e,"randomFrame",!1),f=h(e,"yoyo",!1),p=h(e,"quantity",!1),v=h(e,"frameQuantity",1),m=h(e,"max",0),y=u(t,i,{max:m,qty:p||v,random:o,randomB:d,repeat:l,yoyo:f});e.createCallback&&(this.createCallback=e.createCallback),e.removeCallback&&(this.removeCallback=e.removeCallback);for(var g=0;g<y.length;g++){var S=this.create(0,0,y[g].a,y[g].b,n,s);if(!S)break;a.push(S)}var b=c(e,"setXY.x",0),C=c(e,"setXY.y",0),A=c(e,"setXY.stepX",0),k=c(e,"setXY.stepY",0);r.SetXY(a,b,C,A,k);var F=c(e,"setRotation.value",0),T=c(e,"setRotation.step",0);r.SetRotation(a,F,T);var x=c(e,"setScale.x",1),Y=c(e,"setScale.y",x),D=c(e,"setScale.stepX",0),X=c(e,"setScale.stepY",0);r.SetScale(a,x,Y,D,X);var L=c(e,"setOrigin.x",.5),R=c(e,"setOrigin.y",L),O=c(e,"setOrigin.stepX",0),M=c(e,"setOrigin.stepY",0);r.SetOrigin(a,L,R,O,M);var z=c(e,"setAlpha.value",1),E=c(e,"setAlpha.step",0);r.SetAlpha(a,z,E);var _=c(e,"setDepth.value",0),V=c(e,"setDepth.step",0);r.SetDepth(a,_,V);var U=c(e,"setScrollFactor.x",1),H=c(e,"setScrollFactor.y",U),P=c(e,"setScrollFactor.stepX",0),w=c(e,"setScrollFactor.stepY",0);r.SetScrollFactor(a,U,H,P,w);var I=h(e,"hitArea",null),B=h(e,"hitAreaCallback",null);I&&r.SetHitArea(a,I,B);var N=h(e,"gridAlign",!1);return N&&r.GridAlign(a,N),this.createMultipleCallback&&this.createMultipleCallback.call(this,a),a},preUpdate:function(e,t){if(this.runChildUpdate&&0!==this.children.size)for(var i=this.children.entries.slice(),r=0;r<i.length;r++){var n=i[r];n.active&&n.update(e,t)}},add:function(e,t){return void 0===t&&(t=!1),this.isFull()||(this.children.set(e),this.internalCreateCallback&&this.internalCreateCallback.call(this,e),this.createCallback&&this.createCallback.call(this,e),t&&(e.addToDisplayList(this.scene.sys.displayList),e.addToUpdateList()),e.on(s.DESTROY,this.remove,this)),this},addMultiple:function(e,t){if(void 0===t&&(t=!1),Array.isArray(e))for(var i=0;i<e.length;i++)this.add(e[i],t);return this},remove:function(e,t,i){return void 0===t&&(t=!1),void 0===i&&(i=!1),this.children.contains(e)?(this.children.delete(e),this.internalRemoveCallback&&this.internalRemoveCallback.call(this,e),this.removeCallback&&this.removeCallback.call(this,e),e.off(s.DESTROY,this.remove,this),i?e.destroy():t&&(e.removeFromDisplayList(),e.removeFromUpdateList()),this):this},clear:function(e,t){void 0===e&&(e=!1),void 0===t&&(t=!1);for(var i=this.children,r=0;r<i.size;r++){var n=i.entries[r];n.off(s.DESTROY,this.remove,this),t?n.destroy():e&&(n.removeFromDisplayList(),n.removeFromUpdateList())}return this.children.clear(),this},contains:function(e){return this.children.contains(e)},getChildren:function(){return this.children.entries},getLength:function(){return this.children.size},getMatching:function(e,t,i,r){return l(this.children.entries,e,t,i,r)},getFirst:function(e,t,i,r,n,s,a){return this.getHandler(!0,1,e,t,i,r,n,s,a)},getFirstNth:function(e,t,i,r,n,s,a,l){return this.getHandler(!0,e,t,i,r,n,s,a,l)},getLast:function(e,t,i,r,n,s,a){return this.getHandler(!1,1,e,t,i,r,n,s,a)},getLastNth:function(e,t,i,r,n,s,a,l){return this.getHandler(!1,e,t,i,r,n,s,a,l)},getHandler:function(e,t,i,r,n,s,a,l,h){var c,o;void 0===i&&(i=!1),void 0===r&&(r=!1);var u=0,d=this.children.entries;if(e)for(o=0;o<d.length;o++)if((c=d[o]).active===i){if(++u===t)break}else c=null;else for(o=d.length-1;o>=0;o--)if((c=d[o]).active===i){if(++u===t)break}else c=null;return c?("number"==typeof n&&(c.x=n),"number"==typeof s&&(c.y=s),c):r?this.create(n,s,a,l,h):null},get:function(e,t,i,r,n){return this.getFirst(!1,!0,e,t,i,r,n)},getFirstAlive:function(e,t,i,r,n,s){return this.getFirst(!0,e,t,i,r,n,s)},getFirstDead:function(e,t,i,r,n,s){return this.getFirst(!1,e,t,i,r,n,s)},playAnimation:function(e,t){return r.PlayAnimation(this.children.entries,e,t),this},isFull:function(){return-1!==this.maxSize&&this.children.size>=this.maxSize},countActive:function(e){void 0===e&&(e=!0);for(var t=0,i=0;i<this.children.size;i++)this.children.entries[i].active===e&&t++;return t},getTotalUsed:function(){return this.countActive()},getTotalFree:function(){var e=this.getTotalUsed();return(-1===this.maxSize?999999999999:this.maxSize)-e},setActive:function(e){return this.active=e,this},setName:function(e){return this.name=e,this},propertyValueSet:function(e,t,i,n,s){return r.PropertyValueSet(this.children.entries,e,t,i,n,s),this},propertyValueInc:function(e,t,i,n,s){return r.PropertyValueInc(this.children.entries,e,t,i,n,s),this},setX:function(e,t){return r.SetX(this.children.entries,e,t),this},setY:function(e,t){return r.SetY(this.children.entries,e,t),this},setXY:function(e,t,i,n){return r.SetXY(this.children.entries,e,t,i,n),this},incX:function(e,t){return r.IncX(this.children.entries,e,t),this},incY:function(e,t){return r.IncY(this.children.entries,e,t),this},incXY:function(e,t,i,n){return r.IncXY(this.children.entries,e,t,i,n),this},shiftPosition:function(e,t,i){return r.ShiftPosition(this.children.entries,e,t,i),this},angle:function(e,t){return r.Angle(this.children.entries,e,t),this},rotate:function(e,t){return r.Rotate(this.children.entries,e,t),this},rotateAround:function(e,t){return r.RotateAround(this.children.entries,e,t),this},rotateAroundDistance:function(e,t,i){return r.RotateAroundDistance(this.children.entries,e,t,i),this},setAlpha:function(e,t){return r.SetAlpha(this.children.entries,e,t),this},setTint:function(e,t,i,n){return r.SetTint(this.children.entries,e,t,i,n),this},setOrigin:function(e,t,i,n){return r.SetOrigin(this.children.entries,e,t,i,n),this},scaleX:function(e,t){return r.ScaleX(this.children.entries,e,t),this},scaleY:function(e,t){return r.ScaleY(this.children.entries,e,t),this},scaleXY:function(e,t,i,n){return r.ScaleXY(this.children.entries,e,t,i,n),this},setDepth:function(e,t){return r.SetDepth(this.children.entries,e,t),this},setBlendMode:function(e){return r.SetBlendMode(this.children.entries,e),this},setHitArea:function(e,t){return r.SetHitArea(this.children.entries,e,t),this},shuffle:function(){return r.Shuffle(this.children.entries),this},kill:function(e){this.children.contains(e)&&e.setActive(!1)},killAndHide:function(e){this.children.contains(e)&&(e.setActive(!1),e.setVisible(!1))},setVisible:function(e,t,i){return r.SetVisible(this.children.entries,e,t,i),this},toggleVisible:function(){return r.ToggleVisible(this.children.entries),this},destroy:function(e,t){void 0===e&&(e=!1),void 0===t&&(t=!1),this.scene&&!this.ignoreDestroy&&(this.emit(s.DESTROY,this),this.removeAllListeners(),this.scene.sys.updateList.remove(this),this.clear(t,e),this.scene=void 0,this.children=void 0)}});e.exports=p},86479:(e,t,i)=>{var r=i(69186),n=i(19506),s=i(38236),a=i(16217),l=new r({Extends:s,Mixins:[n.Alpha,n.BlendMode,n.Depth,n.Flip,n.FX,n.GetBounds,n.Mask,n.Origin,n.Pipeline,n.ScrollFactor,n.Size,n.TextureCrop,n.Tint,n.Transform,n.Visible,a],initialize:function(e,t,i,r,n){s.call(this,e,"Image"),this._crop=this.resetCropObject(),this.setTexture(r,n),this.setPosition(t,i),this.setSizeToFrame(),this.setOriginFromFrame(),this.initPipeline()}});e.exports=l},26681:e=>{e.exports=function(e,t,i,r){i.addToRenderList(t),e.batchSprite(t,t.frame,i,r)}},16217:(e,t,i)=>{var r=i(45733),n=i(45733);r=i(84188),n=i(26681),e.exports={renderWebGL:r,renderCanvas:n}},84188:e=>{e.exports=function(e,t,i,r){i.addToRenderList(t),this.pipeline.batchSprite(t,i,r)}}}]);