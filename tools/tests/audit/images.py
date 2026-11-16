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
def tiger():
    im=Image.new('RGB',(W,H),ORANGE); d=ImageDraw.Draw(im); n=10
    for k in range(n):
        if k%2: d.rectangle([0,k*H/n,W,k*H/n+H/n*0.6],fill=BLACK)
    return im
def zebra():
    im=Image.new('RGB',(W,H),WHITE); d=ImageDraw.Draw(im); n=10
    for k in range(n):
        if k%2: d.rectangle([k*W/n,0,(k+1)*W/n,H],fill=BLACK)
    return im
def cow():
    im=Image.new('RGB',(W,H),WHITE); d=ImageDraw.Draw(im)
    for x,y,rx,ry in [(0.15,0.15,0.2,0.08),(0.8,0.4,0.18,0.09),(0.3,0.7,0.22,0.08),(0.75,0.85,0.15,0.06)]: d.ellipse([W*(x-rx),H*(y-ry),W*(x+rx),H*(y+ry)],fill=BLACK)
    return im
def penguin():
    im=Image.new('RGB',(W,H),BLACK); d=ImageDraw.Draw(im); d.ellipse([W*0.2,H*0.3,W*0.8,H*0.85],fill=WHITE); d.polygon([(W*0.42,H*0.25),(W*0.58,H*0.25),(W*0.5,H*0.31)],fill=ORANGE); d.rectangle([W*0.25,H*0.9,W*0.75,H*0.95],fill=ORANGE); return im
def strawberry():
    im=Image.new('RGB',(W,H),RED); d=ImageDraw.Draw(im); d.rectangle([0,0,W,H*0.14],fill=GREEN); rnd=random.Random(7)
    for k in range(40):
        x=rnd.uniform(0.05,0.95)*W; y=rnd.uniform(0.2,0.95)*H; d.ellipse([x-6,y-9,x+6,y+9],fill=YELLOW)
    return im
def duck():
    im=Image.new('RGB',(W,H),YELLOW); d=ImageDraw.Draw(im); d.ellipse([W*0.35,H*0.3,W*0.75,H*0.38],fill=ORANGE); return im
def clownfish():
    im=Image.new('RGB',(W,H),ORANGE); d=ImageDraw.Draw(im)
    for f in (0.2,0.5,0.8): d.rectangle([W*(f-0.06),0,W*(f+0.06),H],fill=WHITE); d.rectangle([W*(f-0.075),0,W*(f-0.06),H],fill=BLACK); d.rectangle([W*(f+0.06),0,W*(f+0.075),H],fill=BLACK)
    return im
# the specials of 16 Nov 2026, drawn like their Pattern Stones
BROWN=(132,88,48); TEAL=(80,196,196)
def tengu():
    im=Image.new('RGB',(W,H),RED); d=ImageDraw.Draw(im); d.polygon([(W*0.1,H*0.27),(W*0.95,H*0.42),(W*0.1,H*0.57)],fill=WHITE)
    for a in (-0.5,0,0.5): cx,cy=W*0.25,H*0.92; d.polygon([(cx,cy),(cx+math.sin(a)*W*0.14-38,cy-math.cos(a)*H*0.24),(cx+math.sin(a)*W*0.14+38,cy-math.cos(a)*H*0.24)],fill=GREEN)
    return im
def tanuki():
    im=Image.new('RGB',(W,H),BROWN); d=ImageDraw.Draw(im); d.rectangle([0,H*0.4,W,H*0.62],fill=BLACK)
    for f in (0.28,0.72): d.ellipse([W*f-38,H*0.52-38,W*f+38,H*0.52+38],fill=BROWN)
    d.ellipse([W*0.42,H*0.05,W*0.66,H*0.27],fill=GREEN); return im
def mermaid():
    im=Image.new('RGB',(W,H),TEAL); d=ImageDraw.Draw(im); d.polygon([(W*0.5,H*0.42),(W*0.05,H*0.04),(W*0.5,H*0.2),(W*0.95,H*0.04)],fill=PINK)
    for r in range(4):
        for k in range(-3,4): x=W*(0.5+k*0.2+(r%2)*0.1); y=H*(0.55+r*0.12); d.arc([x-38,y-38,x+38,y+38],10,170,fill=(200,240,236),width=5)
    return im
