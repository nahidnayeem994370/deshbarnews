(() => {
  const $ = (s) => document.querySelector(s);
  const status = $("#article-status"), article = $("#article");
  const config = window.NEWS_CONFIG || {};
  const ready = config.SUPABASE_URL && !config.SUPABASE_URL.includes("YOUR-PROJECT") && config.SUPABASE_ANON_KEY && !config.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
  const id = new URLSearchParams(location.search).get("id");
  let client = null;
  const esc = (v="") => String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const date = v => v ? new Intl.DateTimeFormat("bn-BD",{dateStyle:"long",timeStyle:"short"}).format(new Date(v)) : "";
  const demo = {
    "demo-1":{title:"জাতীয় সংবাদ প্রকাশের আগে তথ্য যাচাই কেন জরুরি",category:"জাতীয়",summary:"একটি দায়িত্বশীল সংবাদমাধ্যমের জন্য নির্ভরযোগ্য সূত্র, সঠিক তথ্য ও সংশোধনের স্বচ্ছ প্রক্রিয়া গুরুত্বপূর্ণ।",body:"এটি ওয়েবসাইটের নমুনা সংবাদ। বাস্তব সংবাদ প্রকাশের আগে তথ্য ও সূত্র যাচাই করুন।\n\nএকাধিক নির্ভরযোগ্য সূত্রের সঙ্গে তথ্য মিলিয়ে নিন এবং পুরোনো ছবি বা বিভ্রান্তিকর শিরোনাম ব্যবহার করবেন না।",author:"সম্পাদকীয় ডেস্ক",created_at:new Date().toISOString()},
    "demo-2":{title:"সারাদেশের খবর পাঠকের কাছে পৌঁছাতে ডিজিটাল মাধ্যমের ভূমিকা",category:"সারাদেশ",summary:"মোবাইল-ফ্রেন্ডলি ওয়েবসাইটে দ্রুত ও পরিষ্কারভাবে সংবাদ প্রকাশ পাঠকের অভিজ্ঞতা উন্নত করতে পারে।",body:"এটি একটি ডেমো পোস্ট। বাস্তব তথ্য নয়।",author:"নিজস্ব প্রতিবেদক",created_at:new Date().toISOString()},
    "demo-3":{title:"চাকরির বিজ্ঞপ্তি প্রকাশে মূল বিজ্ঞপ্তির লিংক দিন",category:"চাকরি",summary:"চাকরিপ্রার্থীদের সুবিধার জন্য আবেদনের সময়সীমা, যোগ্যতা এবং মূল বিজ্ঞপ্তির সূত্র স্পষ্টভাবে উল্লেখ করুন।",body:"এটি একটি ডেমো পোস্ট।",author:"ডেস্ক রিপোর্ট",created_at:new Date().toISOString()}
  };
  function show(n) {
    if (!n) { status.textContent="সংবাদটি পাওয়া যায়নি অথবা প্রকাশিত নয়।"; return; }
    document.title = `${n.title} | দেশবার্তা`;
    const image = n.image_url ? `<img class="article-cover" src="${esc(n.image_url)}" alt="${esc(n.title)}">` : "";
    const paragraphs = String(n.body || "").split(/\n+/).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join("");
    const isJob = n.category === "চাকরি";
    const source = n.source_url && isJob ? `<div class="apply-button-wrap"><a class="apply-button" href="${esc(n.source_url)}" rel="noopener noreferrer" target="_blank">আবেদন করুন ↗</a></div>` : (n.source_url ? `<p class="source-line">তথ্যসূত্র: <a href="${esc(n.source_url)}" rel="noopener noreferrer" target="_blank">মূল সূত্র দেখুন ↗</a></p>` : "");
    const pageUrl = window.location.href;
    const shareUrl = encodeURIComponent(pageUrl);
    const shareTitle = encodeURIComponent(n.title);
    article.innerHTML = `<div class="meta">${esc(n.category)} · ${date(n.created_at)}</div><h1>${esc(n.title)}</h1><p class="article-summary">${esc(n.summary)}</p><div class="byline">প্রতিবেদক: ${esc(n.author || "নিজস্ব প্রতিবেদক")}</div>${image}<div class="article-body">${paragraphs}</div>${source}<section class="more-news" id="more-news"><h2>আরো খবর</h2><div id="more-news-list" class="more-news-list"><p>আরো খবর লোড হচ্ছে…</p></div></section><section class="comments-box" id="comments-box"><h2>মন্তব্য করুন</h2><p class="comments-note">মন্তব্য করতে Google অ্যাকাউন্ট দিয়ে লগইন করুন। আপনার নাম Google প্রোফাইল বা ইমেইল থেকে দেখানো হবে।</p><div id="comment-auth"></div><form id="comment-form" class="comment-form" hidden><textarea id="comment-text" rows="3" maxlength="1200" required placeholder="আপনার মন্তব্য লিখুন..."></textarea><button class="btn" type="submit">মন্তব্য প্রকাশ করুন</button></form><p id="comment-status" class="comment-status" aria-live="polite"></p><div id="comment-list" class="comment-list"><p>মন্তব্য লোড হচ্ছে…</p></div></section><section class="share-box" aria-label="সংবাদ শেয়ার করুন"><strong>সংবাদটি শেয়ার করুন</strong><div class="share-actions"><button class="share-btn share-native" id="share-native" type="button">↗ শেয়ার</button><a class="share-btn share-whatsapp" href="https://wa.me/?text=${shareTitle}%20${shareUrl}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a class="share-btn share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener noreferrer">Facebook</a><button class="share-btn share-copy" id="share-copy" type="button">লিংক কপি</button></div><p class="share-feedback" id="share-feedback" aria-live="polite"></p></section><a class="back-link" href="index.html">← সব সংবাদে ফিরুন</a>`;
    status.hidden = true; article.hidden = false;
    loadMoreNews(n);
    const shareButton = $("#share-native");
    const copyButton = $("#share-copy");
    const feedback = $("#share-feedback");
    shareButton.addEventListener("click", async () => {
      if (navigator.share) {
        try { await navigator.share({title:n.title, text:n.summary || n.title, url:pageUrl}); }
        catch (error) { if (error.name !== "AbortError") feedback.textContent = "শেয়ার করা যায়নি। অন্য বাটন ব্যবহার করুন।"; }
      } else {
        feedback.textContent = "WhatsApp বা Facebook বাটন ব্যবহার করুন, অথবা লিংক কপি করুন।";
      }
    });
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pageUrl);
        feedback.textContent = "সংবাদের লিংক কপি হয়েছে।";
      } catch (error) {
        const field = document.createElement("textarea");
        field.value = pageUrl; field.setAttribute("readonly", "");
        field.style.position = "fixed"; field.style.opacity = "0";
        document.body.appendChild(field); field.select();
        const copied = document.execCommand("copy"); field.remove();
        feedback.textContent = copied ? "সংবাদের লিংক কপি হয়েছে।" : "লিংক কপি হয়নি; ব্রাউজারের ঠিকানা থেকে কপি করুন।";
      }
    });
  }
  async function loadMoreNews(current) {
    const host = $("#more-news-list");
    if (!host) return;
    let items = [];
    if (client && current.id && !String(current.id).startsWith("demo-")) {
      try {
        let query = client.from("news").select("id,title,category,summary,image_url,created_at").eq("published", true).neq("id", current.id).order("created_at", {ascending:false}).limit(20);
        const {data,error} = await query;
        if (error) throw error;
        items = data || [];
      } catch (e) {
        host.innerHTML = "<p>আরো খবর লোড করা যায়নি।</p>";
        return;
      }
    } else {
      items = Object.entries(demo).filter(([key]) => key !== current.id).map(([id,n]) => ({id,...n})).slice(0,20);
    }
    if (!items.length) {
      host.innerHTML = "<p>এখনো অন্য কোনো প্রকাশিত সংবাদ নেই।</p>";
      return;
    }
    host.innerHTML = items.map(n => `<a class="more-news-item" href="article.html?id=${encodeURIComponent(n.id)}">${n.image_url ? `<img src="${esc(n.image_url)}" alt="" loading="lazy">` : ""}<span><small>${esc(n.category || "সংবাদ")} · ${date(n.created_at)}</small><strong>${esc(n.title)}</strong></span><b aria-hidden="true">›</b></a>`).join("");
  }

  async function setupComments(newsId) {
    const authBox=$("#comment-auth"), form=$("#comment-form"), list=$("#comment-list"), feedback=$("#comment-status");
    async function refreshComments(){
      const {data:{session}}=await client.auth.getSession();
      if(session){const u=session.user;const name=u.user_metadata?.full_name||u.user_metadata?.name||u.email?.split("@")[0]||"পাঠক";authBox.innerHTML=`<p class="comment-user">লগইন করেছেন: <strong>${esc(name)}</strong> <button type="button" class="mini-btn" id="comment-logout">লগআউট</button></p>`;authBox.querySelector("#comment-logout").onclick=async()=>{await client.auth.signOut();location.reload();};form.hidden=false;}
      else {authBox.innerHTML=`<button type="button" class="btn" id="google-login">Google দিয়ে লগইন</button>`;authBox.querySelector("#google-login").onclick=async()=>{const {error}=await client.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.href}});if(error)feedback.textContent="লগইন হয়নি। Supabase-এ Google provider চালু আছে কি না দেখুন।";};form.hidden=true;}
      const {data,error}=await client.from("comments").select("id,display_name,body,created_at").eq("news_id",newsId).eq("approved",true).order("created_at",{ascending:false}).limit(100);
      if(error){list.innerHTML="<p>মন্তব্য লোড হয়নি। Supabase comments SQL সেটআপ প্রয়োজন।</p>";return;}
      list.innerHTML=data.length?data.map(c=>`<article class="comment-item"><strong>${esc(c.display_name)}</strong> <small>${date(c.created_at)}</small><p>${esc(c.body).replace(/\n/g,"<br>")}</p></article>`).join(""):"<p>এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন।</p>";
    }
    form.onsubmit=async e=>{e.preventDefault();const {data:{session}}=await client.auth.getSession();if(!session){feedback.textContent="আগে Google দিয়ে লগইন করুন।";return;}const body=$("#comment-text").value.trim();if(!body)return;const u=session.user;const name=u.user_metadata?.full_name||u.user_metadata?.name||u.email?.split("@")[0]||"পাঠক";const button=form.querySelector("button");button.disabled=true;const {error}=await client.from("comments").insert({news_id:newsId,user_id:u.id,display_name:name,body});button.disabled=false;if(error){feedback.textContent="মন্তব্য প্রকাশ হয়নি। Supabase comments SQL/RLS সেটআপ পরীক্ষা করুন।";return;}$("#comment-text").value="";feedback.textContent="মন্তব্য প্রকাশ হয়েছে।";await refreshComments();};
    await refreshComments();
  }

  async function init() {
    if (!id) { status.textContent="সংবাদ নির্বাচন করা হয়নি।"; return; }
    if (id.startsWith("demo-")) { show(demo[id]); return; }
    if (!ready || !window.supabase) { status.textContent="আসল সংবাদ দেখতে Supabase সেটআপ প্রয়োজন।"; return; }
    client=window.supabase.createClient(config.SUPABASE_URL,config.SUPABASE_ANON_KEY);
    const {data,error}=await client.from("news").select("id,title,category,summary,body,author,image_url,source_url,created_at").eq("id",id).eq("published",true).maybeSingle();
    if(error) { status.textContent="সংবাদ লোড করা যায়নি। পরে আবার চেষ্টা করুন।"; return; }
    show(data); await setupComments(data.id);
  }
  init();
})();