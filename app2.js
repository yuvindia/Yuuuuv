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