def diwata():
    im=Image.new('RGB',(W,H),PINK); d=ImageDraw.Draw(im)
    for sx in (-1,1): d.ellipse([W*(0.5+sx*0.23)-62,H*0.36-100,W*(0.5+sx*0.23)+62,H*0.36+100],fill=GREEN); d.ellipse([W*(0.5+sx*0.18)-46,H*0.67-62,W*(0.5+sx*0.18)+46,H*0.67+62],fill=GREEN)
    d.ellipse([W*0.5-34,H*0.5-34,W*0.5+34,H*0.5+34],fill=YELLOW); return im
def sphinx():
    im=Image.new('RGB',(W,H),(236,196,60)); d=ImageDraw.Draw(im)
    for k in range(6):
        y=H*(0.07+k*0.11); d.rectangle([0,y,W,y+H*0.055],fill=NAVY)
    d.rectangle([W*0.3,H*0.3,W*0.7,H*0.68],fill=(236,196,60)); d.ellipse([W*0.5-30,H*0.8-30,W*0.5+30,H*0.8+30],fill=RED); return im
def garuda():
    im=Image.new('RGB',(W,H),YELLOW); d=ImageDraw.Draw(im)
    for sx in (-1,1): d.polygon([(W*0.5,H*0.58),(W*(0.5+sx*0.5),0),(W*(0.5+sx*0.5),H*0.24),(W*(0.5+sx*0.1),H*0.72)],fill=RED)
    d.polygon([(W*0.5,H*0.58),(W*0.6,H*0.68),(W*0.5,H*0.8),(W*0.4,H*0.68)],fill=NAVY); return im
def werewolf():
    im=Image.new('RGB',(W,H),(150,154,160)); d=ImageDraw.Draw(im); d.ellipse([W*0.45,H*0.1,W*0.9,H*0.1+W*0.45],fill=WHITE)
    for k in (-1,0,1): d.line([(W*(0.2+k*0.17),H*0.55),(W*(0.45+k*0.17),H*0.9)],fill=BLACK,width=26)
    return im
def minotaur():
    im=Image.new('RGB',(W,H),BROWN); d=ImageDraw.Draw(im)
    for sx in (-1,1): d.polygon([(W*(0.5+sx*0.1),H*0.27),(W*(0.5+sx*0.42),H*0.24),(W*(0.5+sx*0.38),H*0.05),(W*(0.5+sx*0.28),H*0.2),(W*(0.5+sx*0.1),H*0.2)],fill=WHITE)
    d.ellipse([W*0.28,H*0.48,W*0.72,H*0.48+W*0.44],outline=(186,190,196),width=34); return im
def dragon():
    im=Image.new('RGB',(W,H),GREEN); d=ImageDraw.Draw(im); d.polygon([(W*0.5,H*0.03),(W*0.72,H*0.24),(W*0.64,H*0.38),(W*0.36,H*0.38),(W*0.28,H*0.24)],fill=ORANGE)
    for r in range(4):
        for k in range(-3,4): x=W*(0.5+k*0.2+(r%2)*0.1); y=H*(0.55+r*0.12); d.arc([x-38,y-38,x+38,y+38],10,170,fill=(36,100,40),width=5)
    return im
def thunderbird():
    im=Image.new('RGB',(W,H),(44,98,200)); d=ImageDraw.Draw(im); pts=[(W*k/10,H*(0.36 if k%2 else 0.44)) for k in range(11)]
    d.line(pts,fill=YELLOW,width=34); d.polygon([(W*0.44,H*0.52),(W*0.56,H*0.52),(W*0.5,H*0.8)],fill=YELLOW); return im
