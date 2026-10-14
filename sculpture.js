/* Offline 3D geometry renderer: torus, faceted octahedron, perspective, lighting. */
(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
for(const canvas of document.querySelectorAll('canvas[data-sculpture]')){
 const ctx=canvas.getContext('2d');if(!ctx)continue;
 let rx=.58,ry=.2,drag=false,lastX=0,lastY=0,paused=reduced.matches,visible=true,frame=0,last=0,w=0,h=0;
 const parent=canvas.closest('.sculpture-shell');const toggle=parent?.querySelector('.sculpture-toggle');
 function rotate(v){let [x,y,z]=v;let a=y*Math.cos(rx)-z*Math.sin(rx),b=y*Math.sin(rx)+z*Math.cos(rx);return [x*Math.cos(ry)+b*Math.sin(ry),a,-x*Math.sin(ry)+b*Math.cos(ry)]}
 function project(v){let k=Math.min(w,h)*.28*4.8/(4.8-v[2]);return [w/2+v[0]*k,h/2+v[1]*k]}
 const rings=48,sides=16,verts=[],normals=[],faces=[];
 for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){const u=i/rings*Math.PI*2,v=j/sides*Math.PI*2;verts.push([(1+.29*Math.cos(v))*Math.cos(u),(1+.29*Math.cos(v))*Math.sin(u),.29*Math.sin(v)]);normals.push([Math.cos(v)*Math.cos(u),Math.cos(v)*Math.sin(u),Math.sin(v)]);faces.push([i*sides+j,((i+1)%rings)*sides+j,((i+1)%rings)*sides+(j+1)%sides,i*sides+(j+1)%sides]);}
 function draw(){ctx.clearRect(0,0,w,h);if(!w||!h)return;
 const shadow=ctx.createRadialGradient(w/2,h*.81,0,w/2,h*.81,w*.3);shadow.addColorStop(0,'rgba(32,58,103,.18)');shadow.addColorStop(1,'rgba(32,58,103,0)');ctx.save();ctx.translate(0,h*.58);ctx.scale(1,.28);ctx.fillStyle=shadow;ctx.fillRect(0,-h,w,h*3);ctx.restore();
 const p=verts.map(rotate),n=normals.map(rotate);let polys=faces.map(f=>({f,z:f.reduce((s,i)=>s+p[i][2],0)/4,type:'ring'}));
 const ov=[[.59,0,0],[-.59,0,0],[0,.59,0],[0,-.59,0],[0,0,.59],[0,0,-.59]].map(rotate);const of=[[0,2,4],[2,1,4],[1,3,4],[3,0,4],[2,0,5],[1,2,5],[3,1,5],[0,3,5]];
 polys.push(...of.map((f,i)=>({f,z:f.reduce((s,k)=>s+ov[k][2],0)/3,type:'core',i})));
 polys.sort((a,b)=>a.z-b.z);
 for(const o of polys){let points,fill;if(o.type==='ring'){
  points=o.f.map(i=>project(p[i]));const avg=[0,1,2].map(k=>o.f.reduce((s,i)=>s+n[i][k],0)/4);let light=Math.max(0,avg[0]*-.35+avg[1]*-.55+avg[2]*.76);let spec=Math.pow(Math.max(0,avg[2]*.9-avg[1]*.3),18);let lum=Math.min(98,40+light*39+spec*24);fill=`hsl(220 14% ${lum}%)`;
 }else{points=o.f.map(i=>project(ov[i]));fill=`hsl(226 94% ${37+o.i*4}%)`;}
 ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=fill;ctx.lineWidth=.6;ctx.stroke();}
 }
 function resize(){const b=canvas.getBoundingClientRect();w=b.width;h=b.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);draw()}
 function run(t){frame=0;if(document.hidden||!visible||paused||document.body.classList.contains('paused'))return;if(t-last>32){if(!drag)ry+=.008;draw();last=t}frame=requestAnimationFrame(run)}
 function start(){if(!frame)frame=requestAnimationFrame(run)}
 function label(){if(toggle){toggle.textContent=paused?'Hareketi başlat':'Hareketi durdur';toggle.setAttribute('aria-pressed',String(paused))}}
 toggle?.addEventListener('click',()=>{paused=!paused;label();start()});label();
 canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;ry+=(e.clientX-lastX)*.01;rx+=(e.clientY-lastY)*.01;lastX=e.clientX;lastY=e.clientY;draw()});
 canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();ry+=e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0;rx+=e.key==='ArrowUp'?-.15:e.key==='ArrowDown'?.15:0;draw()}});
 new ResizeObserver(resize).observe(canvas);new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)start()}).observe(canvas);
 new MutationObserver(start).observe(document.body,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',start);
 reduced.addEventListener('change',e=>{paused=e.matches;label();start()});resize();start();
}
})();
