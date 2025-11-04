@group(0) @binding(0) var<storage, read> grid: vec2f;
@group(1) @binding(0) var<storage, read> mouseCellPos: vec2f;
@group(2) @binding(0) var<storage, read> colors: array<u32>;

// Export to fragment
struct VertexOutput {
    @builtin(position) position: vec4f,  // clip-space position
    @location(0) @interpolate(flat) isHovering: i32, // flat integer
    @location(1) cellPos: vec2f,
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

    let cellPos = vec2f(i % grid.x, floor(i / grid.x));
    let gridPos = (pos + 1) / grid - 1;
    let cellCoords = gridPos + cellPos / grid * 2;

    var inverseMouseCellPos = vec2f(mouseCellPos.x, grid.y - 1 - mouseCellPos.y);
    var inverseOwnCell = vec2f(cellPos.x, grid.y - 1 - cellPos.y);
    var _isHovering: bool = all(inverseMouseCellPos == cellPos);

    if _isHovering == true {
        out.isHovering = 1;
    } else {
        out.isHovering = 0;
    }

    out.cellPos = inverseOwnCell;
    out.position = vec4f(cellCoords, 0, 1);

    return out;
}

@fragment
fn fragmentMain(
    @builtin(position) fragCoord: vec4f,
    @location(0) @interpolate(flat) isHovering: i32,
    @location(1) cellPos: vec2f,
) -> @location(0)vec4f {

    let cellWidth = 800 / grid.x;
    let cellHeight = 800 / grid.y;
    let posX = mouseCellPos.x * cellWidth;
    let posY = mouseCellPos.y * cellHeight;
    let ownPosX = cellPos.x * cellWidth;
    let ownPosY = cellPos.y * cellHeight;

    let colorIndex = u32(cellPos.x + cellPos.y * grid.x);
    let color = colors[colorIndex];

    if isHovering == 1 {
        if (fragCoord.y > posY && fragCoord.y < posY + 5)
        | (fragCoord.x > posX && fragCoord.x < posX + 5)
        | (fragCoord.y > posY + cellHeight - 5 && fragCoord.y < posY + cellHeight)
        | (fragCoord.x > posX + cellWidth -5 && fragCoord.x < posX + cellWidth)
        {
            return vec4f(1.0, 1.0, 1.0, 1.0);
        }
   }

        let rgb = unpack_rgb(color);

        if (fragCoord.y > ownPosY
        && fragCoord.y < ownPosY + cellHeight
        && fragCoord.x > ownPosX
        && fragCoord.x < ownPosX + cellWidth) {
            return rgb;
        }

        return vec4f(0.0, 0.0, 0.0, 0.0);
    }
