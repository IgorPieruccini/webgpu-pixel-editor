
@group(0) @binding(0) var<storage, read> bindValues: array<f32>;
@group(1) @binding(0) var<storage, read> colors: array<u32>;

// Export to fragment
struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) cellPos: vec2f,
};

fn unpack_rgba(color: u32, opacity: f32) -> vec4<f32> {

    let r = f32((color >> 16u) & 0xFFu) / 255.0;
    let g = f32((color >> 8u) & 0xFFu) / 255.0;
    let b = f32(color & 0xFFu) / 255.0;
    let a = f32(color >> 24) / 255;
    let layerOpacity = f32(opacity);

    return vec4<f32>(r, g, b,  a * layerOpacity);
}

@vertex
fn vertexMain(@location(0) pos: vec2f, @builtin(instance_index) instance: u32) -> VertexOutput {
    var out: VertexOutput;
    let i = f32(instance);

    let gridSize = vec2f(bindValues[0], bindValues[1]);
    let gridSizeRatio = gridSize.x / gridSize.y;
    let canvasSize = vec2f(bindValues[2], bindValues[3]);

    let aspectRatio = canvasSize.x / canvasSize.y;
    let pan = vec2f(bindValues[4], bindValues[5]);
    let zoom:f32 = bindValues[6];

    let cellPos = vec2f(i % gridSize.x, floor(i / gridSize.x));
    let gp = vec2f(
        (pos.x + 1) / gridSize.x -1,
        (pos.y + 1) / gridSize.y -1
    );
    let center = (gp + cellPos / gridSize * 2);
    let zoomed = center * zoom;

    var inverseOwnCell = vec2f(cellPos.x, gridSize.y - 1 - cellPos.y);

    let panNorm = vec2f(
        (pan.x / canvasSize.x) * 2.0,
        (pan.y / canvasSize.y * gridSizeRatio) * 2.0
    );

    let transformationApplied = vec2f(zoomed + panNorm);

    let corrected = vec2f(transformationApplied.x / aspectRatio, transformationApplied.y / gridSizeRatio);

    out.cellPos = inverseOwnCell;
    out.position = vec4f(corrected, 0, 1);


    return out;
}

@fragment
fn fragmentMain(
    @builtin(position) fragCoord: vec4f,
    @location(0) cellPos: vec2f,
) -> @location(0)vec4f {
    let gridSize = vec2f(bindValues[0], bindValues[1]) ;
    let colorIndex = u32(cellPos.x + cellPos.y * gridSize.x);
    let color = colors[colorIndex];
    let opacity = bindValues[7];
    let rgba = unpack_rgba(color, opacity);

    if (color == 0) {
        return vec4f(1.0, 1.0, 1.0, 0.0);
    }

    return rgba;
}
