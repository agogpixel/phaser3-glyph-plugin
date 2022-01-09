/*! For license information please see 674.demos.bundle.js.LICENSE.txt */
(self.webpackChunk_agogpixel_phaser3_glyph_plugin=self.webpackChunk_agogpixel_phaser3_glyph_plugin||[]).push([[674,412],{39386:(t,i,e)=>{var s=e(69186),n=e(54259),o=e(43815),r=e(6969),h=e(26578),a=e(96609),c=e(54256),u=e(17321),d=e(33736),p=e(37254),l=new d,v=new p,f=new d,w=new d,m=new n,y=new s({initialize:function(t){this.scene=t,this.displayList=t.sys.displayList,this.updateList=t.sys.updateList,this.name="",this.direction=new d(0,0,-1),this.up=new d(0,1,0),this.position=new d,this.pixelScale=128,this.projection=new n,this.view=new n,this.combined=new n,this.invProjectionView=new n,this.near=1,this.far=100,this.ray={origin:new d,direction:new d},this.viewportWidth=0,this.viewportHeight=0,this.billboardMatrixDirty=!0,this.children=new a},setPosition:function(t,i,e){return this.position.set(t,i,e),this.update()},setScene:function(t){return this.scene=t,this},setPixelScale:function(t){return this.pixelScale=t,this.update()},add:function(t){return this.children.set(t),this.displayList.add(t.gameObject),this.updateList.add(t.gameObject),this.updateChildren(),t},remove:function(t){return this.displayList.remove(t.gameObject),this.updateList.remove(t.gameObject),this.children.delete(t),this},clear:function(){for(var t=this.getChildren(),i=0;i<t.length;i++)this.remove(t[i]);return this},getChildren:function(){return this.children.entries},create:function(t,i,e,s,n,o){void 0===o&&(o=!0);var r=new c(this.scene,t,i,e,s,n);return this.displayList.add(r.gameObject),this.updateList.add(r.gameObject),r.visible=o,this.children.set(r),this.updateChildren(),r},createMultiple:function(t,i,e,s){void 0===s&&(s=!0);for(var n=[],o=0;o<t;o++){var r=new c(this.scene,0,0,0,i,e);this.displayList.add(r.gameObject),this.updateList.add(r.gameObject),r.visible=s,this.children.set(r),n.push(r)}return n},createRect:function(t,i,e,s){"number"==typeof t&&(t={x:t,y:t,z:t}),"number"==typeof i&&(i={x:i,y:i,z:i});for(var n=t.x*t.y*t.z,o=this.createMultiple(n,e,s),r=0,h=.5-t.z/2;h<t.z/2;h++)for(var a=.5-t.y/2;a<t.y/2;a++)for(var c=.5-t.x/2;c<t.x/2;c++){var u=c*i.x,d=a*i.y,p=h*i.z;o[r].position.set(u,d,p),r++}return this.update(),o},randomSphere:function(t,i){void 0===i&&(i=this.getChildren());for(var e=0;e<i.length;e++)o(i[e].position,t);return this.update()},randomCube:function(t,i){void 0===i&&(i=this.getChildren());for(var e=0;e<i.length;e++)r(i[e].position,t);return this.update()},translateChildren:function(t,i){void 0===i&&(i=this.getChildren());for(var e=0;e<i.length;e++)i[e].position.add(t);return this.update()},transformChildren:function(t,i){void 0===i&&(i=this.getChildren());for(var e=0;e<i.length;e++)i[e].position.transformMat4(t);return this.update()},setViewport:function(t,i){return this.viewportWidth=t,this.viewportHeight=i,this.update()},translate:function(t,i,e){return"object"==typeof t?(this.position.x+=t.x||0,this.position.y+=t.y||0,this.position.z+=t.z||0):(this.position.x+=t||0,this.position.y+=i||0,this.position.z+=e||0),this.update()},lookAt:function(t,i,e){var s=this.direction,n=this.up;return"object"==typeof t?s.copy(t):s.set(t,i,e),s.subtract(this.position).normalize(),l.copy(s).cross(n).normalize(),n.copy(l).cross(s).normalize(),this.update()},rotate:function(t,i){return h(this.direction,i,t),h(this.up,i,t),this.update()},rotateAround:function(t,i,e){return l.copy(t).subtract(this.position),this.translate(l),this.rotate(i,e),this.translate(l.negate()),this.update()},project:function(t,i){void 0===i&&(i=new p);var e=this.viewportWidth,s=this.viewportHeight,n=y.NEAR_RANGE,o=y.FAR_RANGE;return v.set(t.x,t.y,t.z,1),v.transformMat4(this.combined),0===v.w&&(v.w=1),v.x=v.x/v.w,v.y=v.y/v.w,v.z=v.z/v.w,i.x=e/2*v.x+(0+e/2),i.y=s/2*v.y+(0+s/2),i.z=(o-n)/2*v.z+(o+n)/2,(0===i.w||i.w)&&(i.w=1/v.w),i},unproject:function(t,i){void 0===i&&(i=new d);var e=v.set(0,0,this.viewportWidth,this.viewportHeight);return i.copy(t).unproject(e,this.invProjectionView)},getPickRay:function(t,i){var e=this.ray.origin.set(t,i,0),s=this.ray.direction.set(t,i,1),n=v.set(0,0,this.viewportWidth,this.viewportHeight),o=this.invProjectionView;return e.unproject(n,o),s.unproject(n,o),s.subtract(e).normalize(),this.ray},updateChildren:function(){for(var t=this.children.entries,i=0;i<t.length;i++)t[i].project(this);return this},update:function(){return this.updateChildren()},updateBillboardMatrix:function(){var t=f.set(this.direction).negate(),i=w.set(this.up).cross(t).normalize(),e=l.set(t).cross(i).normalize(),s=m.val;s[0]=i.x,s[1]=i.y,s[2]=i.z,s[3]=0,s[4]=e.x,s[5]=e.y,s[6]=e.z,s[7]=0,s[8]=t.x,s[9]=t.y,s[10]=t.z,s[11]=0,s[12]=0,s[13]=0,s[14]=0,s[15]=1,this.billboardMatrixDirty=!1},getPointSize:function(t,i,e){void 0===e&&(e=new u),this.billboardMatrixDirty&&this.updateBillboardMatrix();var s=l,n=i.x/this.pixelScale/2,o=i.y/this.pixelScale/2;s.set(-n,-o,0).transformMat4(m).add(t),this.project(s,s);var r=s.x,h=s.y;s.set(n,o,0).transformMat4(m).add(t),this.project(s,s);var a=s.x-r,c=s.y-h;return e.set(a,c)},destroy:function(){this.children.clear(),this.scene=void 0,this.children=void 0},setX:function(t){return this.position.x=t,this.update()},setY:function(t){return this.position.y=t,this.update()},setZ:function(t){return this.position.z=t,this.update()},x:{get:function(){return this.position.x},set:function(t){this.position.x=t,this.update()}},y:{get:function(){return this.position.y},set:function(t){this.position.y=t,this.update()}},z:{get:function(){return this.position.z},set:function(t){this.position.z=t,this.update()}}});y.FAR_RANGE=1,y.NEAR_RANGE=0,t.exports=y},88023:(t,i,e)=>{var s=e(69186),n=e(30540),o=e(50964),r=e(46236),h=new s({initialize:function(t){this.scene=t,this.systems=t.sys,this.cameras=[],t.sys.events.once("boot",this.boot,this),t.sys.events.on("start",this.start,this)},boot:function(){this.systems.events.once("destroy",this.destroy,this)},start:function(){var t=this.systems.events;t.on("update",this.update,this),t.once("shutdown",this.shutdown,this)},add:function(t,i,e){return this.addPerspectiveCamera(t,i,e)},addOrthographicCamera:function(t,i){var e=this.scene.sys.game.config;void 0===t&&(t=e.width),void 0===i&&(i=e.height);var s=new n(this.scene,t,i);return this.cameras.push(s),s},addPerspectiveCamera:function(t,i,e){var s=this.scene.sys.game.config;void 0===t&&(t=80),void 0===i&&(i=s.width),void 0===e&&(e=s.height);var n=new o(this.scene,t,i,e);return this.cameras.push(n),n},getCamera:function(t){for(var i=0;i<this.cameras.length;i++)if(this.cameras[i].name===t)return this.cameras[i];return null},removeCamera:function(t){var i=this.cameras.indexOf(t);-1!==i&&this.cameras.splice(i,1)},removeAll:function(){for(;this.cameras.length>0;)this.cameras.pop().destroy();return this.main},update:function(t,i){for(var e=0,s=this.cameras.length;e<s;++e)this.cameras[e].update(t,i)},shutdown:function(){var t=this.systems.events;t.off("update",this.update,this),t.off("shutdown",this.shutdown,this),this.removeAll()},destroy:function(){this.shutdown(),this.scene.sys.events.off("start",this.start,this),this.scene=null,this.systems=null}});r.register("CameraManager3D",h,"cameras3d"),t.exports=h},30540:(t,i,e)=>{var s=e(39386),n=e(69186),o=new(e(33736)),r=new n({Extends:s,initialize:function(t,i,e){void 0===i&&(i=0),void 0===e&&(e=0),s.call(this,t),this.viewportWidth=i,this.viewportHeight=e,this._zoom=1,this.near=0,this.update()},setToOrtho:function(t,i,e){void 0===i&&(i=this.viewportWidth),void 0===e&&(e=this.viewportHeight);var s=this.zoom;return this.up.set(0,t?-1:1,0),this.direction.set(0,0,t?1:-1),this.position.set(s*i/2,s*e/2,0),this.viewportWidth=i,this.viewportHeight=e,this.update()},update:function(){var t=this.viewportWidth,i=this.viewportHeight,e=Math.abs(this.near),s=Math.abs(this.far),n=this.zoom;return 0===t||0===i||(this.projection.ortho(n*-t/2,n*t/2,n*-i/2,n*i/2,e,s),o.copy(this.position).add(this.direction),this.view.lookAt(this.position,o,this.up),this.combined.copy(this.projection).multiply(this.view),this.invProjectionView.copy(this.combined).invert(),this.billboardMatrixDirty=!0,this.updateChildren()),this},zoom:{get:function(){return this._zoom},set:function(t){this._zoom=t,this.update()}}});t.exports=r},50964:(t,i,e)=>{var s=e(39386),n=e(69186),o=new(e(33736)),r=new n({Extends:s,initialize:function(t,i,e,n){void 0===i&&(i=80),void 0===e&&(e=0),void 0===n&&(n=0),s.call(this,t),this.viewportWidth=e,this.viewportHeight=n,this.fieldOfView=i*Math.PI/180,this.update()},setFOV:function(t){return this.fieldOfView=t*Math.PI/180,this},update:function(){var t=this.viewportWidth/this.viewportHeight;return this.projection.perspective(this.fieldOfView,t,Math.abs(this.near),Math.abs(this.far)),o.copy(this.position).add(this.direction),this.view.lookAt(this.position,o,this.up),this.combined.copy(this.projection).multiply(this.view),this.invProjectionView.copy(this.combined).invert(),this.billboardMatrixDirty=!0,this.updateChildren(),this}});t.exports=r},50430:(t,i,e)=>{t.exports={Camera:e(39386),CameraManager:e(88023),OrthographicCamera:e(30540),PerspectiveCamera:e(50964)}},54256:(t,i,e)=>{var s=e(69186),n=e(38236),o=e(38590),r=e(17321),h=e(37254),a=new s({Extends:n,initialize:function(t,i,e,s,a,c){n.call(this,t,"Sprite3D"),this.gameObject=new o(t,0,0,a,c),this.position=new h(i,e,s),this.size=new r(this.gameObject.width,this.gameObject.height),this.scale=new r(1,1),this.adjustScaleX=!0,this.adjustScaleY=!0,this._visible=!0},project:function(t){var i=this.position,e=this.gameObject;t.project(i,e),t.getPointSize(i,this.size,this.scale),this.scale.x<=0||this.scale.y<=0?e.setVisible(!1):(e.visible||e.setVisible(!0),this.adjustScaleX&&(e.scaleX=this.scale.x),this.adjustScaleY&&(e.scaleY=this.scale.y),e.setDepth(-1*e.z))},setVisible:function(t){return this.visible=t,this},visible:{get:function(){return this._visible},set:function(t){this._visible=t,this.gameObject.visible=t}},x:{get:function(){return this.position.x},set:function(t){this.position.x=t}},y:{get:function(){return this.position.y},set:function(t){this.position.y=t}},z:{get:function(){return this.position.z},set:function(t){this.position.z=t}}});t.exports=a}}]);