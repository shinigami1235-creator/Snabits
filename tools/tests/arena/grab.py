import sys, glob, subprocess, os
from PIL import Image
f=os.environ.get('F') or glob.glob(os.environ.get('V','vf')+'/*.webm')[0]; out=sys.argv[1]; t0=float(sys.argv[2]); dur=float(sys.argv[3]); fps=sys.argv[4] if len(sys.argv)>4 else '8'
crop=sys.argv[5] if len(sys.argv)>5 else '330:300:30:230'
d='g_'+out; os.makedirs(d,exist_ok=True)
for x in glob.glob(d+'/*'): os.remove(x)
subprocess.run(['ffmpeg','-v','error','-ss',str(t0),'-t',str(dur),'-i',f,'-vf',f'fps={fps},crop={crop}',d+'/%03d.png'],check=True)
fs=sorted(glob.glob(d+'/*.png')); ims=[Image.open(x) for x in fs]; w,h=ims[0].size; cols=min(6,len(ims)); rows=(len(ims)+cols-1)//cols
S=Image.new('RGB',(w*cols,h*rows))
for k,im in enumerate(ims): S.paste(im,((k%cols)*w,(k//cols)*h))
S.save(out+'.png'); print(S.size)
