struct CommonValues {
    panX: f32,
    panY: f32,
    canvasW: f32,
    canvasH: f32,
    gridX: f32,
    gridY: f32,
    zoom: f32,
}

struct UIParams {
    mouseCellX: f32,
    mouseCellY: f32,
    selectionRectX: f32,
    selectionRectY: f32,
    selectionRectW: f32,
    selectionRectH: f32,
    brushThickness: f32,
    selectionToolActivated: f32
}

@group(0) @binding(0) var<uniform> commonValues: CommonValues;
@group(0) @binding(1) var<uniform> uiParams: UIParams;

// Export to fragment
struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) @interpolate(flat) isHovering: i32,
    @location(1) cellPos: vec2f,
    @location(2) worldPos: vec3f,
    @location(3) @interpolate(flat) isSelected: i32,
};

fn distance2D(a: vec2<f32>, b: vec2<f32>) -> f32 {
    return length(b - a);
}

@vertex
fn vertexMain(@location(0) pos: vec2f, @builtin(instance_index) instance: u32) -> VertexOutput {
    var out: VertexOutput;
    let i = f32(instance);

    let gridSize = vec2f(commonValues.gridX, commonValues.gridY);
    let gridSizeRatio = gridSize.x / gridSize.y;
    let mouseCellPos = vec2f(uiParams.mouseCellX, uiParams.mouseCellY);
    let canvasSize = vec2f(commonValues.canvasW, commonValues.canvasH);

    let aspectRatio = canvasSize.x / canvasSize.y;
    let pan = vec2f(commonValues.panX, commonValues.panY);
    let zoom:f32 = commonValues.zoom;
    let zoomScale = 1.0 / zoom;

    let selectionRect = vec4f(uiParams.selectionRectX,  uiParams.selectionRectY , uiParams.selectionRectW, uiParams.selectionRectH);

    let cellPos = vec2f(i % gridSize.x, floor(i / gridSize.x));
    let gridPos = (pos + 1) / gridSize - 1;
    let center = (gridPos + cellPos / gridSize * 2);
    let cellCoords = center;
    let zoomed = center * zoom;

    var inverseMouseCellPos = vec2f(mouseCellPos.x, gridSize.y - 1 - mouseCellPos.y);
    var inverseOwnCell = vec2f(cellPos.x, gridSize.y - 1 - cellPos.y);
    var _isHovering: bool = all(inverseMouseCellPos == cellPos);

    var dist = distance2D(inverseMouseCellPos, cellPos);

    if (dist < uiParams.brushThickness / 4 && uiParams.selectionToolActivated == 0) {
        _isHovering = true;
    }

    if _isHovering == true {
        out.isHovering = 1;
    } else {
        out.isHovering = 0;
    }

    let panVec2 = vec2f(
           (pan.x / canvasSize.x / aspectRatio) * 2.0,
           (pan.y / canvasSize.y * gridSizeRatio) * 2.0
    );

    let transformAspectRatio = vec2f(center.x / aspectRatio, center.y / gridSizeRatio);
    let transformZoom = transformAspectRatio * zoom;
    let corrected = transformZoom + panVec2;

    out.cellPos = inverseOwnCell;
    out.position = vec4f(corrected, 0, 1);
    out.worldPos = vec3f(pos, 1);
    out.isSelected = 0;


    if(
    (inverseOwnCell.x >= selectionRect.x || inverseOwnCell.x >= selectionRect.z)
    && (inverseOwnCell.x <= selectionRect.z || inverseOwnCell.x <= selectionRect.x)
    && (inverseOwnCell.y >= selectionRect.y || inverseOwnCell.y >= selectionRect.w)
    && (inverseOwnCell.y <= selectionRect.w || inverseOwnCell.y <= selectionRect.y)
    ){
       out.isSelected = 1;
    }


    return out;
}

@fragment
fn fragmentMain(
    @builtin(position) fragCoord: vec4f,
    @location(0) @interpolate(flat) isHovering: i32,
    @location(1) cellPos: vec2f,
    @location(2) worldPos: vec3f,
    @location(3) @interpolate(flat) isSelected: i32
) -> @location(0)vec4f {
    let gridSize = vec2f(commonValues.gridX, commonValues.gridY) ;
    let colorIndex = u32(cellPos.x + cellPos.y * gridSize.x);

    if (isSelected == 1) {
       return vec4f(0.95, 0.95, 0.95, 0.5);
    }

    if isHovering == 1 {
       return vec4f(1.0, 1.0, 1.0, 0.5);
    }

    return vec4f(1.0, 1.0, 1.0, 0.0);
}
