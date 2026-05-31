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
    url: 'https://www.hitpaw.com/video-enhancer.html',
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
    url: 'https://www.videoproc.com/video-converter/',
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
    url: 'https://www.movavi.com/video-editor-plus/',
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
    url: 'https://www.cutout.pro/video-enhancer-upscaler',
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
    url: 'https://vanceai.com/video-enhancer-ai/',
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
    url: 'https://www.media.io/ai/video-enhancer',
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
    url: 'https://www.topmediai.com/video-enhancer/',
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
    name: 'Imagen 4K (Beautify.ai)',
    vendor: 'Beautify.ai',
    hq: 'China',
    url: 'https://www.beautify.ai/video-upscaler',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free trial · $9 / mo',
    priceDetail: 'credit-based',
    summary: 'Cloud upscaler from an Asian SEM team; focused on social-content workflows, fast turnaround on short clips.',
    tags: ['social', 'short clips']
  },
  {
    name: 'Sigma AI Video Upscaler',
    vendor: 'Sigma AI Tools',
    hq: 'India · Bengaluru',
    url: 'https://sigma-ai-tools.com/video-enhancer',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free · $7.99 / mo',
    priceDetail: 'API tier',
    summary: 'Lightweight cloud upscaler with credit / API model; lesser-known but used by small SEO / content teams.',
    tags: ['cheap', 'api', 'seo']
  },
  {
    name: 'Cleeck Video AI',
    vendor: 'Cleeck',
    hq: 'USA · Delaware',
    url: 'https://www.cleeck.com/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'freemium',
    price: 'Free · $11 / mo Plus',
    priceDetail: 'team plans',
    summary: 'Lightweight upscale / enhance browser tool; bundle of standalone AI photo + video helpers.',
    tags: ['lightweight', 'web']
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
  {
    name: 'NoiselessCloud',
    vendor: 'NoiselessCloud',
    hq: 'USA',
    url: 'https://noiselesscloud.com/',
    type: ['web', 'sdk'],
    os: ['Browser', 'Cloud'],
    category: 'Dedicated upscaler',
    priceTier: 'paid',
    price: 'Pay-per-minute',
    priceDetail: 'enterprise contracts',
    summary: 'Cloud denoise + upscale service with FFmpeg-compatible CLI / API; popular in archival / digitization workflows.',
    tags: ['denoise', 'archival', 'cli', 'api']
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
    url: 'https://www.veed.io/tools/upscale-video',
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
  {
    name: 'NeuralCam Video',
    vendor: 'NeuralCam',
    hq: 'Lithuania · Vilnius',
    url: 'https://neuralcam.app/',
    type: ['mobile'],
    os: ['iOS'],
    category: 'NLE feature',
    priceTier: 'paid',
    price: '$4.99 / mo',
    priceDetail: 'yearly $29.99',
    summary: 'iOS-only AI camera app with night mode + video enhance; well-reviewed by mobile-cinematography enthusiasts.',
    tags: ['ios', 'night mode', 'camera']
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
  {
    name: 'Vega AI Creator',
    vendor: 'Tencent ARC Lab',
    hq: 'China · Shenzhen',
    url: 'https://www.vegaai.net/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'Generative + upscale',
    priceTier: 'freemium',
    price: 'Free tier · Pro from ¥39 / mo',
    priceDetail: 'enterprise quote',
    summary: 'Tencent ARC Lab\'s creator platform with image + video gen + a Real-ESRGAN-lineage upscaler / GFP-GAN face restore.',
    tags: ['tencent', 'real-esrgan', 'chinese']
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
    url: 'https://www.nvidia.com/en-us/geforce/news/rtx-video-super-resolution/',
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
    url: 'https://www.amd.com/en/technologies/fluid-motion-frames.html',
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
  {
    name: 'EditAI',
    vendor: 'EditAI',
    hq: 'South Korea · Seoul',
    url: 'https://www.editai.kr/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free trial · ₩9,900 / mo',
    priceDetail: 'business plans',
    summary: 'Korean AI video service with auto-editing + upscale / colorize; targets local creator / commerce market.',
    tags: ['korean', 'creator', 'commerce']
  },
  {
    name: 'Daglo',
    vendor: 'Daglo',
    hq: 'South Korea · Seoul',
    url: 'https://daglo.ai/',
    type: ['web'],
    os: ['Browser', 'Cloud'],
    category: 'NLE feature',
    priceTier: 'freemium',
    price: 'Free · paid from ₩9,000 / mo',
    priceDetail: 'enterprise plans',
    summary: 'Korean speech-to-text + video enhancement platform; recently added 4K upscale + interpolation features.',
    tags: ['korean', 'stt', 'enterprise']
  }
];
