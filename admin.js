(() => {
  const $ = s => document.querySelector(s);
  const config = window.NEWS_CONFIG || {};
  const ready = config.SUPABASE_URL && !config.SUPABASE_URL.includes("YOUR-PROJECT") && config.SUPABASE_ANON_KEY && !config.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE") && window.supabase;
  const status=$("#admin-status"), login=$("#login-panel"), editor=$("#editor-panel"), manage=$("#manage-panel");
  let client=null, session=null;
  const esc = v => String(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function msg(text, bad=false) { status.textContent=text; status.classList.toggle("error",bad); status.hidden=false; }
  function hideAll(){login.hidden=true;editor.hidden=true;manage.hidden=true;}
  function reset(){ $("#news-form").reset(); $("#news-id").value=""; $("#author").value="নিজস্ব প্রতিবেদক"; $("#published").checked=true; $("#form-title").textContent="নতুন সংবাদ লিখুন"; }
  function showLoggedOut(){hideAll();login.hidden=false;msg("Supabase-এ লগইন করুন।");}
  async function showLoggedIn(){hideAll();editor.hidden=false;manage.hidden=false;msg("লগইন সফল। সংবাদ লিখতে বা আগের সংবাদ সম্পাদনা করতে পারবেন.");await loadNews();}
  async function loadNews(){
    const box=$("#admin-news-list"); box.innerHTML="<p>লোড হচ্ছে…</p>";
    const {data,error}=await client.from("news").select("id,title,category,published,created_at").order("created_at",{ascending:false}).limit(100);
    if(error){box.innerHTML="<p>সংবাদ লোড হয়নি। SQL/RLS নীতি পরীক্ষা করুন।</p>";return;}
    if(!data.length){box.innerHTML="<p>এখনো কোনো সংবাদ নেই।</p>";return;}
    box.innerHTML=data.map(n=>`<div class="admin-news-item"><div><strong>${esc(n.title)}</strong><small>${esc(n.category)} · ${n.published?"প্রকাশিত":"খসড়া"}</small></div><div class="admin-actions"><button class="mini-btn" data-edit="${esc(n.id)}">সম্পাদনা</button><button class="mini-btn danger" data-delete="${esc(n.id)}">মুছুন</button></div></div>`).join("");
  }
  if(!ready){hideAll();msg("প্রথমে config.js-এ Supabase Project URL ও anon key বসান, তারপর supabase/schema.sql চালান।",true);return;}
  client=window.supabase.createClient(config.SUPABASE_URL,config.SUPABASE_ANON_KEY);
  client.auth.onAuthStateChange((_event,newSession)=>{session=newSession;if(session)showLoggedIn();else showLoggedOut();});
  client.auth.getSession().then(({data})=>{session=data.session;if(session)showLoggedIn();else showLoggedOut();});
  $("#login-form").addEventListener("submit",async e=>{
    e.preventDefault(); const button=e.submitter;button.disabled=true;
    const {error}=await client.auth.signInWithPassword({email:$("#email").value.trim(),password:$("#password").value});
    button.disabled=false;if(error)msg("লগইন হয়নি। ইমেইল/পাসওয়ার্ড পরীক্ষা করুন।",true);
  });
  $("#logout").addEventListener("click",async()=>{await client.auth.signOut();reset();});
  $("#refresh").addEventListener("click",loadNews);
  $("#reset-form").addEventListener("click",reset);
  $("#news-form").addEventListener("submit",async e=>{
    e.preventDefault();if(!session){msg("সেশন শেষ হয়েছে। আবার লগইন করুন।",true);return;}
    const button=e.submitter;button.disabled=true;
    let imageUrl = $("#image-url").value.trim() || null;
    const file = $("#image-file")?.files?.[0];

if (file) {
  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
    msg("ছবি হতে হবে এবং সাইজ ৫ MB-এর কম হতে হবে।", true);
    button.disabled = false;
    return;
  }

  const ext = file.name.split(".").pop().toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${session.user.id}/${Date.now()}.${ext}`;

  const { data, error } = await client.storage
    .from("news-images")
    .upload(path, file, { contentType: file.type });

  if (error) {
    msg("ছবি আপলোড হয়নি। আবার চেষ্টা করুন।", true);
    button.disabled = false;
    return;
  }

  imageUrl = client.storage
    .from("news-images")
    .getPublicUrl(data.path).data.publicUrl;
}
    const row={title:$("#title").value.trim(),category:$("#category").value,author:$("#author").value.trim(),image_url:imageUrl,summary:$("#summary").value.trim(),body:$("#body").value.trim(),source_url:$("#source-url").value.trim()||null,featured:$("#featured").checked,published:$("#published").checked,updated_at:new Date().toISOString(),created_by:session.user.id};
    const id=$("#news-id").value;
    const result=id?await client.from("news").update(row).eq("id",id).select("id").maybeSingle():await client.from("news").insert(row).select("id").single();
    button.disabled=false;
    if(result.error){msg("সংবাদ সংরক্ষণ হয়নি। ইনপুট, লগইন এবং RLS নীতি পরীক্ষা করুন।",true);return;}
    msg("সংবাদ সংরক্ষণ হয়েছে।");reset();await loadNews();
  });
  $("#admin-news-list").addEventListener("click",async e=>{
    const edit=e.target.dataset.edit, del=e.target.dataset.delete;
    if(edit){
      const {data,error}=await client.from("news").select("*").eq("id",edit).single();
      if(error||!data){msg("সংবাদ খোলা যায়নি।",true);return;}
      $("#news-id").value=data.id;$("#title").value=data.title;$("#category").value=data.category;$("#author").value=data.author||"নিজস্ব প্রতিবেদক";$("#image-url").value=data.image_url||"";$("#summary").value=data.summary;$("#body").value=data.body;$("#source-url").value=data.source_url||"";$("#featured").checked=!!data.featured;$("#published").checked=!!data.published;$("#form-title").textContent="সংবাদ সম্পাদনা করুন";window.scrollTo({top:0,behavior:"smooth"});
    } else if(del){
      if(!confirm("এই সংবাদটি স্থায়ীভাবে মুছে ফেলবেন?"))return;
      const {error}=await client.from("news").delete().eq("id",del);
      if(error){msg("মুছে ফেলা যায়নি।",true);return;}msg("সংবাদ মুছে ফেলা হয়েছে।");await loadNews();
    }
  });
})();
