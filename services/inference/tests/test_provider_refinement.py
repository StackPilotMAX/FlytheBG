from PIL import Image, ImageDraw

from app.provider import _precision_refine_mask


def test_precision_refinement_preserves_thin_soft_boundary():
    image = Image.new("RGB", (64, 64), "white")
    draw = ImageDraw.Draw(image)
    draw.rectangle((20, 10, 44, 58), fill=(28, 42, 65))
    draw.line((18, 10, 18, 30), fill=(28, 42, 65), width=1)

    mask = Image.new("L", image.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rectangle((20, 10, 44, 58), fill=255)
    mask_draw.line((18, 10, 18, 30), fill=80, width=1)

    refined = _precision_refine_mask(image, mask)

    assert refined.mode == "L"
    assert refined.size == image.size
    assert refined.getpixel((18, 20)) > 0
    assert refined.getpixel((0, 0)) == 0
    assert refined.getpixel((30, 30)) == 255
