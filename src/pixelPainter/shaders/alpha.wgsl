struct GridValues {
    panX: f32,
    panY: f32,
    canvasW: f32,
    canvasH: f32,
    gridX: f32,
    gridY: f32,
    zoom: f32,
}

@group(0) @binding(0) var<uniform> gridValues: GridValues;

// Export to fragment
struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
};

@vertex
fn vertexMain(@builtin(vertex_index) i: u32) -> VertexOutput {

    var positions = array<vec2f, 6>(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f(-1.0,  1.0),
        vec2f(-1.0,  1.0),
        vec2f( 1.0, -1.0),
        vec2f( 1.0,  1.0),
  );

  var uvs = array<vec2f, 6>(
        vec2f(0.0, 1.0),
        vec2f(1.0, 1.0),
        vec2f(0.0, 0.0),
        vec2f(0.0, 0.0),
        vec2f(1.0, 1.0),
        vec2f(1.0, 0.0),
    );

  var out: VertexOutput;

  let pos = positions[i];


  // Apply pan and zoom transformations
  let panX = gridValues.panX;
  let panY = gridValues.panY;
  let zoom = gridValues.zoom;
  let canvasW = gridValues.canvasW;
  let canvasH = gridValues.canvasH;
  let gridX = gridValues.gridX;
  let gridY = gridValues.gridY;

  let gridSizeRatio = gridX / gridY;
  let aspectRatio = canvasW / canvasH;


  let panVec2 = vec2f(
      (panX / canvasW / aspectRatio) * 2.0,
      (panY / canvasH * gridSizeRatio) * 2.0
  );

  let transformAspectRatio = vec2f(pos.x / aspectRatio, pos.y / gridSizeRatio);
  let transformZoom = vec2f(transformAspectRatio * zoom);
  let transformPan = vec2(transformZoom + panVec2);


  out.position = vec4f(transformPan, 0.0, 1.0);

  // Scale UV coordinates by grid dimensions
  let baseUV = uvs[i];
  out.uv = vec2f(baseUV.x * gridX, baseUV.y * gridY);
  return out;
}

@fragment
fn fragmentMain(@location(0) uv: vec2f) -> @location(0) vec4f {
    let scale = 0.4;
    let coord = floor(uv * scale);
    let checker = (coord.x + coord.y) % 2.0;

    let c0 = vec3f(0.9);
    let c1 = vec3f(0.8);

    return vec4f(mix(c0, c1, checker), 1.0);
}
