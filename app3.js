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
