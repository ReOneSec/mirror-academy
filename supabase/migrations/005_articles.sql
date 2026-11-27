-- 005: Articles (exam patterns, syllabi, guides). Safe to run more than once.
-- Admins write articles from /admin (server API, service role). Anyone can read published ones.

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  category text CHECK (category IS NULL OR char_length(category) <= 60),
  summary text CHECK (summary IS NULL OR char_length(summary) <= 400),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 30000),
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS articles_list_idx ON articles (published, created_at DESC);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published articles" ON articles;
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- First article: WBPSC Clerkship exam pattern and syllabus. Added only once.
INSERT INTO articles (slug, title, category, summary, body)
VALUES (
  'wbpsc-clerkship-exam-pattern-syllabus',
  'ক্লার্কশিপ পরীক্ষা, ২০২৪: পরীক্ষার ধারা ও সিলেবাস',
  'সিলেবাস',
  'পাবলিক সার্ভিস কমিশন, পশ্চিমবঙ্গ ক্লার্কশিপ পরীক্ষার পার্ট-I ও পার্ট-II এর নম্বর, সময় এবং বিষয়ভিত্তিক সিলেবাস।',
  $art$𒊹︎︎︎পাবলিক সার্ভিস কমিশন, পশ্চিমবঙ্গ*
*𒊹︎︎︎ক্লার্কশিপ পরীক্ষা, ২০২৪*
*বিজ্ঞপ্তি নং - ১২/২০২৪*
*পরীক্ষার ধারা ও সিলেবাস*

*পরীক্ষার ধারা:*

*১.* পরীক্ষাটি দুটি ভাগে হবে, যথা — i) পার্ট-I (অবজেক্টিভ টাইপ) ii) পার্ট-II (কনভেনশনাল টাইপ - লিখিত)।

*পার্ট-I পরীক্ষা:*
পার্ট-I-এ মোট *১০০ নম্বরের ১০০টি প্রশ্ন* থাকবে, প্রতিটি প্রশ্নে *১ নম্বর* করে। এতে থাকবে ইংরেজি (৩০ নম্বর), জেনারেল স্টাডিজ (৪০ নম্বর) এবং পাটিগণিত (৩০ নম্বর) এর মাল্টিপল চয়েস, অবজেক্টিভ টাইপ প্রশ্ন। পরীক্ষার সময় থাকবে *১ ঘণ্টা ৩০ মিনিট*।

*পার্ট-II পরীক্ষা:*
পার্ট-II-তে কনভেনশনাল টাইপ প্রশ্ন থাকবে — ক) গ্রুপ-A : ইংরেজি খ) গ্রুপ-B : বাংলা / হিন্দি / উর্দু / নেপালি / সাঁওতালি। গ্রুপ-A এবং গ্রুপ-B প্রতিটিতে *৫০ নম্বর* করে থাকবে। পার্ট-II পরীক্ষার সময় থাকবে *১ ঘণ্টা*।

*২.* প্রার্থীদের কম্পিউটার চালানোর প্রাথমিক জ্ঞান এবং কম্পিউটারে টাইপিং করার ক্ষমতা শুধুমাত্র পার্ট-I এবং পার্ট-II-এ উত্তীর্ণ হওয়ার পরেই যাচাই করা হবে।

---

### *পরীক্ষার সিলেবাস*

*পার্ট-I :*

*ইংরেজি :* ইংরেজি ভাষার মৌলিক বিষয় যেমন শব্দভান্ডার (Vocabulary), ব্যাকরণ (Grammar), বাক্য গঠন (Sentence Structure), সমার্থক শব্দ (Synonyms), বিপরীত শব্দ (Antonyms) এবং সঠিক ব্যবহার ইত্যাদি।

*জেনারেল স্টাডিজ :* দৈনন্দিন পর্যবেক্ষণের বিষয় যেমন দৈনন্দিন বিজ্ঞান, কারেন্ট অ্যাফেয়ার্স এবং ভারতের সমস্যা, বিশেষ করে ভারতীয় ইতিহাস এবং ভারতীয় ভূগোল সম্পর্কে প্রাথমিক জ্ঞান।

*পাটিগণিত :* বিভাজ্যতা (Divisibility), ভগ্নাংশ (Fractions), দশমিক (Decimals), আবৃত্ত দশমিক (Recurring Decimals), সরলীকরণ (Simplification), ল.সা.গু ও গ.সা.গু (HCF, LCM), অংশীদারি (Partnership), গড় (Average), অনুপাত ও সমানুপাত (Ratio and Proportions), শতকরা (Percentage), সরল সুদ (Simple Interest), লাভ ও ক্ষতি (Profit & Loss), সময় ও দূরত্ব (Time & Distance), আয়তক্ষেত্রের ক্ষেত্রফল (Area of Rectangles) এবং বর্গ (Squares)।

*পার্ট-II :*

*গ্রুপ-A : ইংরেজি*
ক) দেওয়া পয়েন্ট বা তথ্য থেকে ইংরেজিতে একটি রিপোর্টের খসড়া তৈরি করা;
খ) একটি গদ্যাংশের সংক্ষিপ্তকরণ (সামারি / প্রেসি);
গ) বাংলা / হিন্দি / উর্দু / নেপালি / সাঁওতালি থেকে, যেমনটা প্রযোজ্য, ইংরেজিতে অনুবাদ করা।

*গ্রুপ-B : বাংলা / হিন্দি / উর্দু / নেপালি / সাঁওতালি*
ক) দেওয়া পয়েন্ট বা তথ্য থেকে একটি রিপোর্টের খসড়া তৈরি করা;
খ) একটি গদ্যাংশের সংক্ষিপ্তকরণ (সামারি / প্রেসি);
গ) ইংরেজি থেকে বাংলা / হিন্দি / উর্দু / নেপালি / সাঁওতালি তে, যেমনটা প্রযোজ্য, অনুবাদ করা।

পরীক্ষার মান পশ্চিমবঙ্গ মধ্যশিক্ষা পর্ষদের মাধ্যমিক পরীক্ষার সমতুল্য হবে।$art$
)
ON CONFLICT (slug) DO NOTHING;
