
struct CommonValues {
    panX: f32,
    panY: f32,
    canvasW: f32,
    canvasH: f32,
    gridX: f32,
    gridY: f32,
    zoom: f32,
}

struct LayerValues {
    opacity: f32,
}

@group(0) @binding(0) var layerSampler: sampler;
@group(0) @binding(1) var layerTexture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> commonValues: CommonValues;
@group(0) @binding(3) var<uniform> layerValues: LayerValues;

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
  let panX = commonValues.panX;
  let panY = commonValues.panY;
  let zoom = commonValues.zoom;
  let canvasW = commonValues.canvasW;
  let canvasH = commonValues.canvasH;
  let gridX = commonValues.gridX;
  let gridY = commonValues.gridY;
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
  out.uv = uvs[i];
  return out;
}



@fragment
fn fragmentMain(@location(0) uv: vec2f) -> @location(0)vec4f {
  let color = textureSample(layerTexture, layerSampler, uv);
  let opacity = layerValues.opacity;
  return vec4f(color.rgb, color.a * opacity);
}
