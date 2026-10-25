(() => {
  const $ = (s) => document.querySelector(s);
  const grid = $("#news-grid"), status = $("#status"), search = $("#search");
  let allNews = [], shown = 9, activeCategory = "";
  const config = window.NEWS_CONFIG || {};
  const ready = config.SUPABASE_URL && !config.SUPABASE_URL.includes("YOUR-PROJECT") &&
    config.SUPABASE_ANON_KEY && !config.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
  $("#today").textContent = new Intl.DateTimeFormat("bn-BD", {dateStyle:"full"}).format(new Date());
  $("#year").textContent = new Date().getFullYear();

  const escapeHTML = (value="") => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const formatDate = (value) => value ? new Intl.DateTimeFormat("bn-BD",{dateStyle:"medium"}).format(new Date(value)) : "";
  const demoNews = [
    {id:"demo-1",title:"জাতীয় সংবাদ প্রকাশের আগে তথ্য যাচাই কেন জরুরি",category:"জাতীয়",summary:"একটি দায়িত্বশীল সংবাদমাধ্যমের জন্য নির্ভরযোগ্য সূত্র, সঠিক তথ্য ও সংশোধনের স্বচ্ছ প্রক্রিয়া গুরুত্বপূর্ণ।",body:"এটি ওয়েবসাইটের নমুনা সংবাদ। বাস্তব সংবাদ প্রকাশের আগে তথ্য ও সূত্র যাচাই করুন।\n\nএকাধিক নির্ভরযোগ্য সূত্রের সঙ্গে তথ্য মিলিয়ে নিন এবং পুরোনো ছবি বা বিভ্রান্তিকর শিরোনাম ব্যবহার করবেন না।",author:"সম্পাদকীয় ডেস্ক",created_at:new Date().toISOString(),featured:true},
    {id:"demo-2",title:"সারাদেশের খবর পাঠকের কাছে পৌঁছাতে ডিজিটাল মাধ্যমের ভূমিকা",category:"সারাদেশ",summary:"মোবাইল-ফ্রেন্ডলি ওয়েবসাইটে দ্রুত ও পরিষ্কারভাবে সংবাদ প্রকাশ পাঠকের অভিজ্ঞতা উন্নত করতে পারে।",body:"এটি একটি ডেমো পোস্ট। বাস্তব তথ্য নয়।",author:"নিজস্ব প্রতিবেদক",created_at:new Date(Date.now()-3600000).toISOString()},
    {id:"demo-3",title:"চাকরির বিজ্ঞপ্তি প্রকাশে মূল বিজ্ঞপ্তির লিংক দিন",category:"চাকরি",summary:"চাকরিপ্রার্থীদের সুবিধার জন্য আবেদনের সময়সীমা, যোগ্যতা এবং মূল বিজ্ঞপ্তির সূত্র স্পষ্টভাবে উল্লেখ করুন।",body:"এটি একটি ডেমো পোস্ট।",author:"ডেস্ক রিপোর্ট",created_at:new Date(Date.now()-7200000).toISOString()}
  ];
  function card(n) {
    const image = n.image_url ? `<img src="${escapeHTML(n.image_url)}" alt="" loading="lazy" onerror="this.parentElement.classList.add('no-image');this.remove()">` : "";
    return `<article class="news-card ${n.featured ? "featured" : ""}"><a class="card-image ${n.image_url ? "" : "no-image"}" href="article.html?id=${encodeURIComponent(n.id)}">${image}<span>${escapeHTML(n.category)}</span></a><div class="card-content"><div class="meta">${escapeHTML(n.category)} <span>•</span> ${formatDate(n.created_at)}</div><h2><a href="article.html?id=${encodeURIComponent(n.id)}">${escapeHTML(n.title)}</a></h2><p>${escapeHTML(n.summary)}</p><div class="card-bottom"><span>${escapeHTML(n.author || "নিজস্ব প্রতিবেদক")}</span><a href="article.html?id=${encodeURIComponent(n.id)}" aria-label="সম্পূর্ণ সংবাদ পড়ুন">পড়ুন →</a></div></div></article>`;
  }
  function render() {
    const q = search.value.trim().toLocaleLowerCase("bn");
    const items = allNews.filter(n => (!activeCategory || n.category === activeCategory) &&
      (!q || `${n.title} ${n.summary} ${n.category} ${n.body || ""}`.toLocaleLowerCase("bn").includes(q)));
    grid.innerHTML = items.slice(0,shown).map(card).join("");
    status.hidden = items.length > 0;
    if (!items.length) status.textContent = "এই খোঁজে কোনো সংবাদ পাওয়া যায়নি।";
    $("#load-more").hidden = items.length <= shown;
    $("#section-title").textContent = activeCategory || (q ? "খোঁজের ফলাফল" : "সর্বশেষ সংবাদ");
    $("#ticker").textContent = allNews[0] ? allNews[0].title : "দেশবার্তায় স্বাগতম — যাচাইকৃত তথ্য ও নিজস্ব সংবাদ প্রকাশ করুন।";
  }
  async function init() {
    if (!ready || !window.supabase) {
      allNews = demoNews;
      status.textContent = "এটি ডেমো মোড। আসল সংবাদ দেখাতে config.js-এ Supabase Project URL ও anon key বসিয়ে SQL সেটআপ করুন।";
      status.hidden = false; render(); return;
    }
    try {
      const client = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
      const {data,error} = await client.from("news").select("id,title,category,summary,body,author,image_url,source_url,featured,created_at").eq("published",true).order("created_at",{ascending:false}).limit(100);
      if (error) throw error;
      allNews = data || [];
      if (!allNews.length) { status.textContent = "এখনো কোনো সংবাদ প্রকাশ করা হয়নি।"; status.hidden = false; }
      render();
    } catch (e) {
      allNews = demoNews; render();
      status.textContent = "সংবাদ সার্ভারে সংযোগ হয়নি। Supabase URL, key, SQL ও RLS সেটিংস পরীক্ষা করুন। ডেমো সংবাদ দেখানো হচ্ছে।";
      status.hidden = false;
    }
  }
  search.addEventListener("input", () => { shown=9; render(); });
  document.querySelectorAll("[data-category]").forEach(a => a.addEventListener("click", e => {
    e.preventDefault(); activeCategory = a.dataset.category; shown=9; render();
    window.scrollTo({top:document.querySelector(".main").offsetTop,behavior:"smooth"});
  }));
  $("#load-more").addEventListener("click", () => { shown+=9; render(); });
  init();
})();