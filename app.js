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

/* HOME */
function homeView(){
 show(h("header",{},h("span",{class:"logo"},"yuuuuv"),h("button",{onclick:newPost},"＋")),h("div",{class:"pad"},h("div",{id:"st",class:"stories"}),h("div",{id:"fd"},"Loading…")));
 loadStories();loadFeed();
}
function viewStories(arr,i=0){
 const g=arr[i],o=h("div",{id:"ov"},h("img",{src:g.media_url}),h("div",{class:"ovt"},(g.profiles||{}).username||""));
 o.onclick=()=>{o.remove();if(i+1<arr.length)viewStories(arr,i+1)};document.body.append(o);
}
async function loadStories(){
 const {data}=await sb.from("glows").select("*,profiles(id,username,avatar_url,verified)").order("created_at");
 const by={};(data||[]).forEach(g=>{(by[g.owner]=by[g.owner]||[]).push(g)});
 const st=$("#st");if(!st)return;
 st.append(h("div",{class:"sb add",onclick:()=>pick(async f=>{try{const url=await upload(f);await sb.from("glows").insert({owner:me.id,media_url:url});homeView()}catch(e){alert(e.message)}})},h("div",{class:"av"},"＋"),"Your story"));
 Object.keys(by).sort((a,b)=>a===me.id?-1:b===me.id?1:0).forEach(o=>{const pr=by[o][0].profiles||{username:"user"};st.append(h("div",{class:"sb",onclick:()=>viewStories(by[o])},av(pr),pr.username))});
}
async function loadFeed(){
 const fol=[...myFollowing,me.id];
 const {data:ps}=await sb.from("posts").select("*,profiles(id,username,avatar_url,verified)").in("owner",fol).order("created_at",{ascending:false}).limit(30);
 const box=$("#fd");if(!box)return;box.replaceChildren();
 if(!ps||!ps.length){box.textContent="No posts yet. Follow people in 🔍 Search, or tap ＋ to post.";return}
 const pid=ps.map(p=>p.id);
 const [{data:lk},{data:cm}]=await Promise.all([sb.from("post_likes").select("post_id,user_id").in("post_id",pid),sb.from("comments").select("post_id").in("post_id",pid)]);
 ps.forEach(p=>box.append(postCard(p,lk||[],cm||[])));
}
function postCard(p,lk,cm){
 const mine=lk.filter(l=>l.post_id===p.id);let liked=mine.some(l=>l.user_id===me.id),n=mine.length;
 const cc=cm.filter(c=>c.post_id===p.id).length,pr=p.profiles||{username:"user"};
 const ln=h("b",{},String(n)),lb=h("button",{class:"ic"},liked?"♥":"♡");
 lb.onclick=async()=>{liked=!liked;n+=liked?1:-1;lb.textContent=liked?"♥":"♡";ln.textContent=n;if(liked)await sb.from("post_likes").insert({post_id:p.id,user_id:me.id});else await sb.from("post_likes").delete().eq("post_id",p.id).eq("user_id",me.id)};
 const card=h("div",{class:"card"},
  h("div",{class:"top"},av(pr,"mini"),h("div",{class:"grow",onclick:()=>profileView(pr.id,main)},nameEl(pr)),p.owner===me.id?h("button",{class:"ic",style:"font-size:18px",onclick:async()=>{if(confirm("Delete this post?")){await sb.from("posts").delete().eq("id",p.id);card.remove()}}},"🗑"):null),
  h("img",{class:"pic",src:p.media_url}),
  h("div",{class:"acts"},lb,ln,h("button",{class:"ic",style:"margin-left:10px",onclick:()=>openComments(p.id)},"💬"),h("b",{},String(cc))),
  p.caption?h("div",{class:"cap"},nameEl(pr)," ",p.caption):null);
 return card;
}
async function openComments(pid){
 const list=h("div",{class:"cl"},"Loading…"),inp=h("input",{placeholder:"Add a comment…"});
 const bk=h("div",{class:"bk",onclick:e=>{if(e.target===bk)bk.remove()}},h("div",{class:"sheet"},h("b",{style:"margin-bottom:8px"},"Comments"),list,inp,h("button",{class:"btn",onclick:async()=>{const t=inp.value.trim();if(!t)return;inp.value="";await sb.from("comments").insert({post_id:pid,user_id:me.id,body:t});load()}},"Post")));
 const load=async()=>{const {data}=await sb.from("comments").select("*,profiles(username,verified)").eq("post_id",pid).order("created_at");list.replaceChildren(...(data||[]).map(c=>h("div",{class:"cm"},nameEl(c.profiles||{})," ",c.body)));if(!data||!data.length)list.textContent="No comments yet"};
 document.body.append(bk);load();
}
function newPost(){pick(async f=>{const cap=prompt("Write a caption (optional)")||"";try{const url=await upload(f);const {error}=await sb.from("posts").insert({owner:me.id,media_url:url,caption:cap});if(error)throw error;homeView()}catch(e){alert(e.message)}})}

