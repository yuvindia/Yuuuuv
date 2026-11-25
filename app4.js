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
 body.append((posts&&posts.length)?h("div",{class:"grid"},...posts.map(x=>h("img",{src:x.media_url,onclick:()=>{const o=h("div",{id:"ov"},h("img",{src:x.media_url}));o.onclick=()=>o.remove();document.body.append(o)}}))):h("div",{style:"color:var(--mut)"},"No posts yet"));
 show(h("header",{},back?h("button",{onclick:back},"←"):null,h("span",{},"@"+p.username)),body);
}
