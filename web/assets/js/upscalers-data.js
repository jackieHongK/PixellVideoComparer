/**
 * Commercial video upscaler / enhancer database.
 *
 * Schema:
 *   name        : string (product name)
 *   vendor      : string (company / publisher) — optional
 *   hq          : string (vendor headquarters country / region)
 *   url         : string (product page URL)
 *   type        : string[] of "web" | "desktop" | "mobile" | "plugin" | "sdk"
 *   os          : string[] of "Windows" | "macOS" | "Linux" | "iOS" | "Android" | "Browser" | "Cloud"
 *   category    : "Dedicated upscaler" | "NLE feature" | "Restoration suite" |
 *                 "Driver / OS-level" | "SDK / API" | "Generative + upscale"
 *                  — distinguishes a purpose-built upscaler from a feature inside
 *                    a larger product (e.g. DaVinci's Super Scale).
 *   priceTier   : "free" | "freemium" | "paid"
 *   price       : human-readable headline
 *   priceDetail : optional secondary line
 *   summary     : one-line description for the table
 *   tags        : string[] (extra search terms)
 *
 * Inclusion rule (post-cleanup, 2026-05):
 *   - Must offer a video-upscaling product OR a discrete video-upscaling FEATURE.
 *   - Pure text-to-video / image-to-video generators (Sora, Veo, Pika, Luma,
 *     Kling, Hailuo, Vidu, Higgsfield, Firefly Video) are excluded — their
 *     "upscale" stage is just a final-resolution render, not a stand-alone
 *     enhancement tool. Same for avatar generators (D-ID, Synthesia, Vidnoz).
 */

window.DATA_LAST_VERIFIED = '2026-05-24';