/* FLIQ */
async function fliqView(){
 show(h("header",{},h("span",{class:"logo"},"FLIQ"),h("button",{onclick:()=>pick(async f=>{const cap=prompt("Caption (optional)")||"";try{alert("Uploading… keep this screen open");const url=await upload(f);const {error}=await sb.from("fliqs").insert({owner:me.id,video_url:url,caption:cap});if(error)throw error;fliqView()}catch(e){alert(e.message)}},"video/*")},"＋")),h("div",{class:"reels",id:"fq"},h("div",{class:"pad"},"Loading…")));
 const {data}=await sb.from("fliqs").select("*,profiles(id,username,avatar_url,verified)").order("created_at",{ascending:false}).limit(20);
 const box=$("#fq");if(!box)return;box.replaceChildren();
 if(!data||!data.length){box.append(h("div",{class:"pad"},"No FLIQs yet. Tap ＋ to upload the first video 🎬"));return}
 const {data:lk}=await sb.from("fliq_likes").select("fliq_id,user_id").in("fliq_id",data.map(f=>f.id));
 const io=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target.querySelector("video");if(e.isIntersecting)v.play().catch(()=>{});else v.pause()}),{threshold:.7});
 data.forEach(f=>{const r=reel(f,lk||[]);box.append(r);io.observe(r)});
}
function reel(f,lk){
 const mine=lk.filter(l=>l.fliq_id===f.id);let liked=mine.some(l=>l.user_id===me.id),n=mine.length;
 const ln=h("div",{},String(n)),lb=h("button",{class:"rb"},liked?"♥":"♡");
 lb.onclick=async()=>{liked=!liked;n+=liked?1:-1;lb.textContent=liked?"♥":"♡";ln.textContent=n;if(liked)await sb.from("fliq_likes").insert({fliq_id:f.id,user_id:me.id});else await sb.from("fliq_likes").delete().eq("fliq_id",f.id).eq("user_id",me.id)};
 const vid=h("video",{src:f.video_url,loop:"",playsinline:"",preload:"metadata"});vid.muted=true;vid.onclick=()=>{vid.muted=!vid.muted};
 const pr=f.profiles||{username:"user"};
 return h("div",{class:"reel"},vid,h("div",{class:"side"},lb,ln),h("div",{class:"info"},h("div",{onclick:()=>profileView(pr.id,main)},nameEl(pr)),h("div",{},f.caption||""),h("small",{style:"opacity:.7"},"Tap video for sound")));
}

