import os
import sys

# Ensure pillow is installed to handle image generation
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Installing pillow image library...")
    import subprocess
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
        from PIL import Image, ImageDraw, ImageFont
    except Exception as e:
        print(f"Failed to install pillow via pip: {e}")
        print("Falling back to basic file creation or web agent support if required.")
        sys.exit(1)

def make_icon(size, filename):
    # Create image with deep obsidian/emerald dark background (#0A0A0C)
    image = Image.new("RGBA", (size, size), (10, 10, 12, 255))
    draw = ImageDraw.Draw(image)
    
    center = size // 2
    
    # Draw soft emerald glow in the background
    glow_radius = int(size * 0.45)
    for r in range(glow_radius, glow_radius - int(size * 0.15), -1):
        alpha = int((glow_radius - r) * (200 / (size * 0.15)))
        # Emerald glow: rgba(16, 185, 129, alpha)
        draw.ellipse([center - r, center - r, center + r, center + r], 
                     outline=(16, 185, 129, max(0, min(int(alpha), 80))))
                     
    # Draw thin gold border ring
    circle_radius = int(size * 0.38)
    gold_color = (212, 175, 55, 255) # #D4AF37
    border_width = max(1, int(size * 0.025))
    draw.ellipse([center - circle_radius, center - circle_radius, 
                  center + circle_radius, center + circle_radius], 
                 outline=gold_color, width=border_width)
                 
    # Draw a stylized serif 'A' for AuraCraft
    try:
        # Try loading a common serif font or Arial
        font_paths = ["georgiab.ttf", "georgia.ttf", "times.ttf", "arial.ttf"]
        font = None
        for path in font_paths:
            try:
                font = ImageFont.truetype(path, int(size * 0.45))
                break
            except IOError:
                continue
        if font is None:
            font = ImageFont.load_default()
    except Exception:
        font = ImageFont.load_default()
        
    text = "A"
    
    # Calculate text positioning
    try:
        # Pillow 10+ textbbox
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        x = center - text_w // 2 - bbox[0]
        y = center - text_h // 2 - bbox[1] - int(size * 0.03)
    except AttributeError:
        # Fallback for older PIL versions
        if hasattr(draw, "textsize"):
            text_w, text_h = draw.textsize(text, font=font)
        else:
            text_w, text_h = int(size * 0.3), int(size * 0.3)
        x = center - text_w // 2
        y = center - text_h // 2 - int(size * 0.05)
        
    # Draw the monogram text in Gold
    draw.text((x, y), text, fill=gold_color, font=font)
              
    # Ensure icons folder exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    image.save(filename, "PNG")
    print(f"Successfully generated PWA Icon: {filename} ({size}x{size})")

if __name__ == "__main__":
    print("Generating AuraCraft PWA icons...")
    make_icon(192, "icons/icon-192.png")
    make_icon(512, "icons/icon-512.png")
    make_icon(180, "icons/apple-touch-icon.png")
    make_icon(32, "icons/favicon-32x32.png")
    make_icon(16, "icons/favicon-16x16.png")
    print("All PWA icons generated successfully.")
