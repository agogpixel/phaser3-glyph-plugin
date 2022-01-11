/**
 * Add WebGL mocks to Phaser WebGL renderer context associated with specified
 * game.
 * @param game Phaser game instance.
 * @internal
 */
export function phaserWebGLRendererMockAdapter(game: Phaser.Game) {
  const ctx = game.canvas.getContext('webgl');
  const proto = window.WebGLRenderingContext.prototype;

  ctx.isContextLost = () => false;
  ctx.getSupportedExtensions = proto.getSupportedExtensions.bind(ctx);
  ctx.getParameter = () => 16;
  ctx.getExtension = proto.getExtension.bind(ctx);
  ctx.disable = proto.disable.bind(ctx);
  ctx.enable = proto.enable.bind(ctx);
  ctx.clearColor = proto.clearColor.bind(ctx);
  ctx.activeTexture = proto.activeTexture.bind(ctx);
  ctx.blendEquation = proto.blendEquation.bind(ctx);
  ctx.blendFunc = proto.blendFunc.bind(ctx);
  ctx.createTexture = proto.createTexture.bind(ctx);
  ctx.deleteTexture = proto.deleteTexture.bind(ctx);
  ctx.bindTexture = proto.bindTexture.bind(ctx);
  ctx.texImage2D = proto.texImage2D.bind(ctx);
  ctx.bindBuffer = proto.bindBuffer.bind(ctx);
  ctx.createProgram = proto.createProgram.bind(ctx);
  ctx.createShader = proto.createShader.bind(ctx);
  ctx.shaderSource = proto.shaderSource.bind(ctx);
  ctx.compileShader = proto.compileShader.bind(ctx);
  ctx.getShaderParameter = proto.getShaderParameter.bind(ctx);
  ctx.attachShader = proto.attachShader.bind(ctx);
  ctx.linkProgram = proto.linkProgram.bind(ctx);
  ctx.getProgramParameter = proto.getProgramParameter.bind(ctx);
  ctx.useProgram = proto.useProgram.bind(ctx);
  ctx.createBuffer = proto.createBuffer.bind(ctx);
  ctx.bufferData = proto.bufferData.bind(ctx);
  ctx.getAttribLocation = proto.getAttribLocation.bind(ctx);
  ctx.disableVertexAttribArray = proto.disableVertexAttribArray.bind(ctx);
  ctx.deleteBuffer = proto.deleteBuffer.bind(ctx);
  ctx.texParameteri = proto.texParameteri.bind(ctx);
  ctx.pixelStorei = proto.pixelStorei.bind(ctx);
  ctx.createFramebuffer = proto.createFramebuffer.bind(ctx);
  ctx.bindFramebuffer = proto.bindFramebuffer.bind(ctx);
  ctx.viewport = proto.viewport.bind(ctx);
  ctx.framebufferTexture2D = proto.framebufferTexture2D.bind(ctx);
  ctx.checkFramebufferStatus = () => undefined;
  ctx.generateMipmap = proto.generateMipmap.bind(ctx);
  ctx.scissor = proto.scissor.bind(ctx);
  ctx.bufferSubData = proto.bufferSubData.bind(ctx);
  ctx.drawArrays = proto.drawArrays.bind(ctx);
}
