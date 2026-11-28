window.__ok=1;
const sb=supabase.createClient("https://ogevzxqoypsroxsqiwhp.supabase.co","sb_publishable_YndHPg3FUb5_fsL2wX_yWw_FI3fUpxf");
const $=s=>document.querySelector(s),app=$("#app");
const h=(t,a={},...k)=>{const e=document.createElement(t);for(const x in a){if(x==="class")e.className=a[x];else if(x==="value")e.value=a[x];else if(x.startsWith("on"))e[x]=a[x];else e.setAttribute(x,a[x])}k.flat().forEach(c=>{if(c!=null&&c!==false)e.append(c.nodeType?c:document.createTextNode(c))});return e};
const fmt=n=>n>=1e6?(n/1e6).toFixed(1).replace(/\.0$/,"")+"M":n>=1e3?(n/1e3).toFixed(1).replace(/\.0$/,"")+"K":String(n);
const ago=d=>{const s=(Date.now()-new Date(d))/1e3;return s<60?"now":s<3600?Math.floor(s/60)+"m":s<86400?Math.floor(s/3600)+"h":Math.floor(s/86400)+"d"};
const ls={get:(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const applyTheme=()=>{let t=localStorage.getItem("theme")||"dark";if(t==="system")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.t=t;document.documentElement.dataset.c=localStorage.getItem("chatc")||"mono"};applyTheme();
const EMO=Array.from("😀😁😂🤣😊😍😘😎🤩🥳😢😭😡🤔🙄😴🤗😇🥰😜🤪😏😬😱🤯🥶🥵🤮👍👎👏🙌🙏💪👀💯🔥🎉🎂💖💔💕😈👻💀🤝🍕🍔🍟🍿🍩🎮🎵🌹🌈");
const KEEP={"0":"Keep forever","60000":"Don't store (1 min)","3600000":"1 hour","86400000":"24 hours","604800000":"7 days"};
const CHC=["mono","blue","purple","green","pink","orange"];
const CHV={mono:"var(--tx)",blue:"#0095f6",purple:"#8b5cf6",green:"#22c55e",pink:"#ec4899",orange:"#f97316"};
const IC={
 home:'<path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z"/>',
 fliq:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M10 8l6 4-6 4z"/>',
 chat:'<path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6A8 8 0 1 1 21 12z"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 15-5 16 0"/>',
 heart:'<path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 back:'<path d="M15 5l-7 7 7 7"/>',
 chev:'<path d="M9 5l7 7-7 7"/>',
 send:'<path d="M22 3L2 11l7 3 3 7z"/>',
 share:'<path d="M22 3L2 11l7 3 3 7z"/>',
 camera:'<rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/>',
 smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 3 4 3 4-3 4-3M9 9h.01M15 9h.01"/>',
 palette:'<circle cx="12" cy="12" r="9"/><path d="M8 10h.01M12 7h.01M16 10h.01"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 grid:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
 text:'<path d="M4 6h16M4 12h16M4 18h10"/>'
};
const ic=(n,sz=24,fill)=>{const s=h("span",{class:"i"});s.innerHTML='<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="'+(fill?"currentColor":"none")+'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+IC[n]+'</svg>';return s};
const ib=(n,fn,sz)=>h("button",{class:"ib",onclick:fn},ic(n,sz||24));
let me=null,prof=null,tab="home",chan=null,tmr=null,recovering=false,myFollowing=new Set();
const leave=()=>{if(chan){sb.removeChannel(chan);chan=null}clearInterval(tmr)};
const badge=p=>p&&p.verified?h("span",{class:"vb"},"✓"):null;
const nameEl=p=>h("b",{},p.username||"user",badge(p));
function av(p,cls){const d=h("div",{class:"av"+(cls?" "+cls:"")});if(p&&p.avatar_url)d.append(h("img",{src:p.avatar_url,loading:"lazy",decoding:"async"}));else d.textContent=((p&&p.username)||"?")[0].toUpperCase();return d}
function pick(cb,accept="image/*",cam){const i=h("input",{type:"file",accept});if(cam)i.setAttribute("capture","environment");i.onchange=()=>i.files[0]&&cb(i.files[0]);i.click()}
async function upload(f){const ext=(f.name.split(".").pop()||"bin").toLowerCase().slice(0,5);const path=`${me.id}/${Date.now()}_${Math.random().toString(36).slice(2,7)}.${ext}`;const {error}=await sb.storage.from("media").upload(path,f,{contentType:f.type});if(error)throw error;return sb.storage.from("media").getPublicUrl(path).data.publicUrl}
const toast=t=>{const d=h("div",{class:"toast"},t);document.body.append(d);setTimeout(()=>d.remove(),2200)};
function sheet(...k){const bk=h("div",{class:"bk",onclick:e=>{if(e.target===bk)bk.remove()}},h("div",{class:"sheet"},...k));document.body.append(bk);return bk}
const skel=n=>h("div",{},...Array.from({length:n},()=>h("div",{class:"sk"})));
const top=(t,...r)=>h("header",{},h("span",{class:"logo"},t),...r);
const btop=(t,back,...r)=>h("header",{},ib("back",back||main),h("span",{},t),...r);
const ids=async(col,other,val)=>{const {data}=await sb.from("follows").select(other).eq(col,val);return(data||[]).map(r=>r[other])};
const followingOf=u=>ids("follower","following",u),followersOf=u=>ids("following","follower",u);
async function friendsOf(u){const [a,b]=await Promise.all([followingOf(u),followersOf(u)]);return a.filter(x=>b.includes(x))}
async function profs(l){if(!l.length)return[];const {data}=await sb.from("profiles").select("id,username,bio,avatar_url,verified").in("id",l);return data||[]}
const loadFollowing=async()=>{myFollowing=new Set(await followingOf(me.id))};
