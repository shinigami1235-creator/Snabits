"""Test pictures drawn with PIL: plain scenes for ordinary scans, a flag or pattern for each colour egg, and cluttered photo-like pictures."""
import os, random, math
from PIL import Image, ImageDraw, ImageFilter
RED=(214,40,40); WHITE=(245,245,245); NAVY=(30,50,150); BLACK=(12,12,14); ORANGE=(240,138,36); YELLOW=(242,207,43); GREEN=(60,160,60); SILVER=(170,174,180); ICE=(110,214,208); PINK=(240,110,170)
W,H=390,844

def eagle():
    im=Image.new('RGB',(W,H),WHITE); d=ImageDraw.Draw(im); n=13
    for k in range(n):
        if k%2==0: d.rectangle([0,k*H/n,W,(k+1)*H/n],fill=RED)
    d.rectangle([0,0,W*0.42,H*0.36],fill=NAVY); return im
def vampire():
    im=Image.new('RGB',(W,H),BLACK); d=ImageDraw.Draw(im); d.ellipse([W*0.3,H*0.1,W*0.95,H*0.1+W*0.65],fill=WHITE); d.ellipse([W*0.2,H*0.6,W*0.2+150,H*0.6+160],fill=RED); return im
def phoenix():
    im=Image.new('RGB',(W,H),YELLOW); d=ImageDraw.Draw(im); d.rectangle([0,H/3,W,2*H/3],fill=ORANGE); d.rectangle([0,2*H/3,W,H],fill=RED); return im
def kitsune():
    im=Image.new('RGB',(W,H),WHITE); d=ImageDraw.Draw(im); r=W*0.26; d.ellipse([W/2-r,H/2-r,W/2+r,H/2+r],fill=RED); return im
def naga():
    im=Image.new('RGB',(W,H),YELLOW); d=ImageDraw.Draw(im); d.rectangle([0,H*0.2,W,H*0.8],fill=GREEN); return im
def yeti():
    im=Image.new('RGB',(W,H),WHITE); d=ImageDraw.Draw(im); d.rectangle([0,H*0.55,W,H*0.8],fill=SILVER); d.rectangle([W*0.1,H*0.84,W*0.6,H*0.92],fill=ICE); return im
def panda():
    im=Image.new('RGB',(W,H),WHITE); d=ImageDraw.Draw(im); d.rectangle([0,0,W/2,H],fill=BLACK); return im
def bee():
    im=Image.new('RGB',(W,H),YELLOW); d=ImageDraw.Draw(im); n=10
    for k in range(n):
        if k%2: d.rectangle([0,k*H/n,W,(k+1)*H/n],fill=BLACK)
    return im
def ladybug():
    im=Image.new('RGB',(W,H),RED); d=ImageDraw.Draw(im); rnd=random.Random(3)
    for k in range(14):
        x=rnd.uniform(0.05,0.95)*W; y=rnd.uniform(0.05,0.95)*H; r=42; d.ellipse([x-r,y-r,x+r,y+r],fill=BLACK)
    return im
def watermelon():
    im=Image.new('RGB',(W,H),GREEN); d=ImageDraw.Draw(im); d.ellipse([W*0.1,H*0.22,W*0.9,H*0.78],fill=RED); rnd=random.Random(5)
    for k in range(9):
        x=W*0.5+rnd.uniform(-0.25,0.25)*W; y=H*0.5+rnd.uniform(-0.18,0.18)*H; d.ellipse([x-9,y-13,x+9,y+13],fill=BLACK)
    return im
def candy():
    im=Image.new('RGB',(W,H),WHITE); d=ImageDraw.Draw(im); n=12
    for k in range(n):
        if k%2: d.rectangle([k*W/n,0,(k+1)*W/n,H],fill=RED)
    return im
EGGS={'Eagle':eagle,'Vampire':vampire,'Phoenix':phoenix,'Kitsune':kitsune,'Naga':naga,'Yeti':yeti,'Panda':panda,'Bee':bee,'Ladybug':ladybug,'Watermelon':watermelon,'Candy cane':candy}

def plain(seed):
    """an ordinary snapshot: a soft two-tone background with one object in it"""
    r=random.Random(seed); pal=[(200,70,50),(70,150,220),(90,170,80),(230,190,60),(150,90,200),(120,84,50),(235,235,235),(40,40,48),(240,130,180),(100,210,205),(240,140,40),(165,170,176)]
    a,b,c=r.sample(pal,3); im=Image.new('RGB',(W,H),a); d=ImageDraw.Draw(im); d.rectangle([0,H*r.uniform(0.5,0.75),W,H],fill=b)
    x=r.uniform(0.25,0.75)*W; y=r.uniform(0.3,0.7)*H; rr=r.uniform(60,120); d.ellipse([x-rr,y-rr,x+rr,y+rr],fill=c); return im.filter(ImageFilter.GaussianBlur(2))

def clutter(seed):
    """photo-like clutter: a gradient or flat backdrop, many shapes of random size and colour, some blur and noise.
    Colours lean towards what photos hold (browns, greys, greens, skin, sky) with some saturated objects."""
    r=random.Random(seed)
    def col():
        t=r.random()
        if t<0.45:   # muted: browns, greys, olive, skin, sky
            base=r.choice([(120,90,60),(150,150,150),(90,110,70),(210,170,140),(140,180,220),(60,60,65),(230,228,220),(180,150,110),(40,60,90)])
            return tuple(max(0,min(255,int(v+r.gauss(0,22)))) for v in base)
        h=r.random(); s=r.uniform(0.4,1); v=r.uniform(0.3,1); i=int(h*6); f=h*6-i; p=v*(1-s); q=v*(1-f*s); u=v*(1-(1-f)*s)
        R,G,B=[(v,u,p),(q,v,p),(p,v,u),(p,q,v),(u,p,v),(v,p,q)][i%6]; return (int(R*255),int(G*255),int(B*255))
    im=Image.new('RGB',(W,H),col()); d=ImageDraw.Draw(im)
    if r.random()<0.6:   # a sky/ground or wall/floor split
        y=H*r.uniform(0.3,0.75); d.rectangle([0,y,W,H],fill=col())
    for k in range(r.randint(3,28)):
        x=r.uniform(-0.1,1)*W; y=r.uniform(-0.1,1)*H; w=r.uniform(0.04,0.6)*W; h=r.uniform(0.03,0.45)*H; c=col(); t=r.random()
        if t<0.4: d.rectangle([x,y,x+w,y+h],fill=c)
        elif t<0.75: d.ellipse([x,y,x+w,y+h],fill=c)
        elif t<0.9: d.polygon([(x,y),(x+w,y+r.uniform(0,h)),(x+r.uniform(0,w),y+h)],fill=c)
        else: d.line([x,y,x+w,y+h],fill=c,width=r.randint(3,30))
    im=im.filter(ImageFilter.GaussianBlur(r.uniform(0,5)))
    if r.random()<0.5:
        px=im.load(); n=r.uniform(4,18)
        for j in range(0,H,2):
            for i in range(0,W,2):
                g=r.gauss(0,n); p=px[i,j]; px[i,j]=tuple(max(0,min(255,int(v+g))) for v in p)
    return im

def save_all(folder):
    os.makedirs(folder,exist_ok=True); out={}
    for k,f in EGGS.items(): p=os.path.join(folder,'egg-'+k.replace(' ','_')+'.png'); f().save(p); out[k]=p
    for s in range(6): p=os.path.join(folder,f'plain-{s}.png'); plain(s).save(p); out[f'plain{s}']=p
    return out
if __name__=='__main__': print(save_all('/tmp/snabits-audit-img'))
