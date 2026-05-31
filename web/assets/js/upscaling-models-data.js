/**
 * Open-source upscaling / restoration model database.
 *
 * Schema:
 *   name       : string (model / repo name)
 *   family     : "non-generative" | "generative"
 *   task       : "super-resolution" | "interpolation" | "restoration" | "denoise" | "colorize" | "stylize"
 *   year       : number (initial publication year)
 *   publisher  : string (lab / org / individual)
 *   license    : string (SPDX-ish identifier where possible)
 *   github     : string (repo URL)
 *   paper      : string (arXiv / paper URL) — optional
 *   summary    : string (one-line description)
 *   tags       : string[] (extra search terms — codecs / strengths / weaknesses)
 */

window.UPSCALING_MODELS = [

  // ============================================================
  // Non-generative — classical / regression-based SR & enhancement
  // ============================================================
  {
    name: 'SRCNN',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2014,
    publisher: 'Chao Dong et al. (CUHK)',
    license: 'BSD-style (research)',
    github: 'https://github.com/tegg89/SRCNN-Tensorflow',
    paper: 'https://arxiv.org/abs/1501.00092',
    summary: 'First successful CNN super-resolution; 3-layer architecture that became the template for every regression-based SR model after it.',
    tags: ['cnn', 'baseline', 'image']
  },
  {
    name: 'VDSR',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2016,
    publisher: 'KAIST',
    license: 'MIT',
    github: 'https://github.com/twtygqyy/pytorch-vdsr',
    paper: 'https://arxiv.org/abs/1511.04587',
    summary: 'Very Deep SR — 20-layer CNN with residual learning; first model to demonstrate depth matters for SR.',
    tags: ['residual', 'deep cnn']
  },
  {
    name: 'EDSR',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2017,
    publisher: 'SNU (NTIRE 2017 winner)',
    license: 'MIT',
    github: 'https://github.com/sanghyun-son/EDSR-PyTorch',
    paper: 'https://arxiv.org/abs/1707.02921',
    summary: 'Enhanced Deep SR — removed batch norm, deeper residual blocks. NTIRE 2017 winner; baseline for many follow-ups.',
    tags: ['ntire', 'residual', 'pytorch']
  },
  {
    name: 'ESRGAN',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2018,
    publisher: 'Xintao Wang et al. (CUHK, Tencent ARC)',
    license: 'Apache-2.0',
    github: 'https://github.com/xinntao/ESRGAN',
    paper: 'https://arxiv.org/abs/1809.00219',
    summary: 'Enhanced SRGAN with Residual-in-Residual Dense Block. Visually sharper than EDSR; backbone of all "ESRGAN" forks.',
    tags: ['gan', 'rrdb', 'perceptual']
  },
  {
    name: 'Real-ESRGAN',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2021,
    publisher: 'Tencent ARC Lab (Xintao Wang)',
    license: 'BSD 3-Clause',
    github: 'https://github.com/xinntao/Real-ESRGAN',
    paper: 'https://arxiv.org/abs/2107.10833',
    summary: 'Trained on synthesized "real-world" degradations (jpeg, blur, noise). De facto standard for free real-world image / anime upscaling.',
    tags: ['real-world', 'anime', 'ncnn', 'production']
  },
  {
    name: 'BSRGAN',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2021,
    publisher: 'ETH Zurich (Kai Zhang)',
    license: 'Apache-2.0',
    github: 'https://github.com/cszn/BSRGAN',
    paper: 'https://arxiv.org/abs/2103.14006',
    summary: 'Blind SR with rich degradation pipeline; common comparison baseline alongside Real-ESRGAN.',
    tags: ['blind sr', 'degradation', 'ethz']
  },
  {
    name: 'SwinIR',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2021,
    publisher: 'ETH Zurich',
    license: 'Apache-2.0',
    github: 'https://github.com/JingyunLiang/SwinIR',
    paper: 'https://arxiv.org/abs/2108.10257',
    summary: 'Swin-transformer-based image restoration; SR / denoise / JPEG-artifact removal in one architecture.',
    tags: ['transformer', 'restoration', 'denoise']
  },
  {
    name: 'HAT (Hybrid Attention Transformer)',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2023,
    publisher: 'XPixelGroup',
    license: 'Apache-2.0',
    github: 'https://github.com/XPixelGroup/HAT',
    paper: 'https://arxiv.org/abs/2205.04437',
    summary: 'Hybrid channel + spatial attention; SOTA on classical benchmarks. Widely used in commercial upscalers.',
    tags: ['transformer', 'attention', 'sota']
  },
  {
    name: 'BasicVSR / BasicVSR++',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2021,
    publisher: 'XPixelGroup / NTU',
    license: 'Apache-2.0',
    github: 'https://github.com/open-mmlab/mmagic',
    paper: 'https://arxiv.org/abs/2104.13371',
    summary: 'Recurrent video SR with bidirectional propagation + temporal alignment. Strong on real low-bitrate footage.',
    tags: ['video sr', 'recurrent', 'temporal']
  },
  {
    name: 'EDVR',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2019,
    publisher: 'CUHK / Tencent (Xintao Wang)',
    license: 'Apache-2.0',
    github: 'https://github.com/xinntao/EDVR',
    paper: 'https://arxiv.org/abs/1905.02716',
    summary: 'Pyramidal Cascading Deformable Convolution for video SR / deblurring. NTIRE 2019 winner.',
    tags: ['video sr', 'deformable conv', 'ntire']
  },
  {
    name: 'VRT (Video Restoration Transformer)',
    family: 'non-generative',
    task: 'restoration',
    year: 2022,
    publisher: 'ETH Zurich',
    license: 'Apache-2.0',
    github: 'https://github.com/JingyunLiang/VRT',
    paper: 'https://arxiv.org/abs/2201.12288',
    summary: 'Joint SR + denoise + deblur transformer-based video restorer; processes longer temporal windows.',
    tags: ['transformer', 'video restoration', 'temporal']
  },
  {
    name: 'RVRT',
    family: 'non-generative',
    task: 'restoration',
    year: 2022,
    publisher: 'ETH Zurich',
    license: 'Apache-2.0',
    github: 'https://github.com/JingyunLiang/RVRT',
    paper: 'https://arxiv.org/abs/2206.02146',
    summary: 'Recurrent variant of VRT — more efficient temporal modeling, better speed/quality trade-off.',
    tags: ['transformer', 'recurrent', 'video']
  },
  {
    name: 'RealBasicVSR',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2022,
    publisher: 'XPixelGroup',
    license: 'Apache-2.0',
    github: 'https://github.com/ckkelvinchan/RealBasicVSR',
    paper: 'https://arxiv.org/abs/2111.12704',
    summary: 'BasicVSR with Real-ESRGAN-style degradation pipeline; the practical "real-world" video SR baseline.',
    tags: ['video sr', 'real-world', 'pipeline']
  },
  {
    name: 'RIFE',
    family: 'non-generative',
    task: 'interpolation',
    year: 2020,
    publisher: 'Megvii (Zhewei Huang et al.)',
    license: 'MIT',
    github: 'https://github.com/megvii-research/ECCV2022-RIFE',
    paper: 'https://arxiv.org/abs/2011.06294',
    summary: 'Real-time Intermediate Flow Estimation; standard in Flowframes / SVP / Practical-RIFE pipelines.',
    tags: ['interpolation', 'optical flow', 'real-time']
  },
  {
    name: 'FILM',
    family: 'non-generative',
    task: 'interpolation',
    year: 2022,
    publisher: 'Google Research',
    license: 'Apache-2.0',
    github: 'https://github.com/google-research/frame-interpolation',
    paper: 'https://arxiv.org/abs/2202.04901',
    summary: 'Frame Interpolation for Large Motion; very strong on near-duplicate / extreme-motion pairs.',
    tags: ['interpolation', 'large motion', 'google']
  },
  {
    name: 'IFRNet',
    family: 'non-generative',
    task: 'interpolation',
    year: 2022,
    publisher: 'Tianjin University',
    license: 'MIT',
    github: 'https://github.com/ltkong218/IFRNet',
    paper: 'https://arxiv.org/abs/2205.14620',
    summary: 'Intermediate Feature Refine Network; competitive with RIFE, more deterministic at slow-motion ratios.',
    tags: ['interpolation', 'flow']
  },
  {
    name: 'AMT (All-Pairs Multi-Field Transforms)',
    family: 'non-generative',
    task: 'interpolation',
    year: 2023,
    publisher: 'Nankai Univ.',
    license: 'Apache-2.0',
    github: 'https://github.com/MCG-NKU/AMT',
    paper: 'https://arxiv.org/abs/2304.09790',
    summary: 'High-precision flow + warping for frame interpolation; popular in animation up-conversion.',
    tags: ['interpolation', 'animation']
  },
  {
    name: 'DAIN',
    family: 'non-generative',
    task: 'interpolation',
    year: 2019,
    publisher: 'UCMerced / Google',
    license: 'MIT',
    github: 'https://github.com/baowenbo/DAIN',
    paper: 'https://arxiv.org/abs/1904.00830',
    summary: 'Depth-Aware Video Frame Interpolation; one of the first widely-used deep interpolators. DAIN-App brought it mainstream.',
    tags: ['interpolation', 'depth-aware', 'legacy']
  },
  {
    name: 'GFP-GAN',
    family: 'non-generative',
    task: 'restoration',
    year: 2021,
    publisher: 'Tencent ARC Lab',
    license: 'Apache-2.0',
    github: 'https://github.com/TencentARC/GFPGAN',
    paper: 'https://arxiv.org/abs/2101.04061',
    summary: 'Generative facial prior for face restoration; routinely paired with Real-ESRGAN for high-quality face crops in video.',
    tags: ['face restoration', 'gan prior', 'tencent']
  },
  {
    name: 'CodeFormer',
    family: 'non-generative',
    task: 'restoration',
    year: 2022,
    publisher: 'NTU / S-Lab',
    license: 'S-Lab License (research)',
    github: 'https://github.com/sczhou/CodeFormer',
    paper: 'https://arxiv.org/abs/2206.11253',
    summary: 'Codebook-based face restoration with fidelity / quality knob. Strong on severely degraded faces. Non-commercial license.',
    tags: ['face restoration', 'codebook', 'non-commercial']
  },
  {
    name: 'DeOldify',
    family: 'non-generative',
    task: 'colorize',
    year: 2018,
    publisher: 'Jason Antic',
    license: 'MIT',
    github: 'https://github.com/jantic/DeOldify',
    paper: '',
    summary: 'NoGAN-trained colorizer for B&W photo / video; community-favorite for archival footage restoration.',
    tags: ['colorize', 'archival', 'video']
  },
  {
    name: 'KAIR (Kai Zhang Image Restoration toolbox)',
    family: 'non-generative',
    task: 'restoration',
    year: 2021,
    publisher: 'ETH Zurich (Kai Zhang)',
    license: 'MIT',
    github: 'https://github.com/cszn/KAIR',
    paper: '',
    summary: 'Umbrella PyTorch repo for SwinIR, DnCNN, USRNet, FFDNet, BSRGAN, etc. Reference implementations and training scripts.',
    tags: ['toolbox', 'dncnn', 'usrnet', 'ffdnet']
  },
  {
    name: 'Anime4K',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2019,
    publisher: 'bloc97 / community',
    license: 'MIT',
    github: 'https://github.com/bloc97/Anime4K',
    paper: '',
    summary: 'Real-time anime upscaling shader (GLSL); embedded in mpv / madVR / iina configs.',
    tags: ['anime', 'real-time', 'shader', 'mpv']
  },
  {
    name: 'waifu2x',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2015,
    publisher: 'nagadomi',
    license: 'MIT',
    github: 'https://github.com/nagadomi/waifu2x',
    paper: '',
    summary: 'Original anime-focused SR project; spawned multiple GUI forks (waifu2x-caffe, waifu2x-ncnn-vulkan, etc.).',
    tags: ['anime', 'legacy', 'community']
  },
  {
    name: 'DnCNN / FFDNet',
    family: 'non-generative',
    task: 'denoise',
    year: 2017,
    publisher: 'Kai Zhang (HKPolyU)',
    license: 'MIT',
    github: 'https://github.com/cszn/DnCNN',
    paper: 'https://arxiv.org/abs/1608.03981',
    summary: 'Deep residual denoiser (DnCNN) + fast-flexible variant (FFDNet); historical baseline for learned denoising.',
    tags: ['denoise', 'baseline', 'residual']
  },
  {
    name: 'Restormer',
    family: 'non-generative',
    task: 'restoration',
    year: 2021,
    publisher: 'IIAI / MBZUAI',
    license: 'Other (research)',
    github: 'https://github.com/swz30/Restormer',
    paper: 'https://arxiv.org/abs/2111.09881',
    summary: 'Efficient transformer for high-resolution image restoration; SOTA on motion-deblur / defocus / denoise.',
    tags: ['transformer', 'denoise', 'deblur']
  },
  {
    name: 'NAFNet',
    family: 'non-generative',
    task: 'restoration',
    year: 2022,
    publisher: 'megvii-research',
    license: 'MIT',
    github: 'https://github.com/megvii-research/NAFNet',
    paper: 'https://arxiv.org/abs/2204.04676',
    summary: 'Nonlinear Activation Free Net for image restoration; minimalist, very strong on deblurring + denoising.',
    tags: ['denoise', 'deblur', 'minimalist']
  },
  {
    name: 'video2x',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2018,
    publisher: 'k4yt3x',
    license: 'GPL-3.0',
    github: 'https://github.com/k4yt3x/video2x',
    paper: '',
    summary: 'Open-source wrapper around waifu2x / Real-ESRGAN / RealCUGAN with FFmpeg; a popular CLI for batch video upscale.',
    tags: ['wrapper', 'cli', 'batch']
  },
  {
    name: 'Real-CUGAN',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2022,
    publisher: 'bilibili AI Lab',
    license: 'MIT',
    github: 'https://github.com/bilibili/ailab/tree/main/Real-CUGAN',
    paper: '',
    summary: 'Bilibili\'s anime-focused upscaler tuned for 2x/3x/4x; widely used in anime fansub re-encodes.',
    tags: ['anime', 'bilibili', 'fansub']
  },
  {
    name: 'Cupscale',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2020,
    publisher: 'N00MKRAD',
    license: 'GPL-3.0',
    github: 'https://github.com/n00mkrad/cupscale',
    paper: '',
    summary: 'Windows GUI bundling ESRGAN-family models with batch / video pipelines; popular gateway tool for OSS upscaling.',
    tags: ['gui', 'windows', 'batch']
  },
  {
    name: 'chaiNNer',
    family: 'non-generative',
    task: 'restoration',
    year: 2022,
    publisher: 'chaiNNer Team',
    license: 'GPL-3.0',
    github: 'https://github.com/chaiNNer-org/chaiNNer',
    paper: '',
    summary: 'Node-based GUI for image processing pipelines (PyTorch / NCNN); de facto playground for stacking ESRGAN-family models.',
    tags: ['node graph', 'gui', 'pipeline']
  },
  {
    name: 'Flowframes',
    family: 'non-generative',
    task: 'interpolation',
    year: 2021,
    publisher: 'N00MKRAD',
    license: 'GPL-3.0',
    github: 'https://github.com/n00mkrad/flowframes',
    paper: '',
    summary: 'GUI bundling RIFE / DAIN / FILM for frame interpolation; standard tool in animation interpolation community.',
    tags: ['interpolation', 'gui', 'rife']
  },

  // ============================================================
  // Generative — diffusion / latent / video-foundation models
  // ============================================================
  {
    name: 'Stable Diffusion Upscale (SD x4 Upscaler)',
    family: 'generative',
    task: 'super-resolution',
    year: 2022,
    publisher: 'Stability AI',
    license: 'CreativeML Open RAIL++-M',
    github: 'https://github.com/Stability-AI/stablediffusion',
    paper: 'https://arxiv.org/abs/2112.10752',
    summary: 'Latent diffusion x4 upscaler released with SD 2.x; hallucinates plausible detail. Core of many image upscale tools.',
    tags: ['diffusion', 'latent', 'stability']
  },
  {
    name: 'StableSR',
    family: 'generative',
    task: 'super-resolution',
    year: 2023,
    publisher: 'NTU / S-Lab',
    license: 'S-Lab License (research)',
    github: 'https://github.com/IceClear/StableSR',
    paper: 'https://arxiv.org/abs/2305.07015',
    summary: 'Stable Diffusion priors for real-world image SR; preserves fidelity better than vanilla SD upscale.',
    tags: ['diffusion', 'real-world sr', 'fidelity']
  },
  {
    name: 'SUPIR',
    family: 'generative',
    task: 'super-resolution',
    year: 2024,
    publisher: 'XPixelGroup',
    license: 'Apache-2.0',
    github: 'https://github.com/Fanghua-Yu/SUPIR',
    paper: 'https://arxiv.org/abs/2401.13627',
    summary: 'Scaling-Up Image Restoration with SDXL backbone + LLaVA prompts. State-of-the-art photorealistic restoration.',
    tags: ['diffusion', 'sdxl', 'photoreal']
  },
  {
    name: 'CCSR',
    family: 'generative',
    task: 'super-resolution',
    year: 2024,
    publisher: 'XPixelGroup',
    license: 'Apache-2.0',
    github: 'https://github.com/csslc/CCSR',
    paper: 'https://arxiv.org/abs/2401.00877',
    summary: 'Consistent Compact SR diffusion model; fewer steps, more deterministic detail than StableSR / SUPIR.',
    tags: ['diffusion', 'consistent', 'compact']
  },
  {
    name: 'SinSR',
    family: 'generative',
    task: 'super-resolution',
    year: 2024,
    publisher: 'CUHK / XPixelGroup',
    license: 'Apache-2.0',
    github: 'https://github.com/wyf0912/SinSR',
    paper: 'https://arxiv.org/abs/2311.14760',
    summary: 'Single-step diffusion SR — distills multi-step diffusion into one forward pass for near-real-time generation.',
    tags: ['diffusion', 'one-step', 'distillation']
  },
  {
    name: 'PASD',
    family: 'generative',
    task: 'super-resolution',
    year: 2024,
    publisher: 'Alibaba',
    license: 'Apache-2.0',
    github: 'https://github.com/yangxy/PASD',
    paper: 'https://arxiv.org/abs/2308.14469',
    summary: 'Pixel-Aware Stable Diffusion for real-world image SR + face restoration. Stronger semantic prior than baseline SD-upscale.',
    tags: ['diffusion', 'pixel-aware', 'alibaba']
  },
  {
    name: 'AnimateDiff (+ upscaler variants)',
    family: 'generative',
    task: 'stylize',
    year: 2023,
    publisher: 'Yuwei Guo et al.',
    license: 'Apache-2.0',
    github: 'https://github.com/guoyww/AnimateDiff',
    paper: 'https://arxiv.org/abs/2307.04725',
    summary: 'Motion adapter for SD checkpoints; commonly paired with upscale ControlNet / Tile to make 1080p stylized videos.',
    tags: ['diffusion', 'animation', 'motion adapter']
  },
  {
    name: 'Stable Video Diffusion (SVD)',
    family: 'generative',
    task: 'super-resolution',
    year: 2023,
    publisher: 'Stability AI',
    license: 'STV CL',
    github: 'https://github.com/Stability-AI/generative-models',
    paper: 'https://arxiv.org/abs/2311.15127',
    summary: 'Image-to-video diffusion model with optional upscale stage; the SVD-XT variant outputs higher-res frames.',
    tags: ['diffusion', 'i2v', 'stability']
  },
  {
    name: 'ModelScope Text2Video',
    family: 'generative',
    task: 'super-resolution',
    year: 2023,
    publisher: 'Alibaba DAMO',
    license: 'Apache-2.0',
    github: 'https://github.com/modelscope/modelscope',
    paper: 'https://arxiv.org/abs/2308.06571',
    summary: 'Early open-source text-to-video model with cascaded super-resolution; foundation for many derivatives.',
    tags: ['diffusion', 'text-to-video', 'damo']
  },
  {
    name: 'VideoCrafter1 / VideoCrafter2',
    family: 'generative',
    task: 'super-resolution',
    year: 2023,
    publisher: 'Tencent ARC Lab',
    license: 'Apache-2.0',
    github: 'https://github.com/AILab-CVC/VideoCrafter',
    paper: 'https://arxiv.org/abs/2401.09047',
    summary: 'Latent video diffusion suite (T2V + I2V) with high-quality SR head; widely fine-tuned for stylized motion.',
    tags: ['diffusion', 'tencent', 't2v', 'i2v']
  },
  {
    name: 'AnimateLCM',
    family: 'generative',
    task: 'stylize',
    year: 2024,
    publisher: 'GhostFox-org',
    license: 'CreativeML Open RAIL-M',
    github: 'https://github.com/G-U-N/AnimateLCM',
    paper: 'https://arxiv.org/abs/2402.00769',
    summary: 'Latent Consistency Model on top of AnimateDiff for fast / few-step video gen; popular in real-time interactive pipelines.',
    tags: ['diffusion', 'consistency', 'fast']
  },
  {
    name: 'Latte',
    family: 'generative',
    task: 'super-resolution',
    year: 2024,
    publisher: 'Shanghai AI Lab',
    license: 'Apache-2.0',
    github: 'https://github.com/Vchitect/Latte',
    paper: 'https://arxiv.org/abs/2401.03048',
    summary: 'Latent Diffusion Transformer (DiT-style) for video; supports cascaded upscale stages.',
    tags: ['diffusion', 'transformer', 'shanghai ai lab']
  },
  {
    name: 'CogVideoX',
    family: 'generative',
    task: 'super-resolution',
    year: 2024,
    publisher: 'THUDM',
    license: 'Apache-2.0',
    github: 'https://github.com/THUDM/CogVideo',
    paper: 'https://arxiv.org/abs/2408.06072',
    summary: 'Tsinghua / Zhipu AI open video diffusion model; 720p / 1080p output with quality close to Kling.',
    tags: ['diffusion', 'thudm', 'open weights']
  },
  {
    name: 'Open-Sora',
    family: 'generative',
    task: 'super-resolution',
    year: 2024,
    publisher: 'HPC-AI Tech',
    license: 'Apache-2.0',
    github: 'https://github.com/hpcaitech/Open-Sora',
    paper: '',
    summary: 'Community open-source effort to replicate OpenAI Sora; produces 720p videos with cascaded SR. Active development.',
    tags: ['open source', 'sora replica', 't2v']
  },
  {
    name: 'AnimateDiff-Lightning',
    family: 'generative',
    task: 'stylize',
    year: 2024,
    publisher: 'ByteDance',
    license: 'Apache-2.0',
    github: 'https://github.com/ByteDance/AnimateDiff-Lightning',
    paper: 'https://arxiv.org/abs/2403.12706',
    summary: 'Distilled few-step variant of AnimateDiff from ByteDance; 4-step generation, common in production stylized video pipelines.',
    tags: ['diffusion', 'distilled', 'bytedance']
  },
  {
    name: 'ControlNet-Tile + Diffusion Upscale',
    family: 'generative',
    task: 'super-resolution',
    year: 2023,
    publisher: 'lllyasviel (Stanford)',
    license: 'Apache-2.0',
    github: 'https://github.com/lllyasviel/ControlNet',
    paper: 'https://arxiv.org/abs/2302.05543',
    summary: 'ControlNet-Tile model + diffusion x2/x4 sampling — the common "stable-diffusion-webui" upscale recipe. Strong on photo, mediocre on faces.',
    tags: ['controlnet', 'tile', 'sd-webui']
  },
  {
    name: 'AuraSR',
    family: 'generative',
    task: 'super-resolution',
    year: 2024,
    publisher: 'fal.ai',
    license: 'Apache-2.0',
    github: 'https://github.com/fal-ai/AuraSR',
    paper: '',
    summary: 'Distilled diffusion-based upscaler optimized for inference on small GPUs; popular as a cheap alternative to SUPIR.',
    tags: ['diffusion', 'small gpu', 'fal']
  },
  {
    name: 'APISR (Anime Production-oriented Image SR)',
    family: 'generative',
    task: 'super-resolution',
    year: 2024,
    publisher: 'University of Maryland',
    license: 'GPL-3.0',
    github: 'https://github.com/Kiteretsu77/APISR',
    paper: 'https://arxiv.org/abs/2403.01598',
    summary: 'Anime-specific GAN-based SR designed for production frames; competes with Real-ESRGAN anime models with sharper line art.',
    tags: ['anime', 'gan', 'production']
  },
  {
    name: 'Upscayl (open source desktop)',
    family: 'non-generative',
    task: 'super-resolution',
    year: 2022,
    publisher: 'TGS963 / Upscayl team',
    license: 'AGPL-3.0',
    github: 'https://github.com/upscayl/upscayl',
    paper: '',
    summary: 'Cross-platform Electron desktop frontend bundling Real-ESRGAN, REMACRI, ULTRAMIX, etc. Photos only but very approachable.',
    tags: ['desktop', 'gui', 'photo', 'electron']
  }
];