window.UPSCALERS = [
  // ============================================================
  // Dedicated desktop upscalers
  // ============================================================
  {
    name: 'Topaz Video AI',
    vendor: 'Topaz Labs',
    hq: 'USA · Dallas, TX',
    url: 'https://www.topazlabs.com/topaz-video-ai',
    type: ['desktop'],
    os: ['Windows', 'macOS'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: '$299 perpetual',
    priceDetail: 'or $199 / yr renewal · 30-day free trial',
    summary: 'Industry-leading desktop upscaler & frame-rate up-converter using Proteus / Iris / Artemis / Apollo / Chronos models. Batch-friendly, supports up to 8K, ProRes / DNxHR encode.',
    tags: ['proteus', 'iris', 'artemis', 'apollo', 'chronos', 'sharpen', 'denoise', 'interpolate']
  },
  {
    name: 'AVCLabs Video Enhancer AI',
    vendor: 'AVCLabs',
    hq: 'China',
    url: 'https://www.avclabs.com/video-enhancer-ai.html',
    type: ['desktop'],
    os: ['Windows', 'macOS'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: '$39.95 / month',
    priceDetail: '$119.95 / yr · $299.90 lifetime · 30-day refund',
    summary: 'Deep-learning upscaler with face-refinement & colorize modes; supports up to 8K, BlurArmor / Multi-Frame engines.',
    tags: ['blurarmor', 'multi-frame', 'face enhance', 'colorize']
  },
  {
    name: 'DVDFab Video Enhancer AI',
    vendor: 'DVDFab',
    hq: 'China · Beijing',
    url: 'https://www.dvdfab.cn/video-enhancer-ai.htm',
    type: ['desktop'],
    os: ['Windows', 'macOS'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: '$79.99 / yr',
    priceDetail: 'bundled in DVDFab AI suite · lifetime $159.99',
    summary: 'Part of DVDFab\'s AI suite. Upscales SD / HD → 4K, denoise + sharpen + interpolation; geared toward upscaling DVD / Blu-ray rips.',
    tags: ['dvd', 'bluray', 'sd to 4k', 'interpolation']
  },
  {
    name: 'HitPaw Video Enhancer',
    vendor: 'HitPaw (Wangxu Tech)',
    hq: 'China · Shenzhen',
    url: 'https://www.hitpaw.com/hitpaw-video-enhancer.html',
    type: ['desktop'],
    os: ['Windows', 'macOS'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: '$42.99 / month',
    priceDetail: '$54.99 / yr · $99.99 lifetime',
    summary: 'GUI-friendly AI upscaler with face / colorize / general / animation models. Targets casual users with batch UI.',
    tags: ['anime', 'face', 'colorize', 'general']
  },
  {
    name: 'Aiseesoft AI Video Upscaler',
    vendor: 'Aiseesoft Studio',
    hq: 'China',
    url: 'https://www.aiseesoft.com/video-enhancer/',
    type: ['desktop'],
    os: ['Windows', 'macOS'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: '$29.96 / yr',
    priceDetail: '$45 lifetime · 30-day refund',
    summary: 'Light desktop enhancer: upscale + denoise + brightness / contrast tweaks; aimed at consumer / quick-fix workflows.',
    tags: ['cheap', 'consumer', 'brightness']
  },
  {
    name: 'VideoProc Converter AI',
    vendor: 'Digiarty Software',
    hq: 'China · Chengdu',
    url: 'https://www.videoproc.com/video-process/',
    type: ['desktop'],
    os: ['Windows', 'macOS'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: '$25.95 / yr',
    priceDetail: '$45.95 lifetime · 30-day refund',
    summary: 'Converter + upscaler with GAN / SR models and Real-ESRGAN-style inference; popular for casual upscaling at moderate price.',
    tags: ['converter', 'gan', 'consumer']
  },
  {
    name: 'WinxVideo AI',
    vendor: 'Digiarty Software',
    hq: 'China · Chengdu',
    url: 'https://www.winxdvd.com/winxvideo-ai/',
    type: ['desktop'],
    os: ['Windows', 'macOS'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: '$25.95 / yr',
    priceDetail: '$45.95 lifetime',
    summary: 'Sibling to VideoProc — combined upscaler, frame-rate up-converter, AI denoise, stabilizer. Same engine, different UX.',
    tags: ['digiarty', 'denoise', 'stabilize']
  },
  {
    name: 'WonderFox HD Video Converter Factory Pro',
    vendor: 'WonderFox Soft',
    hq: 'China',
    url: 'https://www.videoconverterfactory.com/hd-video-converter/',
    type: ['desktop'],
    os: ['Windows'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: '$29.95 / yr',
    priceDetail: '$39.95 lifetime',
    summary: 'Long-running Windows-only converter with AI upscale module; aimed at older Windows users / less GPU-aggressive workflows.',
    tags: ['windows only', 'converter', 'legacy']
  },
  {
    name: 'Letasoft Video Upscaler',
    vendor: 'Letasoft',
    hq: 'Russia / Cyprus',
    url: 'https://www.letasoft.com/',
    type: ['desktop'],
    os: ['Windows'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: '$29.95 lifetime',
    priceDetail: 'one-time license, no subscription',
    summary: 'Lightweight low-cost Windows upscaler; older-style classical interpolation rather than deep learning. Distributed via micro-license.',
    tags: ['lightweight', 'classical', 'cheap']
  },
  {
    name: 'Movavi Video Editor AI',
    vendor: 'Movavi',
    hq: 'Cyprus · Limassol',
    url: 'https://www.movavi.com/video-quality-enhancer/',
    type: ['desktop'],
    os: ['Windows', 'macOS'],
    category: 'NLE feature',
    priceTier: 'paid',
    price: '$54.95 / yr',
    priceDetail: '$94.95 lifetime',
    summary: 'NLE with built-in AI upscaler, BG-removal, motion tracking. Geared at casual / YouTuber market.',
    tags: ['nle', 'consumer']
  },

  // ============================================================
  // Dedicated web / cloud upscalers
  // ============================================================
  {
    name: 'Pixop',
    vendor: 'Pixop Aps',
    hq: 'Denmark · Copenhagen',
    url: 'https://www.pixop.com/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: '$0.40 / minute (1080p)',
    priceDetail: 'pay-as-you-go · enterprise / API plans available',
    summary: 'Pure-cloud AI upscaler & restorer. Pixop Super Resolution, Deep Restoration, Pixop Detail Generator; broadcast-oriented (10-bit 4:2:2 ProRes I/O).',
    tags: ['cloud', 'broadcast', 'prores', 'super resolution', 'restoration']
  },
  {
    name: 'Tensorpix',
    vendor: 'Tensorpix d.o.o.',
    hq: 'Croatia · Zagreb',
    url: 'https://tensorpix.ai/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free 5 min / mo',
    priceDetail: 'paid plans from $20 / mo',
    summary: 'Browser upscaler + frame interpolator + denoiser; runs entirely on Tensorpix servers, no install.',
    tags: ['interpolation', 'denoise', 'team', 'cloud']
  },
  {
    name: 'Cutout.pro Video Enhancer',
    vendor: 'HiCloud / Cutout.pro',
    hq: 'China · Hangzhou',
    url: 'https://www.cutout.pro/ai-video-enhancer',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free trial · $9.99 / mo basic',
    priceDetail: 'credit-based · API available',
    summary: 'AI photo + video upscaler with API. Targeted at e-commerce / marketing teams; integrated with their cutout / background-removal stack.',
    tags: ['api', 'ecommerce', 'background removal']
  },
  {
    name: 'VanceAI Video Enhancer',
    vendor: 'VanceAI',
    hq: 'China',
    url: 'https://video.vanceai.com/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free credits · $9.90 / mo',
    priceDetail: 'API plans available',
    summary: 'Photo-first AI enhance brand expanded to video. Pure cloud, predictable credit model, API access.',
    tags: ['credits', 'api']
  },
  {
    name: 'Media.io AI Video Enhancer',
    vendor: 'Wondershare',
    hq: 'China · Shenzhen',
    url: 'https://www.media.io/ai/ai-tools/video-enhancer',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free trial · $5.99 / mo',
    priceDetail: 'credit pack pricing',
    summary: 'Wondershare\'s SaaS arm. Browser upscaler + denoiser + color-corrector; integrates with the Wondershare account / subscription tree.',
    tags: ['wondershare', 'saas']
  },
  {
    name: 'TopMediai Video Enhancer',
    vendor: 'TopMediai',
    hq: 'China',
    url: 'https://www.topmediai.com/app/video-enhancer/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free trial · $9.99 / mo',
    priceDetail: '$99 / yr',
    summary: 'Browser-only enhancer aimed at quick fixes; bundled with TopMediai\'s text-to-speech & voice cloner stack.',
    tags: ['quick fix', 'voice clone bundle']
  },
  {
    name: 'Fotor AI Video Enhancer',
    vendor: 'Everimaging Ltd.',
    hq: 'China · Chengdu',
    url: 'https://www.fotor.com/features/video-enhancer.html',
    type: ['web', 'desktop'],
    os: ['Windows', 'macOS', 'Browser'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free trial · Pro $8.99 / mo',
    priceDetail: 'Pro+ $19.99 / mo',
    summary: 'Photo-first editor extended to video upscale / denoise / colorize. Subscription includes both photo & video tools.',
    tags: ['photo first', 'consumer']
  },
  {
    name: 'GoEnhance AI',
    vendor: 'GoEnhance',
    hq: 'USA · Bay Area',
    url: 'https://www.goenhance.ai/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free credits · Pro $14 / mo',
    priceDetail: 'business $32 / mo',
    summary: 'Stylized video upscaler with AnimateDiff-style enhancement modes; popular for anime / illustration motion graphics.',
    tags: ['anime', 'stylize', 'animatediff']
  },
  {
    name: 'Magnific AI (Video Beta)',
    vendor: 'Magnific',
    hq: 'Spain · Barcelona',
    url: 'https://magnific.ai/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: '$39 / mo',
    priceDetail: 'Pro $99 / mo · Premium $299 / mo',
    summary: 'Photo upscaler famous for hallucination-style detail; expanding into video. Pricey but distinctive look.',
    tags: ['generative detail', 'high detail']
  },

  // ============================================================
  // NLE / Editor features (upscale is one of many tools)
  // ============================================================
  {
    name: 'Adobe Premiere Pro — Enhance Detail / Super Resolution',
    vendor: 'Adobe',
    hq: 'USA · San Jose, CA',
    url: 'https://www.adobe.com/products/premiere.html',
    type: ['desktop'],
    os: ['Windows', 'macOS'],
    category: 'NLE feature',
    priceTier: 'paid',
    price: '$22.99 / mo (Premiere only)',
    priceDetail: 'CC All Apps $59.99 / mo · included in CC',
    summary: 'Native AI features inside Premiere Pro: Detail Enhance, Enhance Speech, super-resolution effects via Neural Filters. Production-pipeline integrated.',
    tags: ['adobe cc', 'premiere', 'neural filters', 'enhance detail']
  },
  {
    name: 'DaVinci Resolve — Super Scale',
    vendor: 'Blackmagic Design',
    hq: 'Australia · Melbourne',
    url: 'https://www.blackmagicdesign.com/products/davinciresolve',
    type: ['desktop'],
    os: ['Windows', 'macOS', 'Linux'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free · Studio $295 perpetual',
    priceDetail: 'Studio adds higher-quality Super Scale algorithm',
    summary: 'NLE / color grading suite with built-in Super Scale (2×/3×/4×) and AI-powered enhancement in the Studio version. Cross-platform.',
    tags: ['nle', 'color grading', 'super scale', 'studio']
  },
  {
    name: 'CapCut Upscale',
    vendor: 'ByteDance',
    hq: 'China · Beijing',
    url: 'https://www.capcut.com/',
    type: ['desktop', 'web', 'mobile'],
    os: ['Windows', 'macOS', 'iOS', 'Android', 'Browser'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free · Pro $9.99 / mo',
    priceDetail: 'AI features require Pro on some platforms',
    summary: 'Consumer video editor with AI upscale, face refinement, colorize, motion smoothing; same app across desktop / web / mobile.',
    tags: ['bytedance', 'consumer', 'tiktok', 'creator']
  },
  {
    name: 'VEED.io AI Upscaler',
    vendor: 'VEED.io',
    hq: 'UK · London',
    url: 'https://www.veed.io/tools/video-enhancer',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free preview · $12 / mo Basic',
    priceDetail: 'Pro $24 / mo · Business $59 / mo',
    summary: 'Online video editor with AI upscale tool. Browser-only, instant; integrates with their subtitle / translation pipeline.',
    tags: ['online editor', 'subtitles', 'translate']
  },
  {
    name: 'Clipchamp Enhance',
    vendor: 'Microsoft',
    hq: 'USA · Redmond, WA',
    url: 'https://clipchamp.com/',
    type: ['web', 'desktop'],
    os: ['Windows', 'Browser'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free with Microsoft 365',
    priceDetail: 'Premium templates extra',
    summary: 'Microsoft-owned browser video editor; AI features include voiceover, auto-compose, recently added video enhance / sharpening.',
    tags: ['microsoft', '365', 'voiceover']
  },
  {
    name: 'Kapwing AI Video Enhancer',
    vendor: 'Kapwing',
    hq: 'USA · San Francisco, CA',
    url: 'https://www.kapwing.com/tools/enhance-video',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free up to 4 min · Pro $16 / mo',
    priceDetail: 'team plans available',
    summary: 'Collaborative online editor with AI enhance / upscale / stabilize; popular with social-media teams.',
    tags: ['collaboration', 'social', 'stabilize']
  },
  {
    name: 'Flixier',
    vendor: 'Flixier',
    hq: 'Romania · Cluj-Napoca',
    url: 'https://flixier.com/tools/video-enhancer',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free · $14 / mo Pro',
    priceDetail: 'business $30 / mo',
    summary: 'Cloud-rendered editor with one-click enhance / sharpen / denoise; fast cloud export pitched as the differentiator.',
    tags: ['cloud render', 'export speed']
  },
  {
    name: 'Wondershare Filmora AI',
    vendor: 'Wondershare',
    hq: 'China · Shenzhen',
    url: 'https://filmora.wondershare.com/',
    type: ['desktop', 'mobile'],
    os: ['Windows', 'macOS', 'iOS', 'Android'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free · $79.99 / yr',
    priceDetail: 'cross-platform plan available',
    summary: 'Consumer NLE with AI features: video enhance, AI Smart Cutout, audio denoise, motion tracking. Approachable for non-pros.',
    tags: ['nle', 'consumer', 'smart cutout']
  },
  {
    name: 'Avid Media Composer + Boris FX',
    vendor: 'Avid Technology',
    hq: 'USA · Burlington, MA',
    url: 'https://www.avid.com/media-composer',
    type: ['desktop', 'plugin'],
    os: ['Windows', 'macOS'],
    category: 'NLE feature',
    priceTier: 'paid',
    price: '$22.99 / mo (MC)',
    priceDetail: 'Boris FX Suite +$695 / yr',
    summary: 'Pro NLE used across broadcast; AI upscale comes via Boris FX Continuum, Sapphire, Mocha Pro plugins.',
    tags: ['broadcast', 'nle', 'boris fx', 'mocha']
  },
  {
    name: 'Descript Studio Sound + Video Enhance',
    vendor: 'Descript',
    hq: 'USA · San Francisco, CA',
    url: 'https://www.descript.com/',
    type: ['desktop', 'web'],
    os: ['Windows', 'macOS', 'Browser'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free · Creator $12 / mo',
    priceDetail: 'Business $24 / mo',
    summary: 'Audio-first editor with growing video AI (Eye Contact, Auto-Edit, video enhance / stabilize); transcription-driven workflow.',
    tags: ['transcription', 'audio', 'eye contact']
  },
  {
    name: 'Loom Enhance',
    vendor: 'Atlassian',
    hq: 'USA · San Francisco, CA',
    url: 'https://www.loom.com/',
    type: ['web', 'desktop'],
    os: ['Windows', 'macOS', 'iOS', 'Android', 'Browser'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free · Business $12.50 / user / mo',
    priceDetail: 'Enterprise quote',
    summary: 'Screen-recording SaaS; recent AI enhance / sharpen + auto-titles for recorded videos. Major in engineering / product workflows.',
    tags: ['screen recording', 'work', 'atlassian']
  },

  // ============================================================
  // Mobile-first apps with upscale feature
  // ============================================================
  {
    name: 'Remini Video',
    vendor: 'Bending Spoons',
    hq: 'Italy · Milan',
    url: 'https://remini.ai/',
    type: ['web', 'mobile'],
    os: ['iOS', 'Android', 'Browser'],
    category: 'Restoration suite',
    priceTier: 'freemium',
    price: 'Free · Pro $4.99 / wk',
    priceDetail: 'Pro $99.99 / yr',
    summary: 'Originally a photo upscaler; added video enhance / face restoration. Mobile-first, viral in 2023; now owned by Bending Spoons.',
    tags: ['face restoration', 'mobile', 'viral']
  },
  {
    name: 'Picsart Video Upscaler',
    vendor: 'Picsart',
    hq: 'USA · Miami · Armenia',
    url: 'https://picsart.com/video-editor/',
    type: ['web', 'mobile'],
    os: ['iOS', 'Android', 'Browser'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free · $5 / mo Plus',
    priceDetail: 'Pro $10 / mo',
    summary: 'Photo / video creator app with AI enhance & upscale; large social user base, integrated with template marketplace.',
    tags: ['social', 'creator', 'templates']
  },
  {
    name: 'Vmake AI',
    vendor: 'Apowersoft',
    hq: 'China · Hong Kong',
    url: 'https://vmake.ai/',
    type: ['web', 'mobile'],
    os: ['iOS', 'Android', 'Browser'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free credits · Basic $19.99 / mo',
    priceDetail: 'Pro $39.99 / mo',
    summary: 'AI video editor + photo editor by Apowersoft\'s consumer arm. Video upscaler, BG-removal, face refinement. Mobile-first.',
    tags: ['mobile', 'background removal', 'apowersoft']
  },
  {
    name: 'NeuralPix Video Enhancer',
    vendor: 'NeuralPix',
    hq: 'USA',
    url: 'https://neuralpix.com/',
    type: ['web', 'mobile'],
    os: ['iOS', 'Android', 'Browser'],
    category: 'Restoration suite',
    priceTier: 'freemium',
    price: 'Free trial · $9.99 / mo',
    priceDetail: '$59.99 / yr',
    summary: 'Mobile-first AI photo + video restoration / colorize / upscale; targets old family-video preservation use cases.',
    tags: ['restoration', 'colorize', 'mobile', 'family video']
  },
  {
    name: 'Splice (Bending Spoons mobile)',
    vendor: 'Bending Spoons',
    hq: 'Italy · Milan',
    url: 'https://splice.com/',
    type: ['mobile'],
    os: ['iOS', 'Android'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free · Pro $9.99 / mo',
    priceDetail: 'Pro+ $19.99 / mo',
    summary: 'Mobile-first editor with AI enhance / upscale; same parent as Remini, mobile-creator focus.',
    tags: ['mobile', 'creator', 'splice']
  },

  // ============================================================
  // Generative platforms that DO ship a discrete upscale feature
  // ============================================================
  {
    name: 'Runway Upscale Tool',
    vendor: 'Runway',
    hq: 'USA · New York, NY',
    url: 'https://runwayml.com/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Generative + upscale',
    priceTier: 'freemium',
    price: 'Free 125 credits · Standard $15 / mo',
    priceDetail: 'Pro $35 / mo · Unlimited $95 / mo',
    summary: 'Generative video platform (Gen-3, Gen-4) with a discrete Upscale tool that processes any uploaded video. Filmmaker-leaning.',
    tags: ['generative', 'discrete upscale', 'gen-3']
  },
  {
    name: 'Krea Video Enhance',
    vendor: 'Krea',
    hq: 'USA / Spain',
    url: 'https://www.krea.ai/video',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Generative + upscale',
    priceTier: 'freemium',
    price: 'Free · Pro $10 / mo',
    priceDetail: 'Max $35 / mo · Enterprise plans',
    summary: 'Real-time AI canvas with a dedicated Video Enhance / Upscale mode; pairs with their image gen pipeline.',
    tags: ['generative', 'video enhance', 'real-time']
  },

  // ============================================================
  // Plugins for major NLEs
  // ============================================================
  {
    name: 'Neat Video',
    vendor: 'ABSoft (Neat)',
    hq: 'Spain · Barcelona (originally Belarus)',
    url: 'https://www.neatvideo.com/',
    type: ['plugin'],
    os: ['Windows', 'macOS', 'Linux'],
    category: 'NLE feature',
    priceTier: 'paid',
    price: '$129 (Home) · $249 (Pro)',
    priceDetail: 'OFX / Premiere / Resolve / Final Cut plugin',
    summary: 'Best-in-class video denoiser + sharpen plugin for major NLEs; not a pure upscaler but routinely used in upscale pipelines.',
    tags: ['denoise', 'plugin', 'ofx', 'nle']
  },
  {
    name: 'Boris FX Continuum',
    vendor: 'Boris FX',
    hq: 'USA · Boston, MA',
    url: 'https://borisfx.com/products/continuum/',
    type: ['plugin'],
    os: ['Windows', 'macOS'],
    category: 'NLE feature',
    priceTier: 'paid',
    price: '$695 / yr',
    priceDetail: '$1295 perpetual',
    summary: 'High-end VFX / finishing plugin suite — includes AI upscale (Title Studio), denoise, retime, stabilize. Used in episodic / commercial post.',
    tags: ['vfx', 'plugin', 'finishing']
  },
  {
    name: 'Red Giant VFX Suite',
    vendor: 'Maxon (Red Giant)',
    hq: 'Germany · Friedrichsdorf',
    url: 'https://www.maxon.net/en/red-giant',
    type: ['plugin'],
    os: ['Windows', 'macOS'],
    category: 'NLE feature',
    priceTier: 'paid',
    price: '$59.91 / mo',
    priceDetail: 'one suite for Premiere / AE / Resolve',
    summary: 'Plugin suite — Magic Bullet color, Trapcode, Universe — with AI enhancement / upscale modules; common in motion-graphics shops.',
    tags: ['plugin', 'motion graphics', 'trapcode']
  },
  {
    name: 'ON1 NoNoise AI for Video',
    vendor: 'ON1, Inc.',
    hq: 'USA · Portland, OR',
    url: 'https://www.on1.com/products/nonoise-ai/',
    type: ['desktop', 'plugin'],
    os: ['Windows', 'macOS'],
    category: 'NLE feature',
    priceTier: 'paid',
    price: '$69.99 / yr',
    priceDetail: '$99.99 perpetual',
    summary: 'AI denoiser + upscale primarily for photos but added video support; popular with photographers expanding to short-form video.',
    tags: ['photography', 'denoise', 'upscale']
  },
  {
    name: 'Twixtor (RE:Vision Effects)',
    vendor: 'RE:Vision Effects',
    hq: 'USA · San Francisco, CA',
    url: 'https://revisionfx.com/products/twixtor/',
    type: ['plugin'],
    os: ['Windows', 'macOS'],
    category: 'NLE feature',
    priceTier: 'paid',
    price: '$329.95 (Twixtor) · $595 (Pro)',
    priceDetail: 'plugin for AE / Premiere / Resolve / FCP',
    summary: 'Industry-standard optical-flow frame interpolator. Not strictly an upscaler, but always paired with one for slow-motion / 120 fps deliverables.',
    tags: ['interpolation', 'slow-mo', 'plugin']
  },

  // ============================================================
  // Driver / OS-level (real-time browser / OS upscaling)
  // ============================================================
  {
    name: 'NVIDIA RTX Video Super Resolution',
    vendor: 'NVIDIA',
    hq: 'USA · Santa Clara, CA',
    url: 'https://blogs.nvidia.com/blog/rtx-video-super-resolution/',
    type: ['plugin'],
    os: ['Windows'],
    category: 'Driver / OS-level',
    priceTier: 'free',
    price: 'Free with RTX 30/40/50 GPU',
    priceDetail: 'driver-level feature, Chrome / Edge / Firefox',
    summary: 'GPU-driver feature that upscales any web video in real time inside the browser. Requires RTX 30-series or newer; toggled in NVIDIA Control Panel.',
    tags: ['gpu', 'driver', 'browser', 'real-time']
  },
  {
    name: 'AMD FidelityFX Video Super Resolution',
    vendor: 'AMD',
    hq: 'USA · Santa Clara, CA',
    url: 'https://www.amd.com/en/technologies/radeon-super-resolution',
    type: ['plugin'],
    os: ['Windows'],
    category: 'Driver / OS-level',
    priceTier: 'free',
    price: 'Free with Radeon RX 7000 GPU',
    priceDetail: 'Adrenalin driver feature',
    summary: 'AMD equivalent of NVIDIA RTX VSR — driver-level real-time video upscaling for streamed content. Limited to recent Radeon GPUs.',
    tags: ['gpu', 'driver', 'browser', 'real-time']
  },
  {
    name: 'NVIDIA Broadcast',
    vendor: 'NVIDIA',
    hq: 'USA · Santa Clara, CA',
    url: 'https://www.nvidia.com/en-us/geforce/broadcasting/broadcast-app/',
    type: ['desktop'],
    os: ['Windows'],
    category: 'Driver / OS-level',
    priceTier: 'free',
    price: 'Free with RTX GPU',
    priceDetail: 'requires RTX 20 / 30 / 40 / 50 series',
    summary: 'NVIDIA\'s end-user app exposing Maxine effects: noise removal, virtual background, eye-contact, room echo cancel; popular with streamers.',
    tags: ['streamer', 'rtx', 'eye contact', 'noise removal']
  },
  {
    name: 'madVR',
    vendor: 'Mathias Rauen',
    hq: 'Germany',
    url: 'http://madvr.com/',
    type: ['plugin'],
    os: ['Windows'],
    category: 'Driver / OS-level',
    priceTier: 'free',
    price: 'Free · madVR Envy hardware $5,999+',
    priceDetail: 'rendering engine free, dedicated HW separately',
    summary: 'Cult HTPC video renderer with NGU / RCA upscale algorithms; effectively the gold standard for living-room HTPC video quality before AI upscalers.',
    tags: ['htpc', 'ngu', 'rca', 'home theater']
  },
  {
    name: 'Anime4K (mpv / madVR / iina shaders)',
    vendor: 'bloc97 / community',
    hq: 'Community (origin: Canada)',
    url: 'https://github.com/bloc97/Anime4K',
    type: ['plugin', 'desktop'],
    os: ['Windows', 'macOS', 'Linux'],
    category: 'Driver / OS-level',
    priceTier: 'free',
    price: 'Free, MIT license',
    priceDetail: 'shaders for mpv / madVR / iina / vlc',
    summary: 'Real-time anime upscaler shader; ships as the de facto upscaler inside mpv / iina / madVR setups.',
    tags: ['anime', 'shader', 'real-time', 'mpv', 'open source']
  },

  // ============================================================
  // SDK / API (developer-facing)
  // ============================================================
  {
    name: 'Cloudinary Video Optimization',
    vendor: 'Cloudinary',
    hq: 'USA / Israel · Santa Clara, CA',
    url: 'https://cloudinary.com/products/video_api',
    type: ['sdk'],
    os: ['Cloud'],
    category: 'SDK / API',
    priceTier: 'freemium',
    price: 'Free 25 credits / mo',
    priceDetail: 'Plus $89 / mo · custom enterprise',
    summary: 'Media CDN + transformation API including AI upscale, codec re-encode, adaptive streaming. Used in e-commerce / publishing stacks.',
    tags: ['api', 'cdn', 'ecommerce', 'adaptive']
  },
  {
    name: 'NVIDIA Maxine',
    vendor: 'NVIDIA',
    hq: 'USA · Santa Clara, CA',
    url: 'https://developer.nvidia.com/maxine',
    type: ['sdk'],
    os: ['Windows', 'Linux'],
    category: 'SDK / API',
    priceTier: 'free',
    price: 'Free SDK · requires CUDA-capable GPU',
    priceDetail: 'commercial licenses for redistribution',
    summary: 'NVIDIA\'s real-time video effects SDK: super resolution, denoise, virtual background, eye-contact, AI face-mesh. Embedded in many enterprise video products.',
    tags: ['sdk', 'cuda', 'real-time', 'video effects']
  },
  {
    name: 'Intel oneVPL / Video Processing Library',
    vendor: 'Intel',
    hq: 'USA · Santa Clara, CA',
    url: 'https://www.intel.com/content/www/us/en/developer/tools/onevpl/overview.html',
    type: ['sdk'],
    os: ['Windows', 'Linux'],
    category: 'SDK / API',
    priceTier: 'free',
    price: 'Free (open source)',
    priceDetail: 'BSD-style license',
    summary: 'Intel\'s open-source video processing SDK (formerly Media SDK) with HW-accelerated decode / encode / SR via QuickSync and Iris Xe.',
    tags: ['sdk', 'quicksync', 'iris xe', 'open source']
  },
  {
    name: 'AMD Advanced Media Framework (AMF)',
    vendor: 'AMD',
    hq: 'USA · Santa Clara, CA',
    url: 'https://gpuopen.com/advanced-media-framework/',
    type: ['sdk'],
    os: ['Windows', 'Linux'],
    category: 'SDK / API',
    priceTier: 'free',
    price: 'Free (open source)',
    priceDetail: 'MIT-licensed C++ SDK',
    summary: 'AMD\'s open AMF SDK exposes HW encode / decode + super-resolution via Radeon GPUs. Used by OBS / xSplit / vendors for HW pipelines.',
    tags: ['sdk', 'amf', 'radeon', 'obs']
  },
  {
    name: 'Apple Video Toolbox',
    vendor: 'Apple',
    hq: 'USA · Cupertino, CA',
    url: 'https://developer.apple.com/documentation/videotoolbox',
    type: ['sdk'],
    os: ['macOS', 'iOS'],
    category: 'SDK / API',
    priceTier: 'free',
    price: 'Free (Apple SDK)',
    priceDetail: 'requires Apple developer account for distribution',
    summary: 'Apple\'s HW video decode / encode framework including ProRes / HEVC / H.264 acceleration. Backbone of Final Cut and most Mac-native upscalers.',
    tags: ['apple', 'sdk', 'prores', 'hevc']
  },
  {
    name: 'V-Nova (iSize BitClear lineage)',
    vendor: 'V-Nova',
    hq: 'UK · London',
    url: 'https://www.v-nova.com/',
    type: ['sdk'],
    os: ['Cloud'],
    category: 'SDK / API',
    priceTier: 'paid',
    price: 'Enterprise pricing',
    priceDetail: 'broadcaster / OTT licenses',
    summary: 'Perceptually optimized AI upscaling SDK (BitClear lineage) used by broadcasters / OTT providers to ladder lower-bitrate masters.',
    tags: ['enterprise', 'ott', 'broadcaster', 'sdk']
  },
  {
    name: 'Bitmovin Video Enhancement',
    vendor: 'Bitmovin',
    hq: 'Austria · Klagenfurt',
    url: 'https://bitmovin.com/',
    type: ['sdk'],
    os: ['Cloud'],
    category: 'SDK / API',
    priceTier: 'paid',
    price: 'Enterprise pricing',
    priceDetail: 'plans per encoding minute',
    summary: 'Encoding-as-a-service platform with AI-driven per-title bitrate ladder + content-aware upscale; used by OTT publishers.',
    tags: ['enterprise', 'ott', 'encoding', 'per-title']
  },

  // ============================================================
  // Open-source desktop bundlers (commercial-friendly UX wrappers)
  // ============================================================
  {
    name: 'OBS Studio + AI plugins',
    vendor: 'OBS Project',
    hq: 'USA (non-profit)',
    url: 'https://obsproject.com/',
    type: ['desktop'],
    os: ['Windows', 'macOS', 'Linux'],
    category: 'Driver / OS-level',
    priceTier: 'free',
    price: 'Free, GPL',
    priceDetail: 'AI plugins via community',
    summary: 'Streaming / recording app commonly paired with NVIDIA Maxine + StreamFX for upscale / denoise / VSR in live streaming.',
    tags: ['streaming', 'plugins', 'open source']
  },

  // ============================================================
  // Korean / Japanese / regional players
  // ============================================================
  {
    name: 'AI PIXELL (AI픽셀)',
    vendor: '4BY4 Inc.',
    hq: 'South Korea · Seoul',
    url: 'https://aipixell.com',
    type: ['web', 'sdk'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: '$0.9 / min (enhance)',
    priceDetail: '$2 / min (4K upscale) · SaaS · API · On-Premise',
    summary: 'Korean B2B AI video enhancement & 4K/8K super-resolution suite — super resolution, deinterlace, noise removal, high-efficiency pre-encode. Targets broadcasters and OTT archival workflows.',
    tags: ['korean', 'broadcaster', 'ott', 'super resolution', 'deinterlace', 'denoise', 'api', 'on-premise', '4by4']
  },
  // (EditAI editai.kr — site offline as of 2026-05; removed)
  // (Daglo daglo.ai   — STT/transcription only, no video enhance feature; removed)
  // (PikaVue pikavue.com — port 443 unreachable from multiple vantage points, ECONNREFUSED; revisit if user confirms live)

  {
    name: 'Kokoon.cloud (Bluewhale)',
    vendor: 'BLUEDOT Inc. (블루닷)',
    hq: 'South Korea · Seoul (Gangnam-gu)',
    url: 'https://www.kokoon.cloud/',
    type: ['web', 'sdk'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'From $5 / mo · credit-based',
    priceDetail: 'free trial credits · AWS Marketplace as "Bluewhale" · API on request',
    summary: 'Korean SaaS for AI video upscaling to 4K with content-type models (Person / Animation / CG / Retro / General), denoise, face enhance, bitrate-efficient remastering.',
    tags: ['korean', 'bluedot', 'bluewhale', 'super resolution', '4k', 'face enhance', 'aws marketplace']
  },
  {
    name: 'PrestoWorks',
    vendor: 'Pixtree Inc. (픽스트리)',
    hq: 'South Korea · Seoul',
    url: 'https://prestoworks.ai/',
    type: ['web', 'sdk'],
    os: ['Browser', 'Cloud'],
    category: 'Restoration suite',
    priceTier: 'paid',
    price: 'Enterprise — contact sales',
    priceDetail: 'B2B archive / broadcaster pricing · no public self-serve',
    summary: 'Cloud AI media-workflow platform from Korean MPEG-veteran Pixtree, focused on remastering SD/HD/FHD archives to UHD with denoise + deblur + quality-restoration models.',
    tags: ['korean', 'pixtree', 'remaster', 'archive', 'broadcast', 'uhd', 'restoration']
  },
  {
    name: 'Espreso Media Super Resolution',
    vendor: 'Espreso Media Inc. (에스프레소미디어)',
    hq: 'South Korea · Seoul (Gwanak-gu)',
    url: 'https://espresomedia.com/',
    type: ['sdk'],
    os: ['Cloud'],
    category: 'SDK / API',
    priceTier: 'paid',
    price: 'Enterprise — contact sales',
    priceDetail: 'demo at demo.espresomedia.co.kr · no self-serve',
    summary: 'Deep-learning Super Resolution engine from 2018-founded Seoul startup (SNU lineage). Commercialized FHD → UHD/4K SR for Korean broadcast & CCTV in 2020.',
    tags: ['korean', 'espresomedia', 'super resolution', 'broadcast', 'cctv', '4k', 'snu']
  },
  {
    name: 'GOM Player+ AI Video Upscaling',
    vendor: 'GOM & Company (formerly GRETECH; 곰앤컴퍼니)',
    hq: 'South Korea · Seoul (Songpa-gu)',
    url: 'https://www.gomlab.com/en/gomplayerplus-media-player',
    type: ['desktop'],
    os: ['Windows'],
    category: 'NLE feature',
    priceTier: 'paid',
    price: '$11 one-time license',
    priceDetail: 'regular $22 · +$15 bundle with 100 AI credits · Windows 10 64-bit+',
    summary: 'Premium Windows media player from the GOM Lab team with built-in AI Video Upscaling (denoise + detail synthesis + motion-blur smoothing) for low-res playback up to 4K UHD.',
    tags: ['korean', 'gom', 'media player', 'desktop', 'windows', '4k', 'upscale-on-playback']
  },

  // ============================================================
  // Japan
  // ============================================================
  {
    name: 'AnimeRefiner',
    vendor: 'RADIUS5 Inc. (株式会社ラディウス・ファイブ)',
    hq: 'Japan · Tokyo (Shinjuku)',
    url: 'https://animerefiner.com/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: 'Custom quote (B2B)',
    priceDetail: 'inquiry-based · free sample available · post-cre8tiveAI successor',
    summary: 'Anime-specialized AI upscaler that converts SD / HD / FHD to 4K / 8K with subtitle-aware processing; used by Japanese anime studios for remasters.',
    tags: ['japanese', 'anime', 'radius5', '4k', '8k', 'remaster', 'studio', 'subtitle aware']
  },
  {
    name: 'Anime4K Player (cre8tiveAI)',
    vendor: 'RADIUS5 Inc.',
    hq: 'Japan · Tokyo (Shinjuku)',
    url: 'https://cre8tiveai.com/anime4k',
    type: ['desktop'],
    os: ['Windows', 'macOS'],
    category: 'Driver / OS-level',
    priceTier: 'paid',
    price: '¥980 / $9.80 per license',
    priceDetail: 'one machine · Win 10/11 64-bit or macOS 10.15+ · mpv-based',
    summary: 'Desktop media player that real-time upscales anime to 4K via AI; built on mpv with Regular / Middle / Ultra quality modes. cre8tiveAI platform shut Dec 2025 but this product page remains live.',
    tags: ['japanese', 'anime', 'mpv', 'real-time', '4k', 'media player', 'radius5']
  },
  {
    name: 'AnimeSR (Chrome Extension)',
    vendor: 'RADIUS5 Inc.',
    hq: 'Japan · Tokyo (Shinjuku)',
    url: 'https://chromewebstore.google.com/detail/animesr/cfnfdmlbacapbpmoanphdgmemdmcpdao',
    type: ['plugin'],
    os: ['Browser'],
    category: 'Driver / OS-level',
    priceTier: 'free',
    price: 'Free',
    priceDetail: 'Chrome extension · lightweight in-browser model',
    summary: 'Chrome extension that upscales anime streams on YouTube, AbemaTV (VOD), and Niconico in real time via a lightweight in-browser AI model.',
    tags: ['japanese', 'anime', 'chrome extension', 'real-time', 'youtube', 'niconico', 'abematv', 'radius5']
  },
  {
    name: 'Remaster.AI',
    vendor: 'Majurer Inc. (株式会社マジュラー)',
    hq: 'Japan · Tokyo (Shinjuku)',
    url: 'https://remaster.ai/',
    type: ['web', 'sdk'],
    os: ['Browser', 'Cloud'],
    category: 'Restoration suite',
    priceTier: 'paid',
    price: 'From $10 / 5 min',
    priceDetail: '30 min $54 · 60 min $98 · API · originally e-Frontier AIリマスター',
    summary: 'Self-service cloud platform for AI super-resolution (SD→HD), 30→300fps super-slow, and 30→60fps frame doubling up to 5K. Spun off from e-Frontier in 2020.',
    tags: ['japanese', 'majurer', 'super resolution', 'frame interpolation', 'slow-mo', '5k', 'sd-to-hd']
  },
  {
    name: 'AIリマスター (Ohden AI Remaster)',
    vendor: 'Ohden Co., Ltd. (オーデン株式会社)',
    hq: 'Japan · Tokyo (Chiyoda)',
    url: 'https://ohden.jp/Airemaster.html',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Restoration suite',
    priceTier: 'paid',
    price: 'From ¥15,000 / 10 min',
    priceDetail: 'Economy ¥15K (1440×960) · Standard ¥30K (FHD) · Premium ¥45K (2K/4K)',
    summary: 'Tokyo post-production house offering AI remastering: upscale SD / VHS / 8mm / miniDV / MP4 to FHD/2K/4K with noise removal, color correction, and frame interpolation.',
    tags: ['japanese', 'ohden', 'vhs', '8mm', 'minidv', 'tape digitization', 'remaster', 'post-production']
  },
  {
    name: 'Anime AI Remaster',
    vendor: 'EXA International, Inc. (株式会社エクサインターナショナル)',
    hq: 'Japan · Tokyo',
    url: 'https://www.exa-int.co.jp/lp/anime-ai-remaster/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Restoration suite',
    priceTier: 'paid',
    price: 'Custom quote',
    priceDetail: 'free sample production · per-title AI training · ISO27001 certified',
    summary: 'Anime-specialized B2B remastering — custom AI trained per title, analog tape digitization through 4K / 8K UHD delivery with broadcast QC. Sister service E-QAS for general video.',
    tags: ['japanese', 'anime', 'exa', 'remaster', '4k', '8k', 'analog tape', 'broadcast qc', 'custom model']
  },
  {
    name: 'Setaria Cloud (セタリア・クラウド)',
    vendor: 'Nekojarashi Inc. × Morpho Inc.',
    hq: 'Japan · Tokyo',
    url: 'https://setaria.cloud/',
    type: ['web', 'sdk'],
    os: ['Browser', 'Cloud'],
    category: 'SDK / API',
    priceTier: 'paid',
    price: 'From ¥30,000 / mo',
    priceDetail: 'Basic ¥30K (60 min/100GB) · Pro ¥90K · Business ¥240K · REST API',
    summary: 'B2B cloud bundling Morpho\'s super-resolution, frame interpolation, noise reduction, stabilization, HDR and deflicker for Japanese broadcasters and OTT.',
    tags: ['japanese', 'morpho', 'nekojarashi', 'broadcast', 'ott', 'super resolution', 'stabilization', 'hdr', 'prores']
  },

  // ============================================================
  // USA — additional services (newer / specialized)
  // ============================================================
  {
    name: 'Replicate — Topaz Video Upscale + Real-ESRGAN Video',
    vendor: 'Replicate, Inc. (acquired by Cloudflare, Nov 2025)',
    hq: 'USA · San Francisco, CA',
    url: 'https://replicate.com/topazlabs/video-upscale',
    type: ['sdk'],
    os: ['Cloud'],
    category: 'SDK / API',
    priceTier: 'paid',
    price: 'Pay-as-you-go (per-second/megapixel)',
    priceDetail: 'hosts topazlabs/video-upscale, lucataco/real-esrgan-video, Crystal Video Upscaler',
    summary: 'API-first platform hosting multiple video upscaling models (Topaz Video Upscale, Real-ESRGAN Video, Crystal) as callable endpoints. YC W20; acquired by Cloudflare Nov 2025.',
    tags: ['api', 'developer', 'topaz hosted', 'real-esrgan', 'yc-w20', 'cloudflare']
  },
  {
    name: 'fal.ai Video Upscaler',
    vendor: 'Features & Labels (fal)',
    hq: 'USA · San Francisco, CA',
    url: 'https://fal.ai/models/fal-ai/video-upscaler',
    type: ['sdk'],
    os: ['Cloud'],
    category: 'SDK / API',
    priceTier: 'paid',
    price: '$0.0008 per megapixel',
    priceDetail: 'frame-by-frame Real-ESRGAN · commercial use ok · Series D $140M, $4.5B val (Dec 2025)',
    summary: 'Dedicated video upscale endpoint on fal.ai\'s generative-media inference platform. Accepts mp4/mov/webm/m4v/gif + scale param, returns mp4 URL.',
    tags: ['api', 'developer', 'real-esrgan', 'inference platform', 'fal']
  },
  {
    name: 'Captions / Mirage AI Video Upscaler',
    vendor: 'Captions, Inc. (dba Mirage)',
    hq: 'USA · New York, NY',
    url: 'https://www.captions.ai/features/ai-video-upscaler',
    type: ['web', 'mobile'],
    os: ['Browser', 'iOS', 'Android'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free tier · paid plans',
    priceDetail: 'Series C $60M ($500M val); Mirage round $75M (General Catalyst); rebranded Sep 2025',
    summary: 'NYC AI video editor (founded 2021) with a discrete AI Video Upscaler bundled into its mobile-first creator workflow. Rebranded to Mirage Sep 2025 as an AI video research lab.',
    tags: ['usa', 'creator', 'shorts', 'social', 'mobile', 'mirage', 'captions']
  },
  {
    name: 'Akool AI Video Upscaler',
    vendor: 'Akool Inc.',
    hq: 'USA · Palo Alto, CA',
    url: 'https://akool.com/ai-tools/ai-video-upscaler-tool',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free · Pro $30 / mo',
    priceDetail: 'Pro Max $119 / mo · Studio $500 / yr (8K) · Enterprise custom',
    summary: 'Palo Alto generative-AI suite (founded 2022) with a dedicated AI Video Upscaler tool (up to 8K on Studio tier); coexists with their avatar / face-swap / translation tools.',
    tags: ['usa', 'creator', '4k', '8k', 'batch', 'akool']
  },
  {
    name: 'Magic Hour AI Video Upscaler',
    vendor: 'Magic Hour, Inc. (YC W24)',
    hq: 'USA · San Francisco, CA',
    url: 'https://magichour.ai/products/video-upscaler',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free daily credits · paid plans',
    priceDetail: '2× / 4× upscaling or target between 720p–4K · frame interpolation',
    summary: 'YC W24-backed (2023, SF) all-in-one AI video platform with a dedicated Video Upscaler product: 1080p / 4K in-browser, any aspect ratio, includes frame interpolation.',
    tags: ['usa', 'yc-w24', '4k', 'frame interpolation', 'magic hour']
  },
  {
    name: 'Higgsfield Upscale (Sora 2 Upscale / Enhancer)',
    vendor: 'Higgsfield AI',
    hq: 'USA · San Francisco, CA',
    url: 'https://higgsfield.ai/upscale',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Generative + upscale',
    priceTier: 'paid',
    price: 'Starter $15 · Plus $34 · Ultra $84',
    priceDetail: 'Business $49 / seat · credit-based · $149.6M raised · 20M+ users',
    summary: 'SF generative-video company (2023, 535 Mission St) with a dedicated upscale + deflicker tool. Sora 2 Upscale / Enhancer reconstruct AI-generated clips to 4K with detail restoration.',
    tags: ['usa', 'generative', '4k', 'deflicker', 'sora postprocess', 'higgsfield']
  },
  {
    name: 'OpusClip Video Quality Enhancer',
    vendor: 'Opusclip, Inc.',
    hq: 'USA · Mountain View, CA',
    url: 'https://www.opus.pro/tools/video-quality-enhancer',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free trial 90 credits · paid Pro',
    priceDetail: 'no credit card required · TikTok / Reels / Shorts / LinkedIn aspect ratios',
    summary: 'Bay Area AI short-form repurposing platform (2022) with a discrete Video Quality Enhancer that auto-sharpens, upscales resolution, optimizes brightness / contrast.',
    tags: ['usa', 'shorts', 'creator', 'social', 'tiktok', 'opusclip']
  },
  {
    name: 'Cognitech Video Investigator (FrameFusion / FaceFusion3D)',
    vendor: 'Cognitech, Inc.',
    hq: 'USA · Pasadena, CA',
    url: 'https://cognitech.com/',
    type: ['desktop'],
    os: ['Windows'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: 'Enterprise / government licensing',
    priceDetail: 'court-validated since 1996 · law enforcement, DoD, DHS',
    summary: 'US forensic video processing pioneer (founded 1988, Pasadena). FrameFusion multi-frame super-resolve, Biometric FaceFusion3D face super-resolution from video, deblur, denoise, frame interpolation.',
    tags: ['usa', 'forensic', 'law enforcement', 'super resolution', 'court validated', 'face super resolution']
  },
  {
    name: 'Segmind ESRGAN Video Upscaler (+ Luma / Kling 4K)',
    vendor: 'Segmind',
    hq: 'USA · Santa Clara, CA',
    url: 'https://www.segmind.com/models/esrgan-video-upscaler',
    type: ['sdk'],
    os: ['Cloud'],
    category: 'SDK / API',
    priceTier: 'paid',
    price: 'Pay-per-run (credit pricing)',
    priceDetail: 'ESRGAN Video · Clarity · Luma Video 4K · Kling 1.6 4K · 490+ models behind one key',
    summary: 'Dual-HQ model-platform (Santa Clara + Bengaluru; 2020) with multiple discrete video upscale endpoints incl. a dedicated 4K Pixelflow for Luma and Kling outputs.',
    tags: ['usa', 'api', 'developer', '4k', 'esrgan', 'segmind', 'pixelflow']
  },

  // ============================================================
  // India
  // ============================================================
  {
    name: 'Upscale.media — Video Upscaler',
    vendor: 'Shopsense Retail Technologies Ltd. (Fynd / PixelBin)',
    hq: 'India · Mumbai (Andheri East)',
    url: 'https://www.upscale.media/video-upscale',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free · 3 credits / mo',
    priceDetail: 'paid from $31.49 / yr (1,500 credits) · $0.02 per credit · PAYG tiers $9.99–$84.99',
    summary: 'Browser AI video upscaler from Mumbai (Shopsense / Fynd group). HD/SD → HD / FHD / 4K with frame-by-frame detail reconstruction; MP4 / MOV / WebM input.',
    tags: ['indian', 'made-in-india', 'mumbai', 'fynd', 'shopsense', '4k', 'consumer']
  },
  {
    name: 'PixelBin AI Video Enhancer',
    vendor: 'Shopsense Retail Technologies Ltd. (Fynd / PixelBin)',
    hq: 'India · Mumbai (Andheri East) · US presence San Jose CA',
    url: 'https://www.pixelbin.io/',
    type: ['web', 'mobile'],
    os: ['Browser', 'Cloud', 'Android'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free · 10 credits on signup',
    priceDetail: 'Pro / Lite / Standard credit-based tiers · also a Video Upscale Android app',
    summary: 'Sister product to Upscale.media (same Mumbai parent). One-tap AI Video Enhancer with resolution upscale, sharpen, denoise, frame-level brightness / color enhancement. Started as Fynd internal image pipeline.',
    tags: ['indian', 'made-in-india', 'mumbai', 'fynd', 'pixelbin', 'android app', 'developer api']
  },
  {
    name: 'InVideo AI Video Upscaler',
    vendor: 'InVideo (Invideo Innovation Pte Ltd · Whitesheep Technology)',
    hq: 'USA · Delaware (India R&D · Mumbai)',
    url: 'https://invideo.io/make/upscale-video/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Generative + upscale',
    priceTier: 'freemium',
    price: 'Free w/ watermark · Plus $20 / mo',
    priceDetail: 'Max $48 / mo for 4K export · India entity Whitesheep Technology Pvt Ltd Mumbai',
    summary: 'Discrete AI Video Upscaler inside InVideo\'s AI video platform — 4K with HDR, sharpens detail, removes compression artifacts. Founder Sanket Shah Mumbai-based; legal HQ Delaware/SF.',
    tags: ['indian-origin', 'mumbai', 'delaware', '4k', 'hdr', 'ai-video', 'invideo']
  },

  // ============================================================
  // Singapore (Southeast Asia — only confirmed entries; ID/TH/VN/MY/PH all 0)
  // ============================================================
  {
    name: 'MotionElements Studio AI — Video Upscaler',
    vendor: 'MotionElements Pte Ltd',
    hq: 'Singapore · Singapore (Orchard Road)',
    url: 'https://ai.motionelements.com/video-upscaler',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Bundled in MotionElements subscription',
    priceDetail: 'credit-based · stock-marketplace ecosystem',
    summary: 'Discrete video upscaler inside MotionElements\' Studio AI suite (Singapore stock-media marketplace, founded 2007). Enhances to HD / 4K alongside T2V / I2V / V2V tools.',
    tags: ['singapore', 'motionelements', 'stock marketplace', 'creator tools', '4k']
  },
  {
    name: 'Pollo AI Video Upscaler',
    vendor: 'Cocosoft Technology Pte Ltd',
    hq: 'Singapore · Singapore',
    url: 'https://pollo.ai/video-upscaler',
    type: ['web', 'mobile'],
    os: ['Browser', 'iOS', 'Android'],
    category: 'Generative + upscale',
    priceTier: 'freemium',
    price: 'Free · Lite $10 / mo',
    priceDetail: 'Pro $25–$659 / mo · 4K gated to paid · Standard / Face / Denoise modes',
    summary: 'Discrete AI Video Upscaler with Standard / Face / Denoise modes — upscales to 4K with denoise, deblur, color correction. Singapore-registered entity (Dec 2021); founders / VCs of Chinese origin (note for transparency).',
    tags: ['singapore', 'chinese-origin', 'pollo', '4k', 'face mode', 'denoise', 'multi-tool']
  }
];