def hydra():
    im=Image.new('RGB',(W,H),(130,70,200)); d=ImageDraw.Draw(im)
    d.ellipse([W*0.3,H*0.85,W*0.7,H*0.97],fill=GREEN)
    for k in (-1,0,1): d.line([(W*0.5,H*0.9),(W*(0.5+k*0.3),H*0.7),(W*(0.5+k*0.3),H*0.2)],fill=GREEN,width=40,joint='curve'); d.ellipse([W*(0.5+k*0.3)-40,H*0.2-34,W*(0.5+k*0.3)+40,H*0.2+34],fill=GREEN)
    return im
def griffin():
    im=Image.new('RGB',(W,H),ORANGE); d=ImageDraw.Draw(im); d.rectangle([0,0,W,H*0.24],fill=WHITE); d.polygon([(W*0.38,H*0.24),(W*0.62,H*0.24),(W*0.5,H*0.4)],fill=YELLOW); return im
def kirin():
    im=Image.new('RGB',(W,H),ICE); d=ImageDraw.Draw(im)
    for r in range(5):
        for k in range(-3,4): x=W*(0.5+k*0.2+(r%2)*0.1); y=H*(0.08+r*0.12); d.arc([x-38,y-38,x+38,y+38],10,170,fill=(40,140,150),width=6)
    for k in range(4): x=W*(0.125+k*0.25); d.polygon([(x-W*0.12,H),(x,H*0.7),(x+W*0.12,H)],fill=ORANGE)
    return im
def salamander():
    im=Image.new('RGB',(W,H),BLACK); d=ImageDraw.Draw(im)
    for x,y in [(0.25,0.15),(0.6,0.25),(0.3,0.45),(0.75,0.5),(0.2,0.75),(0.55,0.7),(0.8,0.85),(0.45,0.9)]: d.ellipse([W*x-30,H*y-30,W*x+30,H*y+30],fill=ORANGE)
    d.polygon([(W*0.85,H*0.08),(W*0.92,H*0.2),(W*0.78,H*0.2)],fill=YELLOW); return im
def bakunawa():
    im=Image.new('RGB',(W,H),NAVY); d=ImageDraw.Draw(im); d.ellipse([W*0.15,H*0.1,W*0.55,H*0.1+W*0.4],fill=WHITE)
    d.line([(W*0.1,H*0.9),(W*0.35,H*0.72),(W*0.6,H*0.85),(W*0.85,H*0.62),(W*0.7,H*0.5)],fill=ICE,width=40,joint='curve'); return im
def cerberus():
    im=Image.new('RGB',(W,H),BLACK); d=ImageDraw.Draw(im); d.rectangle([0,H*0.5,W,H*0.66],fill=RED)
    for k in (-1,0,1): x=W*(0.5+k*0.3); d.polygon([(x-W*0.08,H*0.5),(x+W*0.08,H*0.5),(x,H*0.36)],fill=WHITE)
    return im
def djinn():
    im=Image.new('RGB',(W,H),(44,98,200)); d=ImageDraw.Draw(im); d.ellipse([W*0.25,H*0.8,W*0.75,H*0.92],fill=YELLOW); d.polygon([(W*0.7,H*0.84),(W*0.92,H*0.8),(W*0.75,H*0.88)],fill=YELLOW)
    d.line([(W*0.45,H*0.8),(W*0.55,H*0.6),(W*0.75,H*0.45),(W*0.7,H*0.25)],fill=WHITE,width=24,joint='curve'); return im
def troll():
    im=Image.new('RGB',(W,H),GREEN); d=ImageDraw.Draw(im); d.line([(W*0.2,H*0.75),(W*0.8,H*0.2)],fill=(120,80,40),width=60)
    for x in (0.38,0.62): d.polygon([(W*x-W*0.08,H*0.94),(W*x+W*0.08,H*0.94),(W*x,H*0.78)],fill=WHITE)
    return im
def mummy():
    im=Image.new('RGB',(W,H),WHITE); d=ImageDraw.Draw(im)
    for k in range(9): y=H*(0.04+k*0.11); d.polygon([(0,y),(W,y+H*0.03),(W,y+H*0.08),(0,y+H*0.05)],fill=(128,132,138))
    d.ellipse([W*0.62-34,H*0.4-34,W*0.62+34,H*0.4+34],fill=YELLOW); return im
