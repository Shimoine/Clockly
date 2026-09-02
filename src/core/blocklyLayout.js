export function arrangeTopBlocks(workspace, {
  startX = 24,
  startY = 24,
  gap = 32,
  layout = "vertical",
  maxRowWidth = 900,
} = {}) {
  const topBlocks = workspace
    .getTopBlocks(false)
    .sort((a, b) => {
      const aPosition = a.getRelativeToSurfaceXY();
      const bPosition = b.getRelativeToSurfaceXY();
      return aPosition.y - bPosition.y || aPosition.x - bPosition.x;
    });

  let currentX = startX;
  let currentY = startY;
  let rowHeight = 0;

  topBlocks.forEach((block) => {
    const position = block.getRelativeToSurfaceXY();
    const size = block.getHeightWidth();

    if (layout === "grid") {
      // AIが複数の独立ブロックを返した場合、縦一列に積むと
      // 自動フィット時に全ブロックが極端に小さくなる。プレビューでは
      // 横方向にも並べ、見やすい比率を保つ。
      if (currentX > startX && currentX + size.width > maxRowWidth) {
        currentX = startX;
        currentY += rowHeight + gap;
        rowHeight = 0;
      }
      block.moveBy(currentX - position.x, currentY - position.y);
      currentX += size.width + gap;
      rowHeight = Math.max(rowHeight, size.height);
      return;
    }

    block.moveBy(startX - position.x, currentY - position.y);
    currentY += size.height + gap;
  });
}
