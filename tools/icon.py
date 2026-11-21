"""Turns the supplied Comfort logo into every icon resource the app ships.

Run it after changing the artwork:

    python3 tools/icon.py

Source of truth: `app/icon-src/comfort-logo.png`, the artwork Akhil supplied.
Nothing here redraws it. The mark is lifted out of the plate by luminance,
cropped to its own bounds and re-centred, then composited onto the plate sizes
the launcher asks for. The source file is only ever read, never written.

Why the mark is lifted rather than the image resized: an adaptive icon is 108
units wide, but the launcher shows 72 of them and guarantees only the middle 66.
Resizing the image leaves the mark's ends outside that window on a round mask,
which is what the old artwork did. Sizing by the mark keeps it whole under every
mask.

The legacy icons are full-bleed (rounded square) and circular plates, so a
launcher that masks its legacy icons cuts into flat colour instead of into the
mark, and one that does not still gets a finished shape.
"""

from PIL import Image, ImageDraw
import os

SOURCE = "app/icon-src/comfort-logo.png"
RES = "app/src/main/res"

DENSITIES = {"mdpi": 1.0, "hdpi": 1.5, "xhdpi": 2.0, "xxhdpi": 3.0, "xxxhdpi": 4.0}

LEGACY_DP = 48
FOREGROUND_DP = 108
APP_MARK_DP = 24

# The mark as a fraction of the canvas. 0.56 of 108 is 60.5 units, comfortably
# inside the 66-unit safe window, so no mask can clip the mark's ends.
MARK_ON_PLATE = 0.56
MARK_ON_FOREGROUND = 0.56


def plate_colour(logo):
    """The artwork's own backdrop, sampled away from the mark.

    The supplied logo is the mark on a flat plate, so a corner is the plate —
    the mark never reaches it. Taken as the median of a small patch so a stray
    pixel cannot shift the adaptive background away from the legacy icons.
    """
    rgb = logo.convert("RGB")
    patch = [rgb.getpixel((x, y)) for y in range(8) for x in range(8)]
    channels = list(zip(*patch))
    return tuple(sorted(c)[len(c) // 2] for c in channels)


def mark_layer(logo):
    """The white mark alone, transparent everywhere else.

    The plate is near-black and the mark near-white, so luminance is already
    the alpha the mark needs; the ramp between them keeps the artwork's own
    antialiasing instead of the hard edge a threshold would leave.
    """
    luma = logo.convert("RGB").convert("L")
    alpha = luma.point(lambda v: 0 if v <= 48 else (255 if v >= 200 else round((v - 48) * 255 / 152)))
    out = Image.new("RGBA", logo.size, (255, 255, 255, 0))
    out.putalpha(alpha)

    bounds = alpha.point(lambda v: 255 if v > 10 else 0).getbbox()
    if bounds is None:  # a blank source is a mistake worth stopping on
        raise SystemExit(f"{SOURCE}: no mark found — is the artwork transparent?")
    return out.crop(bounds)


def place(canvas, mark, width):
    scaled = mark.resize(
        (max(1, round(width)), max(1, round(width * mark.height / mark.width))),
        Image.LANCZOS,
    )
    canvas.alpha_composite(
        scaled,
        ((canvas.width - scaled.width) // 2, (canvas.height - scaled.height) // 2),
    )


def plate(size, colour, mark, round_shape):
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    box = (0, 0, size - 1, size - 1)
    if round_shape:
        draw.ellipse(box, fill=colour + (255,))
    else:
        draw.rounded_rectangle(box, radius=round(size * 0.22), fill=colour + (255,))
    place(canvas, mark, size * MARK_ON_PLATE)
    return canvas


def save(image, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    image.save(path, "PNG", optimize=True)
    print(f"{path}  {image.width}x{image.height}")


def main():
    logo = Image.open(SOURCE).convert("RGBA")
    colour = plate_colour(logo)
    mark = mark_layer(logo)
    print(f"plate #{colour[0]:02X}{colour[1]:02X}{colour[2]:02X}, mark {mark.width}x{mark.height}")

    for density, scale in DENSITIES.items():
        legacy = round(LEGACY_DP * scale)
        save(plate(legacy, colour, mark, round_shape=False), f"{RES}/mipmap-{density}/ic_launcher.png")
        save(plate(legacy, colour, mark, round_shape=True), f"{RES}/mipmap-{density}/ic_launcher_round.png")

        # The adaptive background is the plate extended to the edges: whatever
        # mask the launcher applies then cuts into flat colour.
        background = Image.new("RGBA", (round(FOREGROUND_DP * scale),) * 2, colour + (255,))
        save(background, f"{RES}/mipmap-{density}/ic_launcher_background.png")

        foreground = Image.new("RGBA", (round(FOREGROUND_DP * scale),) * 2, (0, 0, 0, 0))
        place(foreground, mark, foreground.width * MARK_ON_FOREGROUND)
        save(foreground, f"{RES}/mipmap-{density}/ic_launcher_foreground.png")

        # The in-app mark and the notification silhouette: the mark alone, no
        # plate. Both are drawn inside something the app already plates.
        sized = round(APP_MARK_DP * scale)
        app_mark = Image.new("RGBA", (sized, sized), (0, 0, 0, 0))
        place(app_mark, mark, sized)
        save(app_mark, f"{RES}/drawable-{density}/ic_app_mark.png")

        notification = Image.new("RGBA", (sized, sized), (0, 0, 0, 0))
        place(notification, mark, sized * 0.94)
        save(notification, f"{RES}/drawable-{density}/ic_notification.png")

        # The themed icon is one flat colour read from alpha alone.
        monochrome = Image.new("RGBA", (round(FOREGROUND_DP * scale),) * 2, (0, 0, 0, 0))
        place(monochrome, mark, monochrome.width * MARK_ON_FOREGROUND)
        save(monochrome, f"{RES}/drawable-{density}/ic_launcher_monochrome.png")

    print(f"\nic_launcher_background: #{colour[0]:02X}{colour[1]:02X}{colour[2]:02X}")


if __name__ == "__main__":
    main()
