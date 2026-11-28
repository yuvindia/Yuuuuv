/* SEARCH */
async function toggleFollow(p,btn,cls){
 if(myFollowing.has(p.id)){await sb.from("follows").delete().eq("follower",me.id).eq("following",p.id);myFollowing.delete(p.id)}
 else{const {error}=await sb.from("follows").insert({follower:me.id,following:p.id});if(!error)myFollowing.add(p.id)}
 btn.textContent=myFollowing.has(p.id)?"Following":"Follow";btn.className=cls+(myFollowing.has(p.id)?" o":"");
}
function personRow(p,back){
 const btn=h("button",{class:"sm"+(myFollowing.has(p.id)?" o":"")},myFollowing.has(p.id)?"Following":"Follow");btn.onclick=()=>toggleFollow(p,btn,"sm");
 return h("div",{class:"row"},av(p),h("div",{class:"grow",onclick:()=>profileView(p.id,back)},nameEl(p),p.bio?h("small",{},p.bio):null),p.id===me.id?null:btn);
}
function searchView(){
 const q=h("input",{placeholder:"Search people",class:"sq"}),res=h("div",{});
 show(top("Search"),h("div",{class:"pad"},q,res));
 const run=async()=>{
  const s=q.value.trim().toLowerCase().replace(/[^a-z0-9_]/g,"");
  let qr=sb.from("profiles").select("id,username,bio,avatar_url,verified").neq("id",me.id).limit(20);
  qr=s.length>=1?qr.ilike("username","%"+s+"%"):qr.order("verified",{ascending:false});
  const {data}=await qr;res.replaceChildren(...(data||[]).map(p=>personRow(p,main)));
  if(!data||!data.length)res.append(h("div",{class:"empty"},"No one found"));
 };
 q.oninput=run;run();
}

/* PROFILE */
let ptab="grid";
async function profileView(uid,back){
 const own=uid===me.id;
 const bk=back||(()=>{tab="profile";main()});
 show(own?top("@"+prof.username,ib("plus",compose),ib("menu",settingsView)):btop("Profile",back),h("div",{class:"scr"},skel(2)));
 const {data:p}=await sb.from("profiles").select("*").eq("id",uid).single();
 if(!p)return show(btop("Profile",back),h("div",{class:"empty"},"Profile not found"));
 const cnt=async(c,v)=>{const {count}=await sb.from("follows").select("*",{count:"exact",head:true}).eq(c,v);return count||0};
 const r=await Promise.all([cnt("follower",uid),cnt("following",uid),sb.from("posts").select("*").eq("owner",uid).order("created_at",{ascending:false}),followingOf(uid),friendsOf(uid),friendsOf(me.id)]);
 const fg=r[0],fw=r[1],posts=r[2].data||[],fl=r[3],theirFr=r[4],myFr=r[5];
 posts.forEach(x=>{x.profiles=p});
 const toProfile=()=>profileView(uid,back);
 const demo=p.demo_followers!=null;
 const stat=(n,l,fn)=>h("div",{class:"st",onclick:fn},h("b",{},n),h("small",{},l));
 const stats=h("div",{class:"pst"},stat(String(posts.length),"posts"),stat(demo?fmt(p.demo_followers):String(fw),demo?"followers (demo)":"followers",()=>own?followersOf(uid).then(l=>listView("Followers",l,toProfile)):toast("Followers list is private")),stat(String(fg),"following",()=>listView("Following",fl,toProfile)));
 const body=h("div",{class:"scr"},h("div",{class:"ptop"},av(p,"xl"),stats),h("div",{class:"pinfo"},nameEl(p),p.bio?h("div",{class:"pbio"},p.bio):null));
 if(own){
  body.append(h("div",{class:"pbtns"},h("button",{class:"btn o",onclick:editProfile},"Edit profile"),h("button",{class:"btn o",onclick:()=>{if(navigator.share)navigator.share({title:"yuuuuv",text:"Find me on yuuuuv: @"+p.username,url:location.href}).catch(()=>{});else toast("Sharing not supported here")}},"Share profile")));
 }else{
  const fb=h("button",{class:"btn"+(myFollowing.has(uid)?" o":"")},myFollowing.has(uid)?"Following":"Follow");fb.onclick=()=>toggleFollow(p,fb,"btn");
  const row=h("div",{class:"pbtns"},fb);
  if(theirFr.includes(me.id))row.append(h("button",{class:"btn o",onclick:()=>chatView(p)},"Message"));
  body.append(row);
  const common=myFr.filter(x=>theirFr.includes(x));
  profs(common).then(cp=>body.insertBefore(h("div",{class:"pinfo ago"},cp.length?"Mutual friends: "+cp.map(x=>x.username).join(", "):"No mutual friends"),row));
 }
 const cont=h("div",{}),tabEls=[];
 const draw=()=>{
  tabEls.forEach(([k,e])=>{e.className="pt"+(ptab===k?" on":"")});
  cont.replaceChildren();
  const media=posts.filter(x=>x.media_url),txt=posts.filter(x=>!x.media_url);
  if(ptab==="grid")cont.append(media.length?h("div",{class:"grid"},...media.map(x=>h("img",{src:x.media_url,loading:"lazy",onclick:()=>viewPost(x)}))):h("div",{class:"empty"},"No posts yet"));
  else cont.append(...(txt.length?txt.map(x=>card(x,[],[])):[h("div",{class:"empty"},"No threads yet")]));
 };
 const pt=h("div",{class:"ptabs"},...[["grid","grid"],["txt","text"]].map(([k,i])=>{const e=h("div",{class:"pt",onclick:()=>{ptab=k;draw()}},ic(i,22));tabEls.push([k,e]);return e}));
 body.append(pt,cont);draw();
 show(own?top("@"+p.username,ib("plus",compose),ib("menu",settingsView)):btop("@"+p.username,back),body);
}
