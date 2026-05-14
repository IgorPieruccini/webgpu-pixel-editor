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
    selectedColor: vec4f,
    lineStartX: f32,
    lineStartY: f32,
    activeTool: f32,
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

fn lineMask(cell: vec2f, lineStart: vec2f, lineEnd: vec2f, thickness: f32) -> f32 {
    let dx = lineEnd.x - lineStart.x;
    let dy = lineEnd.y - lineStart.y;
    let steps = i32(max(abs(dx), abs(dy)));

    if steps == 0 {
        let point = vec2f(round(lineStart.x), round(lineStart.y));
        let dist = distance(point, cell);
        return select(0.0, 1.0, dist < thickness);
    }

    let xInc = dx / f32(steps);
    let yInc = dy / f32(steps);

    var x = lineStart.x;
    var y = lineStart.y;

    for (var i = 0; i <= steps; i++) {
        let point = vec2f(round(x), round(y));
        if distance(point, cell) < thickness {
            return 1.0;
        }

        x += xInc;
        y += yInc;
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
    let activeTool = uiParams.activeTool;
    let uiColor = uiParams.selectedColor;
    var brushThickness = 1.0;
    if activeTool == 0 || activeTool == 2 || activeTool == 3 {
        brushThickness = uiParams.brushThickness;
    }

    // Highlight the pixel under the cursor 
    if activeTool != 5 && uiParams.mouseCellX >= 0.0 && uiParams.mouseCellY >= 0.0 {
        let brushCenterPx = vec2f(uiParams.mouseCellX, uiParams.mouseCellY) + vec2f(0.5);
        let radiusPx = max(brushThickness, 0.5);
        let dist = distance(snappedCenter, brushCenterPx);
        let fill = select(0.0, 1.0, dist < radiusPx);
        let alpha = fill * uiColor.a;

        if alpha > 0.0 {
            return vec4f(uiColor.rgb, alpha);
        }
    }

    // Line
    if activeTool == 3 &&
        uiParams.lineStartX >= 0.0 &&
        uiParams.lineStartY >= 0.0 &&
        uiParams.mouseCellX >= 0.0 &&
        uiParams.mouseCellY >= 0.0 {
        let lineStart = vec2f(uiParams.lineStartX, uiParams.lineStartY);
        let lineEnd = vec2f(uiParams.mouseCellX, uiParams.mouseCellY);
        let thickness = max(brushThickness, 0.5);
        let fill = lineMask(cell, lineStart, lineEnd, thickness);
        let alpha = fill * uiColor.a;

        if alpha > 0.0 {
            return vec4f(uiColor.rgb, alpha);
        }
    }

    let hasSelectionRect = uiParams.activeTool == 1 && uiParams.selectionRectX >= 0.0 &&
        uiParams.selectionRectY >= 0.0 &&
        uiParams.selectionRectW >= 0.0 &&
        uiParams.selectionRectH >= 0.0;

    // Paint rect
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
            return vec4f(uiColor.rgb, uiColor.a);
        }
    }

    return vec4f(0.0);
}
