import os
import sys

# Ensure pillow is installed to handle image generation
try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Installing pillow image library...")
    import subprocess
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
        from PIL import Image, ImageDraw
    except Exception as e:
        print(f"Failed to install pillow via pip: {e}")
        sys.exit(1)

def make_icon(size, filename):
    # Create image with deep obsidian/emerald dark background (#0A0A0C)
    image = Image.new("RGBA", (size, size), (10, 10, 12, 255))
    draw = ImageDraw.Draw(image)
    
    center = size // 2
    
    # Draw soft emerald glow in the background
    glow_radius = int(size * 0.4)
    for r in range(glow_radius, glow_radius - int(size * 0.2), -1):
        alpha = int((glow_radius - r) * (180 / (size * 0.2)))
        # Emerald glow: rgba(16, 185, 129, alpha)
        draw.ellipse([center - r, center - r, center + r, center + r], 
                     outline=(16, 185, 129, max(0, min(int(alpha), 40))))
                     
    # Gold color for the modern geometric logo (#D4AF37)
    gold_color = (212, 175, 55, 255)
    line_width = max(3, int(size * 0.06)) # Nice thick lines
    
    # Coordinates of modern geometric 'A' logo
    # Left diagonal leg
    x1, y1 = center - int(size * 0.16), center + int(size * 0.18)
    x2, y2 = center, center - int(size * 0.18)
    # Right diagonal leg
    x3, y3 = center + int(size * 0.16), center + int(size * 0.18)
    
    # Horizontal crossbar (slightly lowered for aesthetics)
    cx1, cy1 = center - int(size * 0.09), center + int(size * 0.06)
    cx2, cy2 = center + int(size * 0.09), center + int(size * 0.06)
    
    # Draw the abstract geometric 'A' using lines with rounded joint aesthetics
    draw.line([(x1, y1), (x2, y2)], fill=gold_color, width=line_width, joint="round")
    draw.line([(x2, y2), (x3, y3)], fill=gold_color, width=line_width, joint="round")
    draw.line([(cx1, cy1), (cx2, cy2)], fill=gold_color, width=line_width, joint="round")
              
    # Ensure icons folder exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    image.save(filename, "PNG")
    print(f"Successfully generated PWA Icon: {filename} ({size}x{size})")

if __name__ == "__main__":
    print("Generating modern AuraCraft PWA icons...")
    make_icon(192, "icons/icon-192.png")
    make_icon(512, "icons/icon-512.png")
    make_icon(180, "icons/apple-touch-icon.png")
    make_icon(32, "icons/favicon-32x32.png")
    make_icon(16, "icons/favicon-16x16.png")
    print("All PWA icons generated successfully.")
