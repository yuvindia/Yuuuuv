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
 app.replaceChildren(top("New password"),h("div",{class:"pad"},p,h("button",{class:"btn",onclick:async()=>{const {error}=await sb.auth.updateUser({password:p.value});if(error)return toast(error.message);location.href=location.pathname}},"Save password")));
}
function authView(msg=""){
 leave();
 const u=h("input",{placeholder:"Username (new accounts)"}),e=h("input",{type:"email",placeholder:"Email"}),p=h("input",{type:"password",placeholder:"Password (6+ characters)"});
 app.replaceChildren(h("div",{class:"pad auth"},h("div",{class:"biglogo"},"yuuuuv"),h("div",{class:"tag"},"Chat, stories and reels with your friends"),u,e,p,h("div",{class:"err"},msg),
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
 const tabs=[["home","home"],["fliq","fliq"],["chats","chat"],["search","search"],["profile","user"]];
 app.replaceChildren(h("div",{id:"v"}),h("nav",{},...tabs.map(([k,i])=>h("button",{class:tab===k?"on":"",onclick:()=>{tab=k;main()}},ic(i,26)))));
 ({home:homeView,fliq:fliqView,chats:chatsView,search:searchView,profile:()=>profileView(me.id)})[tab]();
}
const show=(...n)=>$("#v").replaceChildren(...n);
