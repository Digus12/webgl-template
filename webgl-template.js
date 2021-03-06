function onload () {
    // initialize GL
    var canvas = document.getElementById("glcanvas");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    // do one-time initialization of graphics resources
    var scene = init(gl);

    // the callback for each frame of animation (ie. at ~60fps)
    function animationCallback(timestamp) {
        // draw this frame
        draw(gl, scene, timestamp);
        
        // request the next frame of animation
        window.requestAnimationFrame(animationCallback);
    };
    
    // kick off the first animation frame
    window.requestAnimationFrame(animationCallback);
}

function init (gl) {
    var triangleVertexData = new Float32Array([
    //  position (x,y)  color (r,g,b)
        -0.5, -0.5,     1.0, 0.0, 0.0,
         0.5, -0.5,     0.0, 1.0, 0.0,
         0.0,  0.5,     0.0, 0.0, 1.0
    ]);

    var triangleIndexData = new Uint16Array([
        0, 1, 2
    ]);

    var vertexShaderSource = "uniform lowp vec4 tint;\n" +
                             "\n" +
                             "attribute highp vec4 vertexPosition;\n" +
                             "attribute lowp vec4 vertexColor;\n" +
                             "\n" +
                             "varying lowp vec4 fragmentColor;\n" +
                             "\n" +
                             "void main() {\n" +
                             "    fragmentColor = vertexColor + tint;\n" +
                             "    gl_Position = vertexPosition;\n" +
                             "}\n";

    var fragmentShaderSource = "varying lowp vec4 fragmentColor;\n" +
                               "\n" +
                               "void main() {\n" +
                               "    gl_FragColor = fragmentColor;\n" +
                               "}\n";

    // allocate and upload vertex data
    var triangleVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVertexData, gl.STATIC_DRAW);

    // allocate and upload index data
    var triangleIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndexData, gl.STATIC_DRAW);

    // upload and compile the vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    // upload and compile the fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // link the vertex shader and fragment shader together into a shader program
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    // return the "scene" data that will be passed to draw()
    return {
        triangleVertexBuffer: triangleVertexBuffer,
        triangleIndexBuffer: triangleIndexBuffer,
        shaderProgram: shaderProgram
    };
}

function draw (gl, scene, timestamp) {   
    // clear the screen
    gl.clear(gl.COLOR_BUFFER_BIT);

    // set the shader program to use to draw
    gl.useProgram(scene.shaderProgram);

    // update the uniform tint
    var currentTimeInSeconds = timestamp / 1000.0;
    var strobePeriodInSeconds = 3;
    var tint = Math.abs(Math.sin(Math.PI / strobePeriodInSeconds * currentTimeInSeconds));
    var tintLocation = gl.getUniformLocation(scene.shaderProgram, "tint");
    gl.uniform4f(tintLocation, tint, 0.0, 0.0, 1.0);

    // explain to GL how to read the raw position data that was uploaded, then enable it.
    var positionLocation = gl.getAttribLocation(scene.shaderProgram, "vertexPosition");
    var positionSize = 2;
    var positionType = gl.FLOAT;
    var positionNormalized = false;
    var positionStrideInBytes = 20;
    var firstPositionOffsetInBytes = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, scene.triangleVertexBuffer);
    gl.vertexAttribPointer(
        positionLocation,
        positionSize,
        positionType,
        positionNormalized,
        positionStrideInBytes,
        firstPositionOffsetInBytes);
    gl.enableVertexAttribArray(positionLocation);

    // explain to GL how to read the raw color data that was uploaded, then enable it.
    var colorLocation = gl.getAttribLocation(scene.shaderProgram, "vertexColor");
    var colorSize = 3;
    var colorType = gl.FLOAT;
    var colorNormalized = false;
    var colorStrideInBytes = 20;
    var firstColorOffsetInBytes = 8;
    gl.bindBuffer(gl.ARRAY_BUFFER, scene.triangleVertexBuffer);
    gl.vertexAttribPointer(
        colorLocation,
        colorSize,
        colorType,
        colorNormalized,
        colorStrideInBytes,
        firstColorOffsetInBytes);
    gl.enableVertexAttribArray(colorLocation);

    // draw the triangle using the previously set up program and vertex/index data.
    var indexCount = 3;
    var indexType = gl.UNSIGNED_SHORT;
    var firstIndexOffsetInBytes = 0;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scene.triangleIndexBuffer);
    gl.drawElements(gl.TRIANGLES, indexCount, indexType, firstIndexOffsetInBytes);
}
