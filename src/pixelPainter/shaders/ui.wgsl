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
    selectionToolActivated: f32,
}

@group(0) @binding(0) var<uniform> commonValues: CommonValues;
@group(0) @binding(1) var<uniform> uiParams: UIParams;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) canvasPixelCoord: vec2f,
};

fn rectMask(cell: vec2f, rectMin: vec2f, rectMax: vec2f) -> f32 {
    if cell.x >= rectMin.x &&
        cell.x <= rectMax.x &&
        cell.y >= rectMin.y &&
        cell.y <= rectMax.y {
        return 1.0;
    }

    return 0.0;
}

@vertex
fn vertexMain(@location(0) pos: vec2f) -> VertexOutput {
    var out: VertexOutput;
    let canvasSize = vec2f(commonValues.canvasW, commonValues.canvasH);
    let gridSize = vec2f(commonValues.gridX, commonValues.gridY);
    let aspectRatio = canvasSize.x / canvasSize.y;
    let gridRatio = gridSize.x / gridSize.y;
    let pan = vec2f(commonValues.panX, commonValues.panY);

    let panNdc = vec2f(
        (pan.x / canvasSize.x / aspectRatio) * 2.0,
        (pan.y / canvasSize.y * gridRatio) * 2.0
    );

    let transformed = vec2f(pos.x / aspectRatio, pos.y / gridRatio) * commonValues.zoom + panNdc;

    out.position = vec4f(transformed, 0.0, 1.0);
    out.canvasPixelCoord = vec2f(
        (pos.x + 1.0) * 0.5 * gridSize.x,
        (1.0 - (pos.y + 1.0) * 0.5) * gridSize.y
    );
    return out;
}

@fragment
fn fragmentMain(@location(0) canvasPixelCoord: vec2f) -> @location(0) vec4f {
    let cell = floor(canvasPixelCoord);
    let snappedCenter = cell + vec2f(0.5);
    let selectionActive = uiParams.selectionToolActivated > 0.5;

    if !selectionActive && uiParams.mouseCellX >= 0.0 && uiParams.mouseCellY >= 0.0 {
        let brushCenterPx = vec2f(uiParams.mouseCellX, uiParams.mouseCellY) + vec2f(0.5);
        let radiusPx = max(uiParams.brushThickness, 0.5);
        let dist = distance(snappedCenter, brushCenterPx);
        let fill = select(0.0, 1.0, dist < radiusPx);
        let alpha = fill * 0.18;

        if alpha > 0.0 {
            return vec4f(1.0, 1.0, 1.0, alpha);
        }
    }

    let hasSelectionRect = uiParams.selectionRectX >= 0.0 &&
        uiParams.selectionRectY >= 0.0 &&
        uiParams.selectionRectW >= 0.0 &&
        uiParams.selectionRectH >= 0.0;

    if hasSelectionRect {
        let rectMin = min(
            vec2f(uiParams.selectionRectX, uiParams.selectionRectY),
            vec2f(uiParams.selectionRectW, uiParams.selectionRectH)
        );
        let rectMax = max(
            vec2f(uiParams.selectionRectX, uiParams.selectionRectY),
            vec2f(uiParams.selectionRectW, uiParams.selectionRectH)
        );
        let inside = rectMask(cell, rectMin, rectMax);

        if inside == 1.0 {
            return vec4f(0.97, 0.97, 0.97, 0.1);
        }
    }

    return vec4f(0.0);
}
