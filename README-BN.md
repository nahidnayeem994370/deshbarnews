# দেশবার্তা — বাংলা নিউজ ওয়েবসাইট স্টার্টার

এটি একটি responsive news website starter. Android ফোন থেকেও ফাইলগুলো GitHub-এ আপলোড করে সেটআপ করা যাবে।

## ফাইলের পরিচিতি
- `index.html` — হোমপেজ
- `article.html` — সম্পূর্ণ সংবাদ পেজ
- `admin.html` — লগইন, সংবাদ লেখা/সম্পাদনা/মুছে ফেলার প্যানেল
- `styles.css` — মোবাইল-ফ্রেন্ডলি ডিজাইন
- `app.js`, `article.js`, `admin.js` — সাইটের কার্যক্রম
- `config.js` — Supabase Project URL ও public anon key
- `supabase/schema.sql` — ডেটাবেস ও Row Level Security নীতি

## সেটআপ (মোবাইল দিয়ে)

### ১. Supabase প্রজেক্ট
1. https://supabase.com এ অ্যাকাউন্ট খুলুন এবং নতুন project তৈরি করুন।
2. Dashboard > SQL Editor-এ `supabase/schema.sql` ফাইলের SQL পেস্ট করে Run করুন।
3. Authentication settings-এ public sign-ups বন্ধ রাখুন।
4. Authentication > Users থেকে নিজের অ্যাডমিন ইউজার তৈরি করুন।
5. Project Settings > API থেকে Project URL ও `anon`/publishable key কপি করুন।
6. `config.js`-এ `SUPABASE_URL` ও `SUPABASE_ANON_KEY`-এর জায়গায় নিজের তথ্য বসান।

**গুরুত্বপূর্ণ:** `service_role` বা secret key কখনো `config.js`, HTML, JavaScript বা GitHub public repository-তে রাখবেন না।

### ২. GitHub-এ কোড রাখুন
1. https://github.com এ একটি repository তৈরি করুন।
2. এই ZIP-এর ফাইলগুলো extract করে repository-র root-এ আপলোড করুন।
3. `supabase` ফোল্ডারসহ সব ফাইল আপলোড হয়েছে নিশ্চিত করুন।

### ৩. Cloudflare Pages-এ প্রকাশ
1. https://dash.cloudflare.com এ সাইন আপ/লগইন করুন।
2. Workers & Pages > Create > Pages > Connect to Git বেছে GitHub repository সংযুক্ত করুন।
3. Static HTML site হলে build command ফাঁকা রাখুন এবং output directory `/` বা repository root নির্দেশনা অনুযায়ী সেট করুন।
4. Deploy করুন। সফল হলে Cloudflare একটি `pages.dev` ঠিকানা দেবে।
5. URL খুলে হোমপেজ ও `/admin.html` পরীক্ষা করুন।

Cloudflare dashboard-এর UI বদলাতে পারে; বর্তমান নির্দেশনা দেখুন:
https://developers.cloudflare.com/pages/

## প্রথম সংবাদ প্রকাশ
- `/admin.html` খুলুন।
- Supabase-এ তৈরি করা admin email/password দিয়ে লগইন করুন।
- শিরোনাম, বিভাগ, সংক্ষিপ্ত বিবরণ, পূর্ণ সংবাদ, লেখক ও সোর্স দিন।
- `প্রকাশ করুন` চেক করে সংরক্ষণ করুন।

## নিরাপত্তা সম্পর্কে
এই starter-এর SQL নীতিগুলো সাধারণ public-facing setup-এর জন্য প্রাথমিক উদাহরণ। Public sign-up অবশ্যই বন্ধ রাখুন। যেহেতু যেকোনো authenticated account-এর insert policy থাকতে পারে, শুধুমাত্র নিজের নিয়ন্ত্রিত admin account তৈরি করুন। একাধিক সম্পাদক যোগ করার আগে private admin-role table এবং role-based RLS policies তৈরি ও পরীক্ষা করুন। Production-এ ব্যবহারের আগে একজন অভিজ্ঞ ডেভেলপার দিয়ে security review করানো ভালো।

## SEO ও সংবাদ নীতি
- প্রতিটি সংবাদ নিজস্ব ভাষায় লিখুন এবং তথ্যসূত্র উল্লেখ করুন।
- অন্য সংবাদমাধ্যমের সম্পূর্ণ লেখা বা ছবি অনুমতি ছাড়া কপি করবেন না।
- পরে প্রতিটি সংবাদে Open Graph/meta tags, canonical URL, sitemap ও structured data যোগ করুন।
- এই starter-এ দেখানো নমুনা সংবাদগুলো কেবল demo; বাস্তব খবর নয়।
