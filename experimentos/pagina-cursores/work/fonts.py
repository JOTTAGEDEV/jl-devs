import base64, io, json, sys
from fontTools.ttLib import TTFont
from fontTools import subset
TG = '/usr/share/texmf/fonts/opentype/public/tex-gyre/'
SRC = {
 'adv-b': TG+'texgyreadventor-bold.otf',
 'adv-r': TG+'texgyreadventor-regular.otf',
 'mono-r': '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',
 'mono-b': '/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf',
}
latin = ''.join(chr(c) for c in range(0x20,0x7F)) + ''.join(chr(c) for c in range(0xA0,0x100)) + '“”‘’…–—•·×✓→↓↗←↑€™©®°ºª‹›«»−≈≠±'
mono_extra = '─│┌┐└┘├┤┬┴┼═▌█░▒▓●○◆◇▲▼▶◀✔✕⌘⇧'
out = {}
for key, path in SRC.items():
    f = TTFont(path)
    cmap = f.getBestCmap()
    want = latin + (mono_extra if key.startswith('mono') else '')
    have = [ch for ch in want if ord(ch) in cmap]
    miss = [ch for ch in want if ord(ch) not in cmap and ord(ch) > 0x7F]
    print(key, 'missing:', ''.join(miss))
    opts = subset.Options(); opts.flavor = 'woff'; opts.layout_features = ['kern','liga','calt','ccmp','locl','mark','mkmk','tnum','case']; opts.name_IDs=[1,2]; opts.notdef_outline=True; opts.desubroutinize=True; opts.hinting = False
    ss = subset.Subsetter(opts); ss.populate(text=''.join(have)); ss.subset(f)
    buf = io.BytesIO(); f.flavor='woff'; f.save(buf)
    b = buf.getvalue(); out[key] = base64.b64encode(b).decode()
    print('  ', key, len(b)//1024, 'KB woff')
json.dump(out, open('work/fonts.json','w'))
