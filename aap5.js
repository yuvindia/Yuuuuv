/* SETTINGS */
async function listView(title,list,back){
 const box=h("div",{class:"pad"},skel(3));
 show(btop(title,back),box);
 const ps=await profs(list);
 box.replaceChildren(...ps.map(p=>personRow(p,()=>listView(title,list,back))));
 if(!ps.length)box.append(h("div",{class:"empty"},"Nobody yet"));
}
function settingsView(){
 const toProf=()=>{tab="profile";main()};
 const row=(t,s,fn)=>h("div",{class:"sr",onclick:fn},h("div",{class:"grow"},t,s?h("small",{},s):null),fn?ic("chev",20):null);
 const theme=localStorage.getItem("theme")||"dark",cc=localStorage.getItem("chatc")||"mono";
 const seg=h("div",{class:"seg"},...[["dark","Dark"],["light","Light"],["system","System"]].map(([k,t])=>h("button",{class:theme===k?"on":"",onclick:()=>{localStorage.setItem("theme",k);applyTheme();settingsView()}},t)));
 const dots=h("div",{class:"dots"},...CHC.map(c=>h("div",{class:"dot"+(cc===c?" on":""),style:"background:"+CHV[c],onclick:()=>{localStorage.setItem("chatc",c);applyTheme();settingsView()}})));
 const keep=h("select",{onchange:async e=>{prof.keep_ms=+e.target.value;await sb.from("profiles").update({keep_ms:prof.keep_ms}).eq("id",me.id);toast("Saved")}},...Object.entries(KEEP).map(([v,t])=>{const o=h("option",{value:v},t);if(String(prof.keep_ms||0)===v)o.selected=true;return o}));
 show(btop("Settings",toProf),h("div",{class:"scr pad"},
  h("h3",{},"Account"),row("Edit profile","Photo, username, bio",editProfile),
  h("h3",{},"Appearance"),seg,
  h("h3",{},"Chat colour"),dots,
  h("h3",{},"Disappearing messages"),keep,
  h("h3",{},"Privacy"),row("Followers list","Only you can see who follows you"),
  h("h3",{},"About"),row("yuuuuv","Version 4"),
  h("button",{class:"btn o",style:"margin-top:16px",onclick:()=>sb.auth.signOut()},"Log out")));
}
function editProfile(){
 const un=h("input",{value:prof.username||"",placeholder:"Username"}),bio=h("input",{maxlength:"100",placeholder:"Bio",value:prof.bio||""});
 const pic=h("div",{style:"text-align:center;margin:10px 0"},av(prof,"xl"));
 show(btop("Edit profile",settingsView),h("div",{class:"scr pad"},pic,
  h("button",{class:"btn o",onclick:()=>pick(async f=>{try{toast("Uploading…");const url=await upload(f);const {error}=await sb.from("profiles").update({avatar_url:url}).eq("id",me.id);if(error)throw error;prof.avatar_url=url;editProfile()}catch(e){toast(e.message)}})},"Change photo"),
  h("h3",{},"Username"),un,h("h3",{},"Bio"),bio,
  h("button",{class:"btn",onclick:async()=>{
   const name=un.value.trim().toLowerCase().replace(/[^a-z0-9_]/g,"");
   if(name.length<3)return toast("Username needs 3+ letters or numbers");
   const {error}=await sb.from("profiles").update({username:name,bio:bio.value.trim()}).eq("id",me.id);
   if(error)return toast(error.code==="23505"?"Username taken":error.message);
   prof.username=name;prof.bio=bio.value.trim();toast("Saved");settingsView();
  }},"Save")));
}
