(() => {
  const $ = (s) => document.querySelector(s);
  const status = $("#article-status"), article = $("#article");
  const config = window.NEWS_CONFIG || {};
  const ready = config.SUPABASE_URL && !config.SUPABASE_URL.includes("YOUR-PROJECT") && config.SUPABASE_ANON_KEY && !config.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
  const id = new URLSearchParams(location.search).get("id");
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
    const source = n.source_url ? `<p class="source-line">তথ্যসূত্র: <a href="${esc(n.source_url)}" rel="noopener noreferrer" target="_blank">মূল সূত্র দেখুন ↗</a></p>` : "";
    const pageUrl = window.location.href;
    const shareUrl = encodeURIComponent(pageUrl);
    const shareTitle = encodeURIComponent(n.title);
    article.innerHTML = `<div class="meta">${esc(n.category)} · ${date(n.created_at)}</div><h1>${esc(n.title)}</h1><p class="article-summary">${esc(n.summary)}</p><div class="byline">প্রতিবেদক: ${esc(n.author || "নিজস্ব প্রতিবেদক")}</div>${image}<div class="article-body">${paragraphs}</div>${source}<section class="share-box" aria-label="সংবাদ শেয়ার করুন"><strong>সংবাদটি শেয়ার করুন</strong><div class="share-actions"><button class="share-btn share-native" id="share-native" type="button">↗ শেয়ার</button><a class="share-btn share-whatsapp" href="https://wa.me/?text=${shareTitle}%20${shareUrl}" target="_blank" rel="noopener noreferrer">WhatsApp</a><a class="share-btn share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener noreferrer">Facebook</a><button class="share-btn share-copy" id="share-copy" type="button">লিংক কপি</button></div><p class="share-feedback" id="share-feedback" aria-live="polite"></p></section><a class="back-link" href="index.html">← সব সংবাদে ফিরুন</a>`;
    status.hidden = true; article.hidden = false;
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
  async function init() {
    if (!id) { status.textContent="সংবাদ নির্বাচন করা হয়নি।"; return; }
    if (id.startsWith("demo-")) { show(demo[id]); return; }
    if (!ready || !window.supabase) { status.textContent="আসল সংবাদ দেখতে Supabase সেটআপ প্রয়োজন।"; return; }
    const client=window.supabase.createClient(config.SUPABASE_URL,config.SUPABASE_ANON_KEY);
    const {data,error}=await client.from("news").select("id,title,category,summary,body,author,image_url,source_url,created_at").eq("id",id).eq("published",true).maybeSingle();
    if(error) { status.textContent="সংবাদ লোড করা যায়নি। পরে আবার চেষ্টা করুন।"; return; }
    show(data);
  }
  init();
})();