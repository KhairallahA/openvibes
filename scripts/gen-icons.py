# Generates real PNG/ICO icons from the brand mark (lime rounded square + dark "V" chevron).
# Usage: python3 scripts/gen-icons.py   (requires Pillow)
from PIL import Image, ImageDraw
import os
LIME=(198,255,61,255); INK=(11,11,13,255)
def mark(size, maskable=False):
    S=size*8
    im=Image.new('RGBA',(S,S),(0,0,0,0)); d=ImageDraw.Draw(im)
    if maskable:
        d.rectangle([0,0,S,S],fill=LIME); scale=0.62
    else:
        d.rounded_rectangle([0,0,S-1,S-1],radius=int(S*0.25),fill=LIME); scale=0.8
    c=S/2; w=S*0.47*scale/0.8; h=S*0.34*scale/0.8
    pts=[(c-w/2,c-h/2),(c,c+h/2),(c+w/2,c-h/2)]
    lw=int(S*0.11*scale/0.8)
    d.line(pts,fill=INK,width=lw,joint='curve')
    for x,y in [pts[0],pts[2],pts[1]]:
        d.ellipse([x-lw/2,y-lw/2,x+lw/2,y+lw/2],fill=INK)
    return im.resize((size,size),Image.LANCZOS)
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app=os.path.join(root,'src/app'); pub=os.path.join(root,'public'); os.makedirs(pub,exist_ok=True)
mark(512).save(os.path.join(app,'icon.png'))
ap=Image.new('RGBA',(180,180),LIME); ap.alpha_composite(mark(180,maskable=True)); ap.convert('RGB').save(os.path.join(app,'apple-icon.png'))
mark(256).save(os.path.join(app,'favicon.ico'),sizes=[(16,16),(32,32),(48,48),(64,64)])
mark(192).save(os.path.join(pub,'icon-192.png'))
mark(512).save(os.path.join(pub,'icon-512.png'))
mark(512,maskable=True).save(os.path.join(pub,'icon-maskable-512.png'))
print('icons written')
