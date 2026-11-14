import sys, subprocess, os, glob
from PIL import Image, ImageDraw
# rows: name start ; 7 frames from start every 0.1 s
rows=[r.split('@') for r in sys.argv[2].split(';')]
F=sys.argv[1]; out=[]
for name,t in rows:
    t=float(t); fr=[]
    for k in range(7):
        fn=f'/tmp/r_{k}.png'; subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t+k*0.1),'-i',F,'-frames:v','1','-vf','crop=300:250:45:240,scale=200:167',fn],check=True); fr.append(Image.open(fn).copy())
    row=Image.new('RGB',(200*7,167+22),(20,21,29)); [row.paste(im,(i*200,22)) for i,im in enumerate(fr)]; ImageDraw.Draw(row).text((6,4),name,fill=(255,255,255)); out.append(row)
S=Image.new('RGB',(1400,sum(r.height for r in out))); y=0
for r in out: S.paste(r,(0,y)); y+=r.height
S.save(sys.argv[3]); print(S.size)
