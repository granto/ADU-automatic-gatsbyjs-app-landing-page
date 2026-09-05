// Optional macOS-only source for the checked-in social-card.png.
// The ordinary website build never requires Swift or AppKit.
import AppKit
let width = 1200, height = 630
let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
func color(_ r: CGFloat, _ g: CGFloat, _ b: CGFloat) -> NSColor { NSColor(srgbRed:r/255,green:g/255,blue:b/255,alpha:1) }
let cream=color(248,245,237), forest=color(7,85,58), mint=color(45,218,162), ink=color(24,26,24)
cream.setFill(); NSRect(x:0,y:0,width:width,height:height).fill()
func text(_ value: String, _ x: CGFloat, _ y: CGFloat, _ size: CGFloat, _ color: NSColor, _ weight: NSFont.Weight = .regular) {
  (value as NSString).draw(at:NSPoint(x:x,y:y),withAttributes:[.font:NSFont.systemFont(ofSize:size,weight:weight),.foregroundColor:color])
}
text("ADU",70,514,42,ink,.bold);text("roi.",160,514,42,forest,.medium)
text("MAKE THE ADU DECISION CLEARER",72,452,17,forest,.semibold)
text("See what an ADU",68,337,67,ink,.semibold)
text("could change.",68,253,67,forest,.semibold)
text("A clearer view of monthly cash flow.",72,176,27,ink)
mint.setFill(); NSBezierPath(roundedRect:NSRect(x:72,y:76,width:269,height:48),xRadius:24,yRadius:24).fill()
text("Start an evaluation",95,90,19,forest,.semibold)
forest.setFill(); NSBezierPath(roundedRect:NSRect(x:925,y:156,width:165,height:310),xRadius:26,yRadius:26).fill()
mint.setStroke(); let path=NSBezierPath();path.lineWidth=12;path.move(to:NSPoint(x:960,y:295));path.line(to:NSPoint(x:1013,y:349));path.line(to:NSPoint(x:1065,y:295));path.stroke()
mint.setFill();NSRect(x:975,y:222,width:18,height:68).fill();NSRect(x:1034,y:222,width:18,height:68).fill()
NSGraphicsContext.restoreGraphicsState()
let output=CommandLine.arguments.count>1 ? CommandLine.arguments[1] : "static/social-card.png"
try bitmap.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:output))
print("Generated \(output): \(width)x\(height)")
