#!/usr/bin/env python3
"""Assembles src/* + assets/* into one self-contained file: dist/jl-devs.html"""
import base64, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).parent
SRC, ASSETS, DIST = ROOT / "src", ROOT / "assets", ROOT / "dist"


def data_uri(path, mime):
    return f"data:{mime};base64," + base64.b64encode((ASSETS / path).read_bytes()).decode()


def main():
    fonts = json.loads((ROOT / "work" / "fonts.json").read_text())
    html = (SRC / "index.html").read_text(encoding="utf-8")
    css = (SRC / "styles.css").read_text(encoding="utf-8")
    js = (SRC / "app.js").read_text(encoding="utf-8")

    tokens = {
        "FONT_ADV_R": fonts["adv-r"],
        "FONT_ADV_B": fonts["adv-b"],
        "FONT_MONO_R": fonts["mono-r"],
        "FONT_MONO_B": fonts["mono-b"],
        "IMG_LOGO": data_uri("logo.webp", "image/webp"),
        "IMG_MAPS": data_uri("maps.png", "image/png"),
        "IMG_CUT": data_uri("logo-cut.webp", "image/webp"),
        "IMG_MARK": data_uri("logo-mark.webp", "image/webp"),
        "IMG_ICON": data_uri("icon.png", "image/png"),
    }
    shaders = {p.stem.upper(): p.read_text(encoding="utf-8") for p in SRC.glob("*.glsl")}
    for name, text in shaders.items():
        js = js.replace(f'"{{{{GLSL_{name}}}}}"', json.dumps(text))

    out = html.replace("/*{{CSS}}*/", css).replace("/*{{JS}}*/", js)
    for k, v in tokens.items():
        out = out.replace("{{" + k + "}}", v)

    left = sorted(set(re.findall(r"\{\{[A-Z_]+\}\}", out)))
    if left:
        sys.exit(f"unresolved tokens: {left}")
    DIST.mkdir(exist_ok=True)
    target = DIST / "jl-devs.html"
    target.write_text(out, encoding="utf-8")
    print(f"built {target} ({target.stat().st_size/1024:.0f} KB)")

    # checkout: página própria, com as mesmas fontes
    ck = (SRC / "checkout.html").read_text(encoding="utf-8")
    for k, v in tokens.items():
        ck = ck.replace("{{" + k + "}}", v)
    (DIST / "checkout.html").write_text(ck, encoding="utf-8")
    public = ROOT.parents[1] / "public"
    if public.is_dir():
        (public / "checkout").mkdir(exist_ok=True)
        (public / "checkout" / "index.html").write_text(ck, encoding="utf-8")
        print("checkout copied")

    # dentro do repositório do site: esta página é a home (public/index.html)
    public = ROOT.parents[1] / "public"
    if public.is_dir():
        served = public / "index.html"
        served.write_text(out, encoding="utf-8")
        print(f"copied to {served}")


if __name__ == "__main__":
    main()
