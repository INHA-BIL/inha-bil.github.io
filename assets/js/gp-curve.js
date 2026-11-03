(() => {
  const canvas=document.getElementById('gp-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const points=[[-.72,-.6],[.55,.62],[-.13,.58],[.88,-.28],[-.94,-.1],[.23,.9],[-.43,-.24]];
  const grid=Array.from({length:161},(_,i)=>-1.15+2.3*i/160);
  let lengthScale=.37,mode=0;
  const parameter=document.getElementById('research-parameter');
  const configs=[
    ['Gaussian Process','Length scale',.15,.8,.37,'Posterior mean','95% credible interval','Adjust the length scale to explore smoothness. Shading shows pointwise posterior uncertainty in the latent function.'],
    ['Sparse Estimation','Shrinkage strength',0,1,.4,'Retained signal','Zero entries','Increase shrinkage to remove small entries. A symmetric soft-thresholding illustration, not a fitted covariance estimate.'],
    ['Variational Inference','Learning rate',.01,.15,.05,'Approximation q','Target p','Full-covariance Gaussian VI minimizes KL(q || p). The mean, variances, and correlation are learned together, allowing q to rotate and match this Gaussian target.'],
    ['Markov Chain Monte Carlo','Proposal scale',.1,2, .65,'Chain trajectory','Target contours','Random-walk Metropolis sampling from a correlated Gaussian. Rejected proposals keep the chain at its current position. Adjust the proposal scale.'],
  ];
  const settings=configs.map(c=>c[4]);
  const kernel=(a,b)=>.65*Math.exp(-.5*((a-b)/lengthScale)**2);
  // Exact zero-mean RBF GP posterior, noise variance .025, via Cholesky solve.
  function posterior(n){
    const obs=points.slice(0,n),L=obs.map(()=>Array(n).fill(0));
    for(let i=0;i<n;i++)for(let j=0;j<=i;j++){
      let s=kernel(obs[i][0],obs[j][0])+(i===j?.025:0);
      for(let k=0;k<j;k++)s-=L[i][k]*L[j][k];
      L[i][j]=i===j?Math.sqrt(s):s/L[j][j];
    }
    function forward(rhs){const v=[];for(let i=0;i<n;i++){let s=rhs[i];for(let j=0;j<i;j++)s-=L[i][j]*v[j];v[i]=s/L[i][i];}return v;}
    const b=forward(obs.map(p=>p[1])),alpha=Array(n);
    for(let i=n-1;i>=0;i--){let s=b[i];for(let j=i+1;j<n;j++)s-=L[j][i]*alpha[j];alpha[i]=s/L[i][i];}
    return grid.map(x=>{const k=obs.map(p=>kernel(x,p[0])),v=forward(k);return {m:k.reduce((s,a,i)=>s+a*alpha[i],0),sd:Math.sqrt(Math.max(0,kernel(x,x)-v.reduce((s,a)=>s+a*a,0)))};});
  }
  let states=Array.from({length:8},(_,i)=>posterior(i));
  let width=1,height=1,elapsed=0,last=0,frame=0,visible=false;
  let paused=false,accumulator=0,iterations=0,accepted=0;
  let qMean=[-1.8,-1.1],qCovariance=[1.3,0,.95],chain=[[-1.8,-1.1]];
  let seed=7141;
  const random=()=>{seed=(1664525*seed+1013904223)>>>0;return (seed+.5)/4294967296;};
  const normal=()=>Math.sqrt(-2*Math.log(random()))*Math.cos(2*Math.PI*random());
  // Target p = N([.7,.3], [[.75,.4],[.4,.55]]).
  const determinant=.75*.55-.4*.4;
  const precision=[.55/determinant,-.4/determinant,.75/determinant];
  function logTarget(p){const x=p[0]-.7,y=p[1]-.3;return -.5*(precision[0]*x*x+2*precision[1]*x*y+precision[2]*y*y);}
  function gaussianKL(mean,covariance){
    const [a,b,c]=covariance,det=a*c-b*b;
    if(a<=0||c<=0||det<=0)return Infinity;
    const x=mean[0]-.7,y=mean[1]-.3;
    return Math.max(0,.5*(precision[0]*a+2*precision[1]*b+precision[2]*c+precision[0]*x*x+2*precision[1]*x*y+precision[2]*y*y-2+Math.log(determinant/det)));
  }
  function optimize(){
    const [a,b,c]=qCovariance,det=a*c-b*b,x=qMean[0]-.7,y=qMean[1]-.3;
    const gradientMean=[precision[0]*x+precision[1]*y,precision[1]*x+precision[2]*y];
    // Symmetric-matrix gradient: 1/2 (precision_p - inverse(covariance_q)).
    const gradientCovariance=[.5*(precision[0]-c/det),.5*(precision[1]+b/det),.5*(precision[2]-a/det)];
    const before=gaussianKL(qMean,qCovariance);
    let rate=settings[2];
    // Backtracking preserves positive definiteness and decreases the KL objective.
    for(let attempt=0;attempt<20;attempt++){
      const mean=qMean.map((v,i)=>v-rate*gradientMean[i]);
      const covariance=qCovariance.map((v,i)=>v-rate*gradientCovariance[i]);
      if(gaussianKL(mean,covariance)<=before){qMean=mean;qCovariance=covariance;break;}
      rate*=.5;
    }
    iterations++;
  }
  function sample(){
    const current=chain[chain.length-1],proposal=[current[0]+normal()*settings[3],current[1]+normal()*settings[3]];
    const accept=Math.log(random())<logTarget(proposal)-logTarget(current);
    chain.push(accept?proposal:current.slice());if(accept)accepted++;iterations++;
    if(chain.length>240)chain.shift();
  }
  function render(){
    if(mode!==0){renderAlternative();return;}
    const phase=reduced.matches?6:Math.floor(elapsed/2300)%8;
    const t=reduced.matches?1:Math.min(1,(elapsed%2300)/950),mix=t*t*(3-2*t),count=(phase+1)%8;
    document.querySelector('.gp-observations').textContent=String(count).padStart(2,'0')+' / 07';
    const values=grid.map((x,i)=>({x,m:states[phase][i].m*(1-mix)+states[count][i].m*mix,sd:states[phase][i].sd*(1-mix)+states[count][i].sd*mix}));
    const left=12,right=width-12,top=12,bottom=height-25;
    const sx=x=>left+(x+1.15)/2.3*(right-left),sy=y=>bottom-(y+1.9)/3.8*(bottom-top);
    ctx.clearRect(0,0,width,height);ctx.lineWidth=1;ctx.strokeStyle='#182d4210';
    [-1,0,1].forEach(y=>{ctx.beginPath();ctx.moveTo(left,sy(y));ctx.lineTo(right,sy(y));ctx.stroke();});
    [-1,-.5,0,.5,1].forEach(x=>{ctx.beginPath();ctx.moveTo(sx(x),top);ctx.lineTo(sx(x),bottom);ctx.stroke();});
    ctx.beginPath();values.forEach((p,i)=>{if(i===0)ctx.moveTo(sx(p.x),sy(p.m+1.96*p.sd));else ctx.lineTo(sx(p.x),sy(p.m+1.96*p.sd));});
    values.slice().reverse().forEach(p=>ctx.lineTo(sx(p.x),sy(p.m-1.96*p.sd)));ctx.closePath();ctx.fillStyle='#395ed845';ctx.fill();
    ctx.strokeStyle='#395ed870';ctx.lineWidth=1;ctx.stroke();
    ctx.beginPath();values.forEach((p,i)=>{if(i===0)ctx.moveTo(sx(p.x),sy(p.m));else ctx.lineTo(sx(p.x),sy(p.m));});ctx.strokeStyle='#395ed8';ctx.lineWidth=2.5;ctx.stroke();
    points.forEach((p,i)=>{const opacity=count===0?1-mix:i<phase?1:i===phase?mix:0;if(opacity<=0)return;ctx.globalAlpha=opacity;ctx.beginPath();ctx.arc(sx(p[0]),sy(p[1]),4,0,Math.PI*2);ctx.fillStyle='#395ed8';ctx.fill();ctx.strokeStyle='#f7fafb';ctx.lineWidth=2;ctx.stroke();ctx.globalAlpha=1;});
    ctx.fillStyle='#8a9299';ctx.font='10px sans-serif';ctx.textAlign='left';ctx.fillText('x',right-5,height-6);
  }
  function renderAlternative(){
    ctx.clearRect(0,0,width,height);const amount=settings[mode];
    document.querySelector('.gp-observations').textContent=mode===1?'16 × 16':mode===2?'KL(q || p)':'METROPOLIS';
    if(mode===1){
      const size=Math.min(height-22,width-40),cell=size/16,left=(width-size)/2;
      for(let i=0;i<16;i++)for(let j=0;j<16;j++){
        const a=Math.min(i,j),b=Math.max(i,j),original=i===j?1:Math.abs(Math.sin(a*12.7+b*4.3))*.85;
        const strength=i===j?1:Math.max(0,original-amount);
        ctx.fillStyle=strength>0?`rgba(57,94,216,${.14+.86*strength})`:'#182d4209';ctx.fillRect(left+j*cell+1,8+i*cell+1,cell-2,cell-2);
      }
    }else{
      const scale=Math.min(width/7,height/6),sx=x=>width/2+x*scale,sy=y=>height/2-y*scale;
      const eigenDelta=Math.sqrt((.75-.55)**2+4*.4*.4),major=(1.3+eigenDelta)/2,minor=(1.3-eigenDelta)/2,angle=-.5*Math.atan2(.8,.2);
      ctx.setLineDash([4,4]);ctx.strokeStyle='#8995a5';ctx.lineWidth=1.5;
      [1,1.7,2.4].forEach(r=>{ctx.beginPath();ctx.ellipse(sx(.7),sy(.3),scale*r*Math.sqrt(major),scale*r*Math.sqrt(minor),angle,0,Math.PI*2);ctx.stroke();});ctx.setLineDash([]);
      if(mode===2){
        ctx.strokeStyle='#395ed8';ctx.fillStyle='#395ed818';
        const [a,b,c]=qCovariance,delta=Math.hypot(a-c,2*b);
        const qMajor=(a+c+delta)/2,qMinor=(a+c-delta)/2,qAngle=-.5*Math.atan2(2*b,a-c);
        [2.4,1.7,1].forEach((r,i)=>{ctx.beginPath();ctx.ellipse(sx(qMean[0]),sy(qMean[1]),scale*r*Math.sqrt(qMajor),scale*r*Math.sqrt(qMinor),qAngle,0,Math.PI*2);if(i===0)ctx.fill();ctx.stroke();});
        ctx.beginPath();ctx.arc(sx(qMean[0]),sy(qMean[1]),4,0,Math.PI*2);ctx.fillStyle='#395ed8';ctx.fill();
        const kl=gaussianKL(qMean,qCovariance);
        document.querySelector('.gp-observations').textContent=`STEP ${iterations} · KL ${kl.toFixed(3)}`;
      }else{
        ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();ctx.beginPath();chain.forEach((p,i)=>{if(i===0)ctx.moveTo(sx(p[0]),sy(p[1]));else ctx.lineTo(sx(p[0]),sy(p[1]));});ctx.strokeStyle='#395ed845';ctx.lineWidth=1;ctx.stroke();
        chain.forEach((p,i)=>{ctx.beginPath();ctx.arc(sx(p[0]),sy(p[1]),i===chain.length-1?4:1.8,0,Math.PI*2);ctx.fillStyle=i===chain.length-1?'#395ed8':'#395ed888';ctx.fill();});ctx.restore();
        document.querySelector('.gp-observations').textContent=`N ${iterations} · ACCEPT ${iterations?Math.round(100*accepted/iterations):0}%`;
      }
    }
  }
  function setMode(index){
    if(mode===index)return;mode=index;const c=configs[index];
    elapsed=0;accumulator=0;iterations=0;accepted=0;qMean=[-1.8,-1.1];qCovariance=[1.3,0,.95];chain=[[-1.8,-1.1]];seed=7141;
    document.getElementById('research-graphic').dataset.mode=String(mode);
    document.getElementById('graphic-pause').disabled=mode===1||reduced.matches;
    document.querySelectorAll('.research-select').forEach(button=>{const selected=Number(button.dataset.research)===index;button.setAttribute('aria-pressed',String(selected));button.closest('.topic').classList.toggle('is-selected',selected);});
    ['graphic-title','parameter-label','graphic-key','graphic-band','graphic-description'].forEach((id,i)=>{document.getElementById(id).textContent=c[[0,1,5,6,7][i]];});
    parameter.min=c[2];parameter.max=c[3];parameter.step=.01;parameter.value=settings[index];document.getElementById('parameter-value').value=Number(parameter.value).toFixed(2);
    canvas.setAttribute('aria-label',c[0]+'. '+c[7]);sync();
  }
  document.querySelectorAll('.research-select').forEach(button=>{const select=()=>setMode(Number(button.dataset.research));button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')select();});button.addEventListener('focus',select);button.addEventListener('click',select);});
  parameter.addEventListener('input',()=>{settings[mode]=Number(parameter.value);document.getElementById('parameter-value').value=settings[mode].toFixed(2);if(mode===0){lengthScale=settings[0];states=Array.from({length:8},(_,i)=>posterior(i));}render();});
  const pauseButton=document.getElementById('graphic-pause');
  pauseButton.addEventListener('click',()=>{paused=!paused;pauseButton.textContent=paused?'Resume':'Pause';pauseButton.setAttribute('aria-pressed',String(paused));sync();});
  document.getElementById('graphic-reset').addEventListener('click',()=>{elapsed=0;accumulator=0;iterations=0;accepted=0;qMean=[-1.8,-1.1];qCovariance=[1.3,0,.95];chain=[[-1.8,-1.1]];seed=7141;sync();});
  function tick(time){frame=0;if(!visible||document.hidden||reduced.matches||paused||mode===1)return;const dt=last?Math.min(time-last,80):0;elapsed+=dt;accumulator+=dt;last=time;if(mode===2&&accumulator>=70){if(iterations<1500&&gaussianKL(qMean,qCovariance)>1e-8)optimize();accumulator=0;}if(mode===3&&accumulator>=130){sample();accumulator=0;}render();frame=requestAnimationFrame(tick);}
  function sync(){cancelAnimationFrame(frame);frame=0;last=0;pauseButton.disabled=mode===1||reduced.matches;if(reduced.matches&&iterations===0){if(mode===2)for(let i=0;i<1500;i++)optimize();if(mode===3)for(let i=0;i<120;i++)sample();}render();if(visible&&!document.hidden&&!reduced.matches&&!paused&&mode!==1)frame=requestAnimationFrame(tick);}
  new ResizeObserver(()=>{const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);render();}).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(canvas);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
})();