/* CHATS */
async function chatsView(){
 show(h("header",{},h("span",{class:"logo"},"Chats")),h("div",{class:"pad",id:"l"},"Loading…"));
 const fr=await profs(await friendsOf(me.id));
 const {data:st}=await sb.from("streaks").select("*");
 const l=$("#l");if(!l)return;l.replaceChildren();
 if(!fr.length)l.textContent="Chats open when you and someone follow each other. Find people in 🔍 Search.";
 fr.forEach(p=>{const [a,b]=[me.id,p.id].sort();const s=(st||[]).find(x=>x.a===a&&x.b===b);
  l.append(h("div",{class:"row",onclick:()=>chatView(p)},av(p),h("div",{class:"grow"},nameEl(p)),s&&s.count>0?h("b",{},"🔥 "+s.count):null))});
}
async function sendSnap(p){pick(async f=>{try{const url=await upload(f);const {error}=await sb.from("messages").insert({sender:me.id,receiver:p.id,kind:"snap",media_url:url,body:"snap",expires_at:new Date(Date.now()+864e5).toISOString()});if(error)throw error;alert("Snap sent 📸")}catch(e){alert(e.message)}},"image/*",true)}
async function chatView(p){
 leave();
 const t=h("input",{placeholder:"Message…"}),emo=h("div",{id:"emo"},...EMO.map(e=>h("span",{onclick:()=>t.value+=e},e)));
 const box=h("div",{id:"msgs"}),title=h("span",{style:"display:flex;align-items:center;gap:8px"},av(p,"mini"),nameEl(p));
 app.replaceChildren(h("div",{id:"v"},h("header",{},h("button",{onclick:main},"←"),title),box,emo,h("div",{id:"bar"},h("button",{onclick:()=>emo.style.display=emo.style.display==="flex"?"none":"flex"},"😊"),h("button",{onclick:()=>sendSnap(p)},"📷"),t,h("button",{onclick:send},"➤"))));
 t.onkeydown=e=>{if(e.key==="Enter")send()};
 const [a,b]=[me.id,p.id].sort();
 sb.from("streaks").select("count").eq("a",a).eq("b",b).maybeSingle().then(({data})=>{if(data&&data.count>0)title.append(h("b",{},"🔥 "+data.count))});
 async function send(){const x=t.value.trim();if(!x)return;t.value="";const k=+(prof.keep_ms||0);await sb.from("messages").insert({sender:me.id,receiver:p.id,body:x,expires_at:k?new Date(Date.now()+k).toISOString():null})}
 const load=async()=>{
  const {data}=await sb.from("messages").select("*").or(`and(sender.eq.${me.id},receiver.eq.${p.id}),and(sender.eq.${p.id},receiver.eq.${me.id})`).order("created_at");
  box.replaceChildren();
  (data||[]).forEach(m=>{
   if(m.expires_at&&new Date(m.expires_at)<new Date()){if(m.sender===me.id)sb.from("messages").delete().eq("id",m.id);return}
   const mine=m.sender===me.id,el=h("div",{class:"m"+(mine?" me":"")});
   if(m.kind==="snap"){el.textContent=mine?"📸 Snap sent":"📸 Snap, tap to view";if(!mine){el.style.cursor="pointer";el.onclick=()=>viewSnap(m)}}else el.textContent=m.body;
   el.append(h("small",{},new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})));box.append(el);
  });
  box.scrollTop=box.scrollHeight;
 };
 chan=sb.channel("m"+Date.now()).on("postgres_changes",{event:"*",schema:"public",table:"messages"},load).subscribe();
 tmr=setInterval(load,15000);load();
}
function viewSnap(m){const o=h("div",{id:"ov"},h("img",{src:m.media_url}));document.body.append(o);const c=()=>{o.remove();sb.from("messages").delete().eq("id",m.id)};o.onclick=c;setTimeout(()=>o.isConnected&&c(),8000)}

/* SEARCH */
async function toggleFollow(p,btn){
 if(myFollowing.has(p.id)){await sb.from("follows").delete().eq("follower",me.id).eq("following",p.id);myFollowing.delete(p.id)}
 else{const {error}=await sb.from("follows").insert({follower:me.id,following:p.id});if(!error)myFollowing.add(p.id)}
 btn.textContent=myFollowing.has(p.id)?"Following":"Follow";btn.className="sm"+(myFollowing.has(p.id)?" o":"");
}
function personRow(p,back){
 const btn=h("button",{class:"sm"+(myFollowing.has(p.id)?" o":"")},myFollowing.has(p.id)?"Following":"Follow");btn.onclick=()=>toggleFollow(p,btn);
 return h("div",{class:"row"},av(p),h("div",{class:"grow",onclick:()=>profileView(p.id,back)},nameEl(p),p.bio?h("small",{},p.bio):null),p.id===me.id?null:btn);
}
async function searchView(){
 const q=h("input",{placeholder:"Search people"}),res=h("div",{});
 show(h("header",{},h("span",{class:"logo"},"Search")),h("div",{class:"pad"},q,res));
 const run=async()=>{
  const s=q.value.trim().toLowerCase().replace(/[^a-z0-9_]/g,"");
  let qr=sb.from("profiles").select("id,username,bio,avatar_url,verified").neq("id",me.id).limit(20);
  qr=s.length>=1?qr.ilike("username","%"+s+"%"):qr.order("verified",{ascending:false});
  const {data}=await qr;res.replaceChildren(...(data||[]).map(p=>personRow(p,main)));
  if(!data||!data.length)res.textContent="No one found";
 };
 q.oninput=run;run();
}

