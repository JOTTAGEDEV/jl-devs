import numpy as np, cv2, json
from PIL import Image
from scipy import ndimage as ndi

src = Image.open('work/logo-src.png').convert('RGB')
a = np.asarray(src).astype(np.float32)/255.0
H, W, _ = a.shape
gb = a[...,1]-a[...,2]
core = (gb > 0.30); core[960:,:] = False
lab, n = ndi.label(core)
sizes = ndi.sum(core, lab, range(1,n+1))
comps = [i for i,s in enumerate(sizes, start=1) if s > 3000]
comp_masks = [ndi.binary_fill_holes(lab==i) for i in comps]
# identify by x-centroid: J (left), L (middle), dot (right)
cents = [ndi.center_of_mass(m)[1] for m in comp_masks]
order = np.argsort(cents)
J, L, D = [comp_masks[i] for i in order]
yy, xx = np.mgrid[0:H,0:W]

def fit_circle(pts):
    x = pts[:,0]; y = pts[:,1]
    A = np.c_[2*x, 2*y, np.ones_like(x)]; b = x*x+y*y
    cx, cy, c = np.linalg.lstsq(A, b, rcond=None)[0]
    return cx, cy, np.sqrt(c+cx*cx+cy*cy)

# --- J: outer bowl circle from left boundary (y 720..890) and right boundary (y 760..890)
pts=[]
for y in range(720, 891, 2):
    row = np.where(J[y])[0]
    pts.append((row.min(), y))
    if y >= 760: pts.append((row.max(), y))
cxJ, cyJ, rJ = fit_circle(np.array(pts, float))
print('J circle', round(cxJ,1), round(cyJ,1), round(rJ,1), 'bottom', round(cyJ+rJ,1))
Jc = J & ~((yy > 880) & ((xx-cxJ)**2 + (yy-cyJ)**2 > rJ**2)) & (yy <= 930)
# --- L: cut at the contact line
Lc = L & (yy <= 926)
# --- dot: circle fit from boundary above the contact
pts=[]
rows = np.where(D.any(1))[0]
for y in range(rows.min()+2, 912, 2):
    row = np.where(D[y])[0]; pts += [(row.min(), y), (row.max(), y)]
cxD, cyD, rD = fit_circle(np.array(pts, float))
print('dot circle', round(cxD,1), round(cyD,1), round(rD,1), 'bottom', round(cyD+rD,1))
Dc = ((xx-cxD)**2 + (yy-cyD)**2 <= (rD+1.5)**2) & (yy <= 922)
mask = Jc | Lc | Dc
ys,xs = np.where(mask); bbox = (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))
print('letters bbox', bbox)

# --- smooth the binary edge a little, then signed distance (px, + inside)
# regularise the contour: close small bites left by white rim highlights, then smooth
k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17,17))
closed = cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_CLOSE, k)
closed = cv2.morphologyEx(closed, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9,9)))
soft = cv2.GaussianBlur(closed.astype(np.float32), (0,0), 3.2)
m2 = soft > 0.5
m2 &= ~((yy > 931))
din = ndi.distance_transform_edt(m2); dout = ndi.distance_transform_edt(~m2)
sd = (din - dout).astype(np.float32)
sd = cv2.GaussianBlur(sd, (0,0), 1.0)

R_SDF = 80.0
sdf_n = np.clip(0.5 + sd/(2*R_SDF), 0, 1)
# pillow height: bevel over ~46px, flat-ish centre, smoothed
bev = np.clip(sd/46.0, 0, 1)
height = np.sqrt(np.clip(1-(1-bev)**2, 0, 1))
height = cv2.GaussianBlur(height.astype(np.float32), (0,0), 5.0)
glow = cv2.GaussianBlur(m2.astype(np.float32), (0,0), 46.0)
maps = np.dstack([sdf_n, height, glow])
maps512 = cv2.resize(maps, (512,512), interpolation=cv2.INTER_AREA)
Image.fromarray((np.clip(maps512,0,1)*255+0.5).astype(np.uint8)).save('assets/maps.png', optimize=True)

# --- studio image for the hero, 1024 webp
src.resize((1024,1024), Image.LANCZOS).save('assets/logo.webp', quality=93, method=6)

# --- transparent cut-out with decontaminated edges
alpha = np.clip(0.5 + (sd-0.6)/1.6, 0, 1)
inner = sd > 2.5
idx = ndi.distance_transform_edt(~inner, return_distances=False, return_indices=True)
filled_rgb = a[idx[0], idx[1]]
rgb = np.where((sd > 2.5)[...,None], a, filled_rgb)
rgba = np.dstack([rgb, alpha])
pad = 26
x0,y0,x1,y1 = bbox; x0-=pad; y0-=pad; x1+=pad; y1+=pad
cut = (np.clip(rgba[y0:y1+1, x0:x1+1],0,1)*255+0.5).astype(np.uint8)
cutim = Image.fromarray(cut, 'RGBA')
scale = 760/cutim.width
cutim = cutim.resize((760, round(cutim.height*scale)), Image.LANCZOS)
cutim.save('assets/logo-cut.webp', quality=92, method=6, alpha_quality=100)
small = cutim.resize((176, round(cutim.height*176/760)), Image.LANCZOS); small.save('assets/logo-mark.webp', quality=92, method=6, alpha_quality=100)

# previews of the cut-out on black / lime / white
for name,bgc in (('black',(0,0,0)),('lime',(143,238,31)),('white',(255,255,255))):
    bg = Image.new('RGBA', (cutim.width+80, cutim.height+80), bgc+(255,)); bg.alpha_composite(cutim, (40,40)); bg.convert('RGB').save(f'work/cut_{name}.png')
Image.fromarray((np.clip(maps512,0,1)*255).astype(np.uint8)).save('work/maps_preview.png')

# background samples for the procedural studio
def avg(x0,y0,x1,y1): return [round(float(v)*255,1) for v in a[y0:y1,x0:x1].reshape(-1,3).mean(0)]
meta = {'size': W, 'bbox': bbox, 'cut_size': cutim.size, 'cut_pad': pad,
        'floor_y': 927, 'stem_L': None,
        'bg': {'tl':avg(0,0,60,60),'t':avg(W//2-30,0,W//2+30,60),'tr':avg(W-60,0,W,60),'l':avg(0,H//2-30,60,H//2+30),'r':avg(W-60,H//2-30,W,H//2+30),'bl':avg(0,H-60,60,H),'b':avg(W//2-30,H-60,W//2+30,H),'br':avg(W-60,H-60,W,H)},
        'lime_core': avg(500,640,540,720), 'lime_deep': avg(470,872,500,886)}
# L stem horizontal extent at y=560 (dive target)
row = np.where(Lc[560])[0]; meta['stem_L'] = [int(row.min()), int(row.max())]
row = np.where(Jc[560])[0]; meta['stem_J'] = [int(row.min()), int(row.max())]
json.dump(meta, open('work/meta.json','w'), indent=1); print(json.dumps(meta))
import os
for f in ('assets/logo.webp','assets/maps.png','assets/logo-cut.webp','assets/logo-mark.webp'): print(f, os.path.getsize(f)//1024, 'KB')
