const VERTEX = `
precision highp float;
attribute vec2 aUV;
uniform mat4 uProjection;
uniform mat4 uView;
uniform mat3 uRotation;
uniform vec3 uPosition;
uniform vec3 uScale;
uniform float uTime;
uniform float uLevel;
uniform float uKind;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUV;
vec3 path(float t) {
  float r = 1.0 + .24*cos(3.0*t + uLevel*.25);
  return vec3(r*cos(2.0*t),r*sin(2.0*t),.43*sin(3.0*t)) * 1.28;
}
vec3 surface(vec2 uv) {
  float u=uv.x, v=uv.y;
  if(uKind < .5) {
    float ridge = .016 * cos(u*144.0);
    float r = 1.13 + (.32 + ridge)*cos(v) + .05*uLevel*sin(u*7.0+uTime*1.7);
    return vec3(r*cos(u),r*sin(u),(.28+ridge)*sin(v));
  }
  vec3 c=path(u);
  vec3 tangent=normalize(path(u+.005)-path(u-.005));
  vec3 n=normalize(cross(tangent,vec3(0.,0.,1.)));
  vec3 b=normalize(cross(tangent,n));
  float twist=u*.5 + sin(u*3.0+uTime*.7)*uLevel*.3;
  vec3 nn=n*cos(twist)+b*sin(twist), bb=-n*sin(twist)+b*cos(twist);
  return c + nn*cos(v)*(.105 + .115*uLevel) + bb*sin(v)*.065;
}
void main(){
  vec3 p=surface(aUV);
  vec3 du=surface(aUV+vec2(.001,0.))-surface(aUV-vec2(.001,0.));
  vec3 dv=surface(aUV+vec2(0.,.001))-surface(aUV-vec2(0.,.001));
  vNormal=normalize(uRotation*(normalize(cross(du,dv))/uScale));
  vWorld=uRotation*(p*uScale)+uPosition;
  vUV=aUV;
  gl_Position=uProjection*uView*vec4(vWorld,1.);
}`
const FRAGMENT = `
precision highp float;
uniform vec3 uColor;
uniform vec3 uCamera;
uniform float uKind;
uniform float uMuted;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUV;
void main(){
  vec3 n=normalize(vNormal);
  if(!gl_FrontFacing) n=-n;
  vec3 view=normalize(uCamera-vWorld);
  vec3 light=normalize(vec3(-2.5,4.,5.));
  float diffuse=max(0.,dot(n,light));
  float fill=max(0.,dot(n,normalize(vec3(4.,1.,1.))));
  float spec=pow(max(0.,dot(n,normalize(view+light))),uKind>.5?65.:95.);
  float rim=pow(1.-max(0.,dot(n,view)),3.);
  float grain=fract(sin(dot(vUV,vec2(127.1,311.7)))*43758.5453)*.035;
  vec3 color=uColor*(.32+diffuse*.72+fill*.3+grain)+vec3(.96,.89,.72)*spec*(uKind>.5?.8:.48);
  color+=vec3(.42,.45,.38)*rim*.18;
  color=mix(color,vec3(.67,.65,.60),uMuted*.85);
  gl_FragColor=vec4(pow(color,vec3(.88)),1.);
}`

function perspective(fov, aspect) {
  const f=1/Math.tan(fov/2), near=.1, far=100
  return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0])
}
const normalize = (v) => { const length=Math.hypot(...v); return v.map((x)=>x/length) }
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const dot = (a,b) => a.reduce((sum,x,i)=>sum+x*b[i],0)
function lookAt(eye) {
  const z=normalize(eye),x=normalize(cross([0,1,0],z)),y=cross(z,x)
  return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1])
}
function rotation(x,y,z) {
  const cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z)
  return new Float32Array([cy*cz,cy*sz,-sy,sx*sy*cz-cx*sz,sx*sy*sz+cx*cz,sx*cy,cx*sy*cz+sx*sz,cx*sy*sz-sx*cz,cx*cy])
}

