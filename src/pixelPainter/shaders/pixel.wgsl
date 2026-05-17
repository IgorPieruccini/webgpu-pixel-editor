struct CommonValues {
    panX: f32,
    panY: f32,
    canvasW: f32,
    canvasH: f32,
    gridX: f32,
    gridY: f32,
    zoom: f32,
}

struct TileValues {
    opacity: f32,
    layerOffsetX: f32,
    layerOffsetY: f32,
    tileOriginX: f32,
    tileOriginY: f32,
    tileWidth: f32,
    tileHeight: f32,
    padding: f32,
}

@group(0) @binding(0) var layerSampler: sampler;
@group(0) @binding(1) var layerTexture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> commonValues: CommonValues;
@group(0) @binding(3) var<uniform> tileValues: TileValues;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
};

@vertex
fn vertexMain(@builtin(vertex_index) i: u32) -> VertexOutput {
    var localPositions = array<vec2f, 6>(
        vec2f(0.0, 1.0),
        vec2f(1.0, 1.0),
        vec2f(0.0, 0.0),
        vec2f(0.0, 0.0),
        vec2f(1.0, 1.0),
        vec2f(1.0, 0.0),
    );

    var uvs = array<vec2f, 6>(
        vec2f(0.0, 1.0),
        vec2f(1.0, 1.0),
        vec2f(0.0, 0.0),
        vec2f(0.0, 0.0),
        vec2f(1.0, 1.0),
        vec2f(1.0, 0.0),
    );

    let local = localPositions[i];

    let worldX = tileValues.layerOffsetX + tileValues.tileOriginX + local.x * tileValues.tileWidth;
    let worldY = tileValues.layerOffsetY + tileValues.tileOriginY + local.y * tileValues.tileHeight;

    let clipX = (worldX / commonValues.gridX) * 2.0 - 1.0;
    let clipY = 1.0 - (worldY / commonValues.gridY) * 2.0;

    let gridSizeRatio = commonValues.gridX / commonValues.gridY;
    let aspectRatio = commonValues.canvasW / commonValues.canvasH;

    let panVec2 = vec2f(
        (commonValues.panX / commonValues.canvasW / aspectRatio) * 2.0,
        (commonValues.panY / commonValues.canvasH * gridSizeRatio) * 2.0
    );

    let transformAspectRatio = vec2f(clipX / aspectRatio, clipY / gridSizeRatio);
    let transformZoom = vec2f(transformAspectRatio * commonValues.zoom);
    let transformPan = vec2f(transformZoom + panVec2);

    var out: VertexOutput;
    out.position = vec4f(transformPan, 0.0, 1.0);
    out.uv = uvs[i];
    return out;
}

@fragment
fn fragmentMain(@location(0) uv: vec2f) -> @location(0) vec4f {
    let color = textureSample(layerTexture, layerSampler, uv);
    return vec4f(color.rgb, color.a * tileValues.opacity);
}
