window.__ok=1;
const sb=supabase.createClient("https://ogevzxqoypsroxsqiwhp.supabase.co","sb_publishable_YndHPg3FUb5_fsL2wX_yWw_FI3fUpxf");
const $=s=>document.querySelector(s),app=$("#app");
const h=(t,a={},...k)=>{const e=document.createElement(t);for(const x in a){if(x==="class")e.className=a[x];else if(x==="value")e.value=a[x];else if(x.startsWith("on"))e[x]=a[x];else e.setAttribute(x,a[x])}k.flat().forEach(c=>{if(c!=null&&c!==false)e.append(c.nodeType?c:document.createTextNode(c))});return e};
const fmt=n=>n>=1e6?(n/1e6).toFixed(1).replace(/\.0$/,"")+"M":n>=1e3?(n/1e3).toFixed(1).replace(/\.0$/,"")+"K":String(n);
const applyTheme=()=>{document.documentElement.dataset.t=localStorage.getItem("theme")||"dark"};applyTheme();
const EMO=Array.from("😀😁😂🤣😊😍😘😎🤩🥳😢😭😡🤔🙄😴🤗😇🥰😜🤪😏😬😱🤯🥶🥵🤮👍👎👏🙌🙏💪👀💯🔥🎉🎂💖💔💕😈👻💀🤝🍕🍔🍟🍿🍩🎮🎵🌹🌈");
const KEEP={"0":"Keep forever","60000":"Don't store (1 min)","3600000":"1 hour","86400000":"24 hours","604800000":"7 days"};
let me=null,prof=null,tab="home",chan=null,tmr=null,recovering=false,myFollowing=new Set();
const leave=()=>{if(chan){sb.removeChannel(chan);chan=null}clearInterval(tmr)};
const badge=p=>p&&p.verified?h("span",{class:"vb"},"✓"):null;
const nameEl=p=>h("b",{},p.username||"user",badge(p));
function av(p,cls){const d=h("div",{class:"av"+(cls?" "+cls:"")});if(p&&p.avatar_url)d.append(h("img",{src:p.avatar_url}));else d.textContent=((p&&p.username)||"?")[0].toUpperCase();return d}
function pick(cb,accept="image/*",cam){const i=h("input",{type:"file",accept});if(cam)i.setAttribute("capture","environment");i.onchange=()=>i.files[0]&&cb(i.files[0]);i.click()}
async function upload(f){const ext=(f.name.split(".").pop()||"bin").toLowerCase().slice(0,5);const path=`${me.id}/${Date.now()}_${Math.random().toString(36).slice(2,7)}.${ext}`;const {error}=await sb.storage.from("media").upload(path,f,{contentType:f.type});if(error)throw error;return sb.storage.from("media").getPublicUrl(path).data.publicUrl}
const ids=async(col,other,val)=>{const {data}=await sb.from("follows").select(other).eq(col,val);return(data||[]).map(r=>r[other])};
const followingOf=u=>ids("follower","following",u),followersOf=u=>ids("following","follower",u);
async function friendsOf(u){const [a,b]=await Promise.all([followingOf(u),followersOf(u)]);return a.filter(x=>b.includes(x))}
async function profs(l){if(!l.length)return[];const {data}=await sb.from("profiles").select("id,username,bio,avatar_url,verified").in("id",l);return data||[]}
const loadFollowing=async()=>{myFollowing=new Set(await followingOf(me.id))};

sb.auth.onAuthStateChange((e,s)=>{
 if(e==="PASSWORD_RECOVERY"){recovering=true;return recoverView()}
 if(recovering)return;
 if(!s){me=null;return authView()}
 if(me&&me.id===s.user.id)return;
 me=s.user;
 setTimeout(async()=>{try{await loadProf();await loadFollowing();main()}catch(err){authView("Could not load: "+(err.message||err))}},0);
});
async function loadProf(){
 let {data,error}=await sb.from("profiles").select("*").eq("id",me.id).maybeSingle();
 if(error)throw error;
 if(!data){const name=localStorage.getItem("pending")||("user"+Math.random().toString(36).slice(2,7));const r=await sb.from("profiles").insert({id:me.id,username:name}).select().single();if(r.error)throw r.error;data=r.data}
 prof=data;
}

function recoverView(){
 const p=h("input",{type:"password",placeholder:"New password (6+ characters)"});
 app.replaceChildren(h("header",{},h("span",{class:"logo"},"New password")),h("div",{class:"pad"},p,h("button",{class:"btn",onclick:async()=>{const {error}=await sb.auth.updateUser({password:p.value});if(error)return alert(error.message);location.href=location.pathname}},"Save password")));
}
function authView(msg=""){
 leave();
 const u=h("input",{id:"u",placeholder:"Username (new accounts)"}),e=h("input",{id:"e",type:"email",placeholder:"Email"}),p=h("input",{id:"p",type:"password",placeholder:"Password (6+ characters)"});
 app.replaceChildren(h("header",{},h("span",{class:"logo"},"yuuuuv")),h("div",{class:"pad"},u,e,p,h("div",{class:"err"},msg),
  h("button",{class:"btn",onclick:async()=>{const {error}=await sb.auth.signInWithPassword({email:e.value.trim(),password:p.value});if(error)authView(error.message)}},"Log in"),
  h("button",{class:"btn o",onclick:async()=>{
   const name=u.value.trim().toLowerCase().replace(/[^a-z0-9_]/g,"");
   if(name.length<3)return authView("Username needs 3+ letters/numbers");
   const {data:t}=await sb.from("profiles").select("id").eq("username",name);
   if(t&&t.length)return authView("Username taken");
   localStorage.setItem("pending",name);
   const {data,error}=await sb.auth.signUp({email:e.value.trim(),password:p.value});
   if(error)return authView(error.message);
   if(!data.session)authView("Check your email to confirm, then log in.");
  }},"Create account"),
  h("button",{class:"link",onclick:async()=>{if(!e.value.trim())return authView("Type your email first");const {error}=await sb.auth.resetPasswordForEmail(e.value.trim(),{redirectTo:location.origin+location.pathname});authView(error?error.message:"Reset link sent. Check your email.")}},"Forgot password?")));
}

function main(){
 leave();
 app.replaceChildren(h("div",{id:"v"}),h("nav",{},...[["home","🏠"],["fliq","🎬"],["chats","💬"],["search","🔍"],["profile","👤"]].map(([k,i])=>h("button",{class:tab===k?"on":"",onclick:()=>{tab=k;main()}},i))));
 ({home:homeView,fliq:fliqView,chats:chatsView,search:searchView,profile:()=>profileView(me.id)})[tab]();
}
const show=(...n)=>$("#v").replaceChildren(...n);
