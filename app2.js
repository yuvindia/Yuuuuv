/* HOME */
let homeTab=ls.get("htab","for");
function homeView(){
 const fd=h("div",{id:"fd"}),st=h("div",{class:"stories"});
 const tabs=h("div",{class:"tabs"},...[["for","For you"],["fol","Following"]].map(([k,t])=>h("div",{class:"tb"+(homeTab===k?" on":""),onclick:()=>{homeTab=k;ls.set("htab",k);homeView()}},t)));
 show(top("yuuuuv",ib("plus",compose)),h("div",{class:"scr"},st,tabs,fd));
 const c=ls.get("feed_"+homeTab);
 if(c)renderFeed(fd,c);else fd.append(skel(3));
 loadStories(st);loadFeed(fd);
}
function renderFeed(box,d){
 box.replaceChildren();
 if(!d.ps.length){box.append(h("div",{class:"empty"},homeTab==="fol"?"Follow people in Search to see their posts here.":"No posts yet. Tap + to post."));return}
 d.ps.forEach(p=>box.append(card(p,d.lk,d.cm)));
}
async function loadFeed(box){
 let q=sb.from("posts").select("*,profiles(id,username,avatar_url,verified)").order("created_at",{ascending:false}).limit(30);
 if(homeTab==="fol")q=q.in("owner",[...myFollowing,me.id]);
 const {data:ps}=await q;
 if(!ps)return;
 const pid=ps.map(p=>p.id);
 let lk=[],cm=[];
 if(pid.length){
  const r=await Promise.all([sb.from("post_likes").select("post_id,user_id").in("post_id",pid),sb.from("comments").select("post_id").in("post_id",pid)]);
  lk=r[0].data||[];cm=r[1].data||[];
 }
 const d={ps,lk,cm};ls.set("feed_"+homeTab,d);
 if(document.body.contains(box))renderFeed(box,d);
}
function viewStories(arr,i=0){
 const g=arr[i],o=h("div",{id:"ov"},h("img",{src:g.media_url}),h("div",{class:"ovt"},(g.profiles||{}).username||""));
 o.onclick=()=>{o.remove();if(i+1<arr.length)viewStories(arr,i+1)};document.body.append(o);
}
async function loadStories(st){
 const {data}=await sb.from("glows").select("*,profiles(id,username,avatar_url,verified)").order("created_at");
 const by={};(data||[]).forEach(g=>{(by[g.owner]=by[g.owner]||[]).push(g)});
 st.replaceChildren(h("div",{class:"sb add",onclick:()=>pick(async f=>{try{toast("Uploading…");const url=await upload(f);await sb.from("glows").insert({owner:me.id,media_url:url});homeView()}catch(e){toast(e.message)}})},h("div",{class:"av"},"＋"),"Your story"));
 Object.keys(by).sort((a,b)=>a===me.id?-1:b===me.id?1:0).forEach(o=>{const pr=by[o][0].profiles||{username:"user"};st.append(h("div",{class:"sb",onclick:()=>viewStories(by[o])},av(pr),pr.username))});
}
function card(p,lk,cm){
 const pr=p.profiles||{username:"user"},mine=lk.filter(l=>l.post_id===p.id);
 let liked=mine.some(l=>l.user_id===me.id),n=mine.length,el;
 const cc=cm.filter(c=>c.post_id===p.id).length;
 const ln=h("span",{class:"cnt"},n?String(n):""),lb=h("button",{class:"ib"});
 const setL=()=>lb.replaceChildren(ic("heart",24,liked));setL();
 lb.onclick=async()=>{liked=!liked;n+=liked?1:-1;ln.textContent=n?String(n):"";setL();if(liked)await sb.from("post_likes").insert({post_id:p.id,user_id:me.id});else await sb.from("post_likes").delete().eq("post_id",p.id).eq("user_id",me.id)};
 const acts=h("div",{class:"acts"},lb,ln,ib("chat",()=>openComments(p.id)),h("span",{class:"cnt"},cc?String(cc):""),ib("share",()=>{if(navigator.share)navigator.share({title:"yuuuuv",text:p.caption||"",url:location.href}).catch(()=>{});else toast("Sharing not supported here")},22));
 const name=h("div",{class:"grow",onclick:()=>profileView(pr.id,main)},nameEl(pr),h("small",{class:"ago"}," · "+ago(p.created_at)));
 const more=p.owner===me.id?h("button",{class:"ib",onclick:async()=>{if(confirm("Delete this post?")){await sb.from("posts").delete().eq("id",p.id);el.remove()}}},"⋯"):null;
 if(!p.media_url){
  el=h("div",{class:"th"},h("div",{class:"thl"},av(pr,"mini"),h("div",{class:"line"})),h("div",{class:"thr"},h("div",{class:"top"},name,more),h("div",{class:"txt"},p.caption||""),acts));
  return el;
 }
 el=h("div",{class:"card"},h("div",{class:"top"},av(pr,"mini"),name,more),h("img",{class:"pic",src:p.media_url,loading:"lazy",decoding:"async"}),acts,p.caption?h("div",{class:"cap"},nameEl(pr)," ",p.caption):null);
 return el;
}
async function viewPost(x){
 const r=await Promise.all([sb.from("post_likes").select("post_id,user_id").eq("post_id",x.id),sb.from("comments").select("post_id").eq("post_id",x.id)]);
 sheet(card(x,r[0].data||[],r[1].data||[]));
}
function compose(){
 const ta=h("textarea",{placeholder:"What's happening?",maxlength:"500"}),prev=h("div",{});let file=null;
 const go=h("button",{class:"btn"},"Post");
 const bk=sheet(h("b",{},"New post"),ta,prev,h("button",{class:"btn o",onclick:()=>pick(f=>{file=f;prev.replaceChildren(h("img",{class:"pic",src:URL.createObjectURL(f)}))})},"Add photo"),go);
 go.onclick=async()=>{
  const t=ta.value.trim();
  if(!t&&!file)return toast("Write something or add a photo");
  go.disabled=true;go.textContent="Posting…";
  try{const url=file?await upload(file):null;const {error}=await sb.from("posts").insert({owner:me.id,media_url:url,caption:t});if(error)throw error;bk.remove();tab="home";main()}
  catch(e){toast(e.message);go.disabled=false;go.textContent="Post"}
 };
}
async function openComments(pid){
 const list=h("div",{class:"cl"},"Loading…"),inp=h("input",{placeholder:"Add a comment…"});
 const load=async()=>{const {data}=await sb.from("comments").select("*,profiles(username,verified)").eq("post_id",pid).order("created_at");list.replaceChildren(...(data||[]).map(c=>h("div",{class:"cm"},nameEl(c.profiles||{})," ",c.body,h("small",{class:"ago"}," "+ago(c.created_at)))));if(!data||!data.length)list.textContent="No comments yet"};
 sheet(h("b",{},"Comments"),list,inp,h("button",{class:"btn",onclick:async()=>{const t=inp.value.trim();if(!t)return;inp.value="";await sb.from("comments").insert({post_id:pid,user_id:me.id,body:t});load()}},"Post"));
 load();
  }
