/* FLIQ */
function upFliq(){pick(async f=>{const cap=prompt("Caption (optional)")||"";try{toast("Uploading video… keep this screen open");const url=await upload(f);const {error}=await sb.from("fliqs").insert({owner:me.id,video_url:url,caption:cap});if(error)throw error;fliqView()}catch(e){toast(e.message)}},"video/*")}
async function fliqView(){
 const box=h("div",{class:"reels"},skel(1));
 show(top("FLIQ",ib("plus",upFliq)),box);
 const {data}=await sb.from("fliqs").select("*,profiles(id,username,avatar_url,verified)").order("created_at",{ascending:false}).limit(20);
 box.replaceChildren();
 if(!data||!data.length){box.append(h("div",{class:"empty"},"No FLIQs yet. Tap + to upload the first video."));return}
 const {data:lk}=await sb.from("fliq_likes").select("fliq_id,user_id").in("fliq_id",data.map(f=>f.id));
 const io=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target.querySelector("video");if(e.isIntersecting)v.play().catch(()=>{});else v.pause()}),{threshold:.7});
 data.forEach(f=>{const r=reel(f,lk||[]);box.append(r);io.observe(r)});
}
function reel(f,lk){
 const mine=lk.filter(l=>l.fliq_id===f.id);let liked=mine.some(l=>l.user_id===me.id),n=mine.length;
 const ln=h("div",{},String(n)),lb=h("button",{class:"rb"});
 const setL=()=>lb.replaceChildren(ic("heart",32,liked));setL();
 lb.onclick=async()=>{liked=!liked;n+=liked?1:-1;ln.textContent=n;setL();if(liked)await sb.from("fliq_likes").insert({fliq_id:f.id,user_id:me.id});else await sb.from("fliq_likes").delete().eq("fliq_id",f.id).eq("user_id",me.id)};
 const vid=h("video",{src:f.video_url,loop:"",playsinline:"",preload:"metadata"});vid.muted=true;vid.onclick=()=>{vid.muted=!vid.muted};
 const pr=f.profiles||{username:"user"};
 return h("div",{class:"reel"},vid,h("div",{class:"side"},lb,ln),h("div",{class:"info"},h("div",{style:"display:flex;align-items:center;gap:8px",onclick:()=>profileView(pr.id,main)},av(pr,"mini"),nameEl(pr)),h("div",{},f.caption||""),h("small",{style:"opacity:.7"},"Tap video for sound")));
}

/* CHATS */
async function chatsView(){
 const l=h("div",{class:"pad"},skel(4));
 show(top("Messages"),l);
 const fr=await profs(await friendsOf(me.id));
 const {data:st}=await sb.from("streaks").select("*");
 l.replaceChildren();
 if(!fr.length)l.append(h("div",{class:"empty"},"Chats open when you and someone follow each other. Find people in Search."));
 fr.forEach(p=>{const [a,b]=[me.id,p.id].sort();const s=(st||[]).find(x=>x.a===a&&x.b===b);
  l.append(h("div",{class:"row",onclick:()=>chatView(p)},av(p),h("div",{class:"grow"},nameEl(p),h("small",{},"Tap to chat")),s&&s.count>0?h("b",{},"🔥 "+s.count):null))});
}
function sendSnap(p){pick(async f=>{try{toast("Sending snap…");const url=await upload(f);const {error}=await sb.from("messages").insert({sender:me.id,receiver:p.id,kind:"snap",media_url:url,body:"snap",expires_at:new Date(Date.now()+864e5).toISOString()});if(error)throw error;toast("Snap sent")}catch(e){toast(e.message)}},"image/*",true)}
function chatTheme(){
 const dots=h("div",{class:"dots"});
 const draw=()=>{const cur=localStorage.getItem("chatc")||"mono";dots.replaceChildren(...CHC.map(c=>h("div",{class:"dot"+(cur===c?" on":""),style:"background:"+CHV[c],onclick:()=>{localStorage.setItem("chatc",c);applyTheme();draw()}})))};draw();
 const cur=localStorage.getItem("theme")||"dark";
 sheet(h("b",{},"Chat theme"),h("small",{class:"ago"},"Message colour"),dots,h("small",{class:"ago"},"App theme"),h("div",{class:"seg"},...[["dark","Dark"],["light","Light"],["system","System"]].map(([k,t])=>h("button",{class:cur===k?"on":"",onclick:e=>{localStorage.setItem("theme",k);applyTheme();e.target.parentNode.querySelectorAll("button").forEach(b=>b.className="");e.target.className="on"}},t))));
}
async function chatView(p){
 leave();
 const t=h("input",{placeholder:"Message…"}),emo=h("div",{id:"emo"},...EMO.map(e=>h("span",{onclick:()=>t.value+=e},e)));
 const box=h("div",{id:"msgs"}),title=h("div",{class:"grow",style:"display:flex;align-items:center;gap:8px;min-width:0"},av(p,"mini"),nameEl(p));
 const send=async()=>{const x=t.value.trim();if(!x)return;t.value="";const k=+(prof.keep_ms||0);await sb.from("messages").insert({sender:me.id,receiver:p.id,body:x,expires_at:k?new Date(Date.now()+k).toISOString():null})};
 app.replaceChildren(h("div",{id:"v"},h("header",{},ib("back",main),title,ib("palette",chatTheme)),box,emo,h("div",{id:"bar"},ib("camera",()=>sendSnap(p)),ib("smile",()=>{emo.style.display=emo.style.display==="flex"?"none":"flex"}),t,ib("send",send))));
 t.onkeydown=e=>{if(e.key==="Enter")send()};
 const [a,b]=[me.id,p.id].sort();
 sb.from("streaks").select("count").eq("a",a).eq("b",b).maybeSingle().then(({data})=>{if(data&&data.count>0)title.append(h("b",{},"🔥 "+data.count))});
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
