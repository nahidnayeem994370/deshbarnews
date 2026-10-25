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
    article.innerHTML = `<div class="meta">${esc(n.category)} · ${date(n.created_at)}</div><h1>${esc(n.title)}</h1><p class="article-summary">${esc(n.summary)}</p><div class="byline">প্রতিবেদক: ${esc(n.author || "নিজস্ব প্রতিবেদক")}</div>${image}<div class="article-body">${paragraphs}</div>${source}<a class="back-link" href="index.html">← সব সংবাদে ফিরুন</a>`;
    status.hidden = true; article.hidden = false;
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