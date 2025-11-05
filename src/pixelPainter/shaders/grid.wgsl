
@group(0) @binding(0) var<storage, read> bindValues: array<f32>;
@group(1) @binding(0) var<storage, read> colors: array<u32>;

// Export to fragment
struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) @interpolate(flat) isHovering: i32,
    @location(1) cellPos: vec2f,
    @location(2) worldPos: vec3f,
};

fn unpack_rgb(color: u32) -> vec4<f32> {
    let r = f32((color >> 16u) & 0xFFu) / 255.0;
    let g = f32((color >> 8u) & 0xFFu) / 255.0;
    let b = f32(color & 0xFFu) / 255.0;
    return vec4<f32>(r, g, b, 1.0);
}

@vertex
fn vertexMain(@location(0) pos: vec2f, @builtin(instance_index) instance: u32) -> VertexOutput {
    var out: VertexOutput;
    let i = f32(instance);

    let gridSize = vec2f(bindValues[0], bindValues[1]);
    let mouseCellPos = vec2f(bindValues[2], bindValues[3]);
    let canvasSize = vec2f(bindValues[4], bindValues[5]);
    let pan = vec2f(bindValues[6], bindValues[7]);
    let zoom:f32 = bindValues[8];
    let zoomScale = 1.0 / zoom;

    let cellPos = vec2f(i % gridSize.x, floor(i / gridSize.x));
    let gridPos = (pos + 1) / gridSize - 1;
    let center = (gridPos + cellPos / gridSize * 2);
    let cellCoords = center;
    let zoomed = center * zoom;

    var inverseMouseCellPos = vec2f(mouseCellPos.x, gridSize.y - 1 - mouseCellPos.y);
    var inverseOwnCell = vec2f(cellPos.x, gridSize.y - 1 - cellPos.y);
    var _isHovering: bool = all(inverseMouseCellPos == cellPos);

    if _isHovering == true {
        out.isHovering = 1;
    } else {
        out.isHovering = 0;
    }

    let panNorm = vec2f(
        (pan.x / canvasSize.x) * 2.0,
        (pan.y / canvasSize.y) * 2.0
    );

    out.cellPos = inverseOwnCell;
    out.position = vec4f(zoomed + panNorm, 0, 1);
    out.worldPos = vec3f(pos, 1);

    return out;
}

@fragment
fn fragmentMain(
    @builtin(position) fragCoord: vec4f,
    @location(0) @interpolate(flat) isHovering: i32,
    @location(1) cellPos: vec2f,
    @location(2) worldPos: vec3f
) -> @location(0)vec4f {
    let gridSize = vec2f(bindValues[0], bindValues[1]) ;

    let colorIndex = u32(cellPos.x + cellPos.y * gridSize.x);
    let color = colors[colorIndex];

    if isHovering == 1 {
        if (worldPos.y >= 0.9)
        | (worldPos.x >= 0.9)
        | (worldPos.y <=  -0.9)
        | (worldPos.x <= -0.9)
        {
            return vec4f(1.0, 1.0, 1.0, 1.0);
        }
    }

        let rgb = unpack_rgb(color);
        return rgb;
     }