export class CollisionWorld {
  constructor(canvas) {
    this.canvas=canvas; this.gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'})
    if(!this.gl) throw new Error('WebGL unavailable')
    const gl=this.gl
    const compile=(type,source)=>{
      const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader)
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader))
      return shader
    }
    const program=gl.createProgram()
    this.shaders=[compile(gl.VERTEX_SHADER,VERTEX),compile(gl.FRAGMENT_SHADER,FRAGMENT)]
    this.shaders.forEach((shader)=>gl.attachShader(program,shader));gl.linkProgram(program)
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program))
    this.program=program;gl.useProgram(program)
    this.uniforms=Object.fromEntries(['uProjection','uView','uRotation','uPosition','uScale','uTime','uLevel','uKind','uColor','uCamera','uMuted'].map((name)=>[name,gl.getUniformLocation(program,name)]))
    const vertices=[],indices=[],rows=240,columns=24
    for(let i=0;i<=rows;i++)for(let j=0;j<=columns;j++)vertices.push(i/rows*Math.PI*2,j/columns*Math.PI*2)
    for(let i=0;i<rows;i++)for(let j=0;j<columns;j++){
      const a=i*(columns+1)+j,b=a+columns+1
      indices.push(a,b,a+1,b,b+1,a+1)
    }
    this.vertexBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.vertexBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW)
    this.indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW)
    const attribute=gl.getAttribLocation(program,'aUV');gl.enableVertexAttribArray(attribute);gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0)
    this.count=indices.length;this.levels=[0,0,0];this.pointer=[0,0];this.viewAngle=[0,0];this.muted=[0,0]
    gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0)
    this.draw(0,[0,0,0],'both',false)
  }
  draw(time, levels, mode, moving) {
    const gl=this.gl,c=this.canvas,u=this.uniforms
    if(gl.isContextLost())return
    const ratio=Math.min(devicePixelRatio,1.5),width=Math.round(c.clientWidth*ratio),height=Math.round(c.clientHeight*ratio)
    if(c.width!==width||c.height!==height){c.width=width;c.height=height;gl.viewport(0,0,width,height)}
    const aspect=width/height, narrow=aspect<1.1
    const eye=[0,.35,narrow?8.9:6.7]
    gl.useProgram(this.program);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
    gl.uniformMatrix4fv(u.uProjection,false,perspective((narrow?49:40)*Math.PI/180,aspect));gl.uniformMatrix4fv(u.uView,false,lookAt(eye));gl.uniform3fv(u.uCamera,eye)
    this.levels=this.levels.map((v,i)=>v+(levels[i]-v)*(levels[i]>v?.4:.14))
    this.viewAngle=this.viewAngle.map((v,i)=>v+(this.pointer[i]-v)*.08)
    const [body,voice,bass]=moving?this.levels:[.06,.08,.05]
    const t=moving?time:2.8
    const turn=moving?Math.sin(t*.23)*.18:0
    this.muted=this.muted.map((v,i)=>v+(((i===0&&mode==='lead')||(i===1&&mode==='backing')?1:0)-v)*.16)
    const render=(kind,position,angles,scale,color,level,muted)=>{
      gl.uniform1f(u.uKind,kind);gl.uniform1f(u.uTime,t);gl.uniform1f(u.uLevel,level);gl.uniform1f(u.uMuted,muted)
      gl.uniform3fv(u.uPosition,position);gl.uniform3fv(u.uScale,scale);gl.uniform3fv(u.uColor,color)
      gl.uniformMatrix3fv(u.uRotation,false,rotation(...angles));gl.drawElements(gl.TRIANGLES,this.count,gl.UNSIGNED_SHORT,0)
    }
    const px=moving?this.viewAngle[0]*.15:0,py=moving?this.viewAngle[1]*.1:0
    render(0,[-.40,-.10,-.14],[.55+turn+py,-.37+px,-.31+body*.12],[1.08+bass*.07,1.08+bass*.07,1.05],[.075,.092,.073],bass,this.muted[0])
    render(0,[-.45,-.08,-.25],[.55+turn+py,-.37+px,-.31],[.80+bass*.025,.80+bass*.025,.43],[.10,.119,.095],body*.4,this.muted[0])
    render(1,[.39-voice*.11,.14+Math.sin(t*.7)*voice*.07,.37],[-.17+py,.32+turn+px,-.35+Math.sin(t*.35)*.10],[1.03+voice*.07,1.03+voice*.07,1.03],[.98,.18,.045],voice,this.muted[1])
  }
  dispose(){const gl=this.gl;gl.deleteBuffer(this.vertexBuffer);gl.deleteBuffer(this.indexBuffer);gl.deleteProgram(this.program);this.shaders.forEach((s)=>gl.deleteShader(s))}
}