def sarimanok():
    im=Image.new('RGB',(W,H),WHITE); d=ImageDraw.Draw(im)
    for i,col in enumerate([RED,ORANGE,YELLOW,GREEN,(47,111,216),(138,79,224)]):
        a=math.pi*(1.05+i*0.18); d.line([(W*0.5,H*0.85),(W*0.5+math.cos(a)*W*0.55,H*0.85+math.sin(a)*H*0.6)],fill=col,width=80)
    return im
EGGS={'Hydra':hydra,'Griffin':griffin,'Kirin':kirin,'Salamander':salamander,'Bakunawa':bakunawa,'Cerberus':cerberus,'Djinn':djinn,'Troll':troll,'Mummy':mummy,'Sarimanok':sarimanok,'Garuda':garuda,'Werewolf':werewolf,'Minotaur':minotaur,'Dragon':dragon,'Thunderbird':thunderbird,'Tengu':tengu,'Tanuki':tanuki,'Mermaid':mermaid,'Diwata':diwata,'Sphinx':sphinx,'Eagle':eagle,'Vampire':vampire,'Phoenix':phoenix,'Kitsune':kitsune,'Naga':naga,'Yeti':yeti,'Panda':panda,'Bee':bee,'Ladybug':ladybug,'Watermelon':watermelon,'Candy cane':candy,'Tiger':tiger,'Zebra':zebra,'Cow':cow,'Penguin':penguin,'Strawberry':strawberry,'Rubber duck':duck,'Clownfish':clownfish}

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

def closeup(seed):
    """one object held up to the camera, the way the game asks for a scan: a table, wall or floor behind it with a soft
    gradient and grain, and one strongly coloured thing near the middle, sometimes with a second smaller thing beside it"""
    r=random.Random(seed); back=r.choice([(236,234,228),(200,170,130),(120,90,60),(60,60,64),(150,152,156),(214,222,230),(24,24,28),(170,190,150)])
    im=Image.new('RGB',(W,H),back); d=ImageDraw.Draw(im); px=im.load(); g=r.uniform(-30,30)
    for j in range(H):
        k=g*(j/H-0.5)
        for i in range(0,W,6): d.rectangle([i,j,i+6,j+1],fill=tuple(max(0,min(255,int(v+k+r.gauss(0,5)))) for v in back)) if j%2==0 else None
    def bright():
        h=r.random(); s=r.uniform(0.6,1); v=r.uniform(0.6,1); i=int(h*6); f=h*6-i; p=v*(1-s); q=v*(1-f*s); u=v*(1-(1-f)*s)
        R,G,B=[(v,u,p),(q,v,p),(p,v,u),(p,q,v),(u,p,v),(v,p,q)][i%6]; return (int(R*255),int(G*255),int(B*255))
    cx=W*r.uniform(0.35,0.65); cy=H*r.uniform(0.35,0.65); rw=W*r.uniform(0.2,0.45); rh=rw*r.uniform(0.6,1.6); c=bright()
    (d.ellipse if r.random()<0.6 else d.rectangle)([cx-rw,cy-rh,cx+rw,cy+rh],fill=c)
    d.ellipse([cx-rw*0.5,cy-rh*0.6,cx-rw*0.1,cy-rh*0.2],fill=tuple(min(255,v+50) for v in c))   # a highlight
    if r.random()<0.4:
        x=W*r.uniform(0.05,0.8); y=H*r.uniform(0.05,0.85); w=W*r.uniform(0.08,0.2); d.ellipse([x,y,x+w,y+w*r.uniform(0.6,1.5)],fill=bright())
    return im.filter(ImageFilter.GaussianBlur(r.uniform(0.5,3)))

def save_all(folder):
    os.makedirs(folder,exist_ok=True); out={}
    for k,f in EGGS.items(): p=os.path.join(folder,'egg-'+k.replace(' ','_')+'.png'); f().save(p); out[k]=p
    for s in range(6): p=os.path.join(folder,f'plain-{s}.png'); plain(s).save(p); out[f'plain{s}']=p
    return out
if __name__=='__main__': print(save_all('/tmp/snabits-audit-img'))