/* PROFILE */
async function listView(title,list,back){
 show(h("header",{},h("button",{onclick:back},"←"),h("span",{},title)),h("div",{class:"pad",id:"ul"},"Loading…"));
 const ps=await profs(list);const u=$("#ul");u.replaceChildren(...ps.map(p=>personRow(p,()=>listView(title,list,back))));if(!ps.length)u.textContent="Nobody yet";
}
async function profileView(uid,back){
 const own=uid===me.id;
 show(h("header",{},back?h("button",{onclick:back},"←"):null,h("span",{},"Profile")),h("div",{class:"pad"},"Loading…"));
 const {data:p}=await sb.from("profiles").select("*").eq("id",uid).single();
 if(!p)return show(h("div",{class:"pad"},"Profile not found"));
 const cnt=async(c,v)=>{const {count}=await sb.from("follows").select("*",{count:"exact",head:true}).eq(c,v);return count||0};
 const [fg,fw,pc,{data:posts},theirFr,myFr]=await Promise.all([cnt("follower",uid),cnt("following",uid),sb.from("posts").select("*",{count:"exact",head:true}).eq("owner",uid).then(r=>r.count||0),sb.from("posts").select("*").eq("owner",uid).order("created_at",{ascending:false}),friendsOf(uid),friendsOf(me.id)]);
 const followingList=await followingOf(uid);
 const toProfile=()=>profileView(uid,back);
 const stats=h("div",{class:"stats"},h("div",{},h("b",{},String(pc)),h("small",{},"Posts")),
  h("div",{onclick:()=>own?followersOf(uid).then(l=>listView("Followers",l,toProfile)):alert("Followers list is private")},h("b",{},p.demo_followers!=null?fmt(p.demo_followers):String(fw)),h("small",{},p.demo_followers!=null?"Followers (demo)":"Followers")),
  h("div",{onclick:()=>listView("Following",followingList,toProfile)},h("b",{},String(fg)),h("small",{},"Following")));
 const body=h("div",{class:"pad"},h("div",{style:"display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px"},av(p,"big"),h("div",{style:"font-size:20px"},nameEl(p)),p.bio?h("div",{style:"color:var(--mut)"},p.bio):null),stats);
 if(own){
  const bio=h("input",{maxlength:"100",placeholder:"Bio",value:p.bio||""}),k=h("select",{onchange:async e=>{prof.keep_ms=+e.target.value;await sb.from("profiles").update({keep_ms:prof.keep_ms}).eq("id",me.id)}},...Object.entries(KEEP).map(([v,t])=>{const o=h("option",{value:v},t);if(String(prof.keep_ms||0)===v)o.selected=true;return o}));
  body.append(
   h("button",{class:"btn o",onclick:()=>pick(async f=>{try{const url=await upload(f);const {error}=await sb.from("profiles").update({avatar_url:url}).eq("id",me.id);if(error)throw error;prof.avatar_url=url;profileView(uid,back)}catch(e){alert(e.message)}})},"Change photo"),
   bio,h("button",{class:"btn o",onclick:async()=>{const {error}=await sb.from("profiles").update({bio:bio.value.trim()}).eq("id",me.id);if(error)return alert(error.message);prof.bio=bio.value.trim();profileView(uid,back)}},"Save bio"),
   h("h3",{},"Save my messages for"),k,
   h("h3",{},"Theme"),h("button",{class:"btn o",onclick:()=>{localStorage.setItem("theme",(localStorage.getItem("theme")||"dark")==="dark"?"light":"dark");applyTheme()}},"Switch dark / light"),
   h("button",{class:"btn o",onclick:()=>sb.auth.signOut()},"Log out"));
 }else{
  const btn=h("button",{class:"btn"+(myFollowing.has(uid)?" o":"")},myFollowing.has(uid)?"Following":"Follow");btn.onclick=async()=>{await toggleFollow(p,btn);btn.className="btn"+(myFollowing.has(uid)?" o":"")};
  body.append(btn);
  if(theirFr.includes(me.id))body.append(h("button",{class:"btn o",onclick:()=>chatView(p)},"Message"));
  const common=myFr.filter(x=>theirFr.includes(x));
  profs(common).then(cp=>{const d=h("div",{style:"color:var(--mut);font-size:14px;margin:6px 0"},cp.length?"Mutual friends: "+cp.map(x=>x.username).join(", "):"No mutual friends");btn.after(d)});
 }
 body.append(h("h3",{},"Posts"));
 body.append((posts&&posts.length)?h("div",{class:"grid"},...posts.map(x=>h("img",{src:x.media_url,onclick:()=>{const o=h("div",{id:"ov"},h("img",{src:x.media_url}));o.oncli
