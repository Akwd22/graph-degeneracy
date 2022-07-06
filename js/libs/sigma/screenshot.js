/**
 * There is a bug I can't find sources about, that makes it impossible to render
 * WebGL canvases using `#drawImage` as long as they appear onscreen. There are
 * basically two solutions:
 * 1. Use `webGLContext#readPixels`, transform it to an ImageData, put that
 *    ImageData in another canvas, and draw this canvas properly using
 *    `#drawImage`
 * 2. Hide the sigma instance
 * 3. Create a new sigma instance similar to the initial one (dimensions,
 *    settings, graph, camera...), use it and kill it
 * This exemple uses this last solution.
 */
 function sigmaScreenshot(renderer, width, height, inputLayers) {
    var _a = renderer.getDimensions(), width = width || _a.width, height = height || _a.height;
    // This pixel ratio is here to deal with retina displays.
    // Indeed, for dimensions W and H, on a retina display, the canvases
    // dimensions actually are 2 * W and 2 * H. Sigma properly deals with it, but
    // we need to readapt here:
    var pixelRatio = window.devicePixelRatio || 1;
    var tmpRoot = document.createElement("DIV");
    tmpRoot.style.width = "".concat(width, "px");
    tmpRoot.style.height = "".concat(height, "px");
    tmpRoot.style.position = "absolute";
    tmpRoot.style.right = "101%";
    tmpRoot.style.bottom = "101%";
    document.body.appendChild(tmpRoot);
    // Instantiate sigma:
    var tmpRenderer = new Sigma(renderer.getGraph(), tmpRoot, renderer.getSettings());
    // Copy camera and force to render now, to avoid having to wait the schedule /
    // debounce frame:
    tmpRenderer.getCamera().setState(renderer.getCamera().getState());
    tmpRenderer.refresh();
    // Create a new canvas, on which the different layers will be drawn:
    var canvas = document.createElement("CANVAS");
    canvas.setAttribute("width", width * pixelRatio + "");
    canvas.setAttribute("height", height * pixelRatio + "");
    var ctx = canvas.getContext("2d");
    // Draw a white background first:
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width * pixelRatio, height * pixelRatio);
    // For each layer, draw it on our canvas:
    var canvases = tmpRenderer.getCanvases();
    var layers = inputLayers ? inputLayers.filter(function (id) { return !!canvases[id]; }) : Object.keys(canvases);
    layers.forEach(function (id) {
        ctx.drawImage(canvases[id], 0, 0, width * pixelRatio, height * pixelRatio, 0, 0, width * pixelRatio, height * pixelRatio);
    });
    // Save the canvas as a JPEG image:
    var jpeg = canvas.toDataURL("image/jpeg", 1.0);
    tmpRenderer.kill();
    tmpRoot.remove();
    return jpeg;
}
