const PLAYER_IDS = [1,2,3,4];
    const DEFAULT_LAYOUT_ID = '1x2';
    const LAYOUTS = {
      '1x2': { label: '1x2', playerCount: 2, columns: 2, rows: 1 },
      '2x2': { label: '2x2', playerCount: 4, columns: 2, rows: 2 },
      '1x4': { label: '1x4', playerCount: 4, columns: 4, rows: 1 },
      '1x3': { label: '1x3', playerCount: 3, columns: 3, rows: 1 }
    };
    const getLayoutConfig = (layoutId)=>LAYOUTS[layoutId] || LAYOUTS[DEFAULT_LAYOUT_ID];
    let activeLayoutId = DEFAULT_LAYOUT_ID;
    let activePlayerCount = getLayoutConfig(DEFAULT_LAYOUT_ID).playerCount;
    const videos = PLAYER_IDS.map(i=>document.getElementById("video"+i));
    const images = PLAYER_IDS.map(i=>document.getElementById("image"+i));
    const syncedCursors = PLAYER_IDS.map(i=>document.getElementById("syncCursor"+i));
    const boxes = PLAYER_IDS.map(i=>document.getElementById("box"+i));
    const videoColumns = boxes.map(box=>box ? box.closest('.video-column') : null);
    const labels = PLAYER_IDS.map(i=>document.getElementById("label"+i));
    const gridEl = document.querySelector('.grid');
    const compareLayoutSelect = document.getElementById("compareLayoutSelect");
    const captureStillButton = document.getElementById("captureStillButton");
    const monitorPanel = document.getElementById("monitorPanel");
    const monitorCloseButton = monitorPanel ? monitorPanel.querySelector('.monitor-close') : null;
    const playlistToggle = document.getElementById("playlistToggle");
    const playlistOverlay = document.getElementById("playlistOverlay");
    const playlistBody = document.getElementById("playlistBody");
    const playlistClose = document.getElementById("playlistClose");
    const playlistEditButtons = Array.from(document.querySelectorAll('.playlist-edit-btn'));
    const multiAddButtons = Array.from(document.querySelectorAll('.multi-add-btn'));
    const bulkModals = Array.from(document.querySelectorAll('.bulk-modal'));


    const getEls = prefix => PLAYER_IDS.map(i=>document.getElementById(prefix + i));
    const sparklineCanvases = {
      speed: getEls("speedGraph"),
      latency: getEls("latencyGraph"),
      bandwidth: getEls("bandwidthGraph"),
      buffer: getEls("bufferGraph"),
      ingest: getEls("ingestGraph")
    };
    const metricEls = {
      speed: getEls("speedValue"),
      speedInstant: getEls("speedInstant"),
      latency: getEls("latencyValue"),
      bandwidth: getEls("bandwidthValue"),
      buffer: getEls("bufferValue"),
      ingest: getEls("ingestValue"),
      playback: getEls("playbackValue"),
      stallCount: getEls("stallValue"),
      stallDuration: getEls("stallDuration"),
      quality: getEls("qualityValue"),
      codec: getEls("codecValue"),
      dropped: getEls("droppedValue"),
      errorNetwork: getEls("errorNetwork"),
      errorMedia: getEls("errorMedia"),
      errorOther: getEls("errorOther")
    };
    const allCanvases = Object.values(sparklineCanvases).flat().filter(Boolean);
    const timeDiffValueEl = document.getElementById("timeDiffValue");
    const timeDiffDetailEl = document.getElementById("timeDiffDetail");
    const controlSets = videos.map((_,index)=>{
      const playbar=document.querySelector(`.playbar[data-player="${index}"]`);
      return {
        playbar,
        playButton: playbar?.querySelector('.play-toggle') || null,
        timeline: playbar?.querySelector('.timeline') || null,
        current: playbar?.querySelector('.time-current') || null,
        total: playbar?.querySelector('.time-total') || null,
        fullscreen: playbar?.querySelector('.fullscreen-toggle') || null
      };
    });
    const timelineActive = controlSets.map(()=>false);
    const TIMELINE_BASE_BG='rgba(244,244,244,0.16)';
    const SPEED_AVG_WINDOW_MS = 60000;
    const ZOOM_MIN = 1;
    const ZOOM_MAX = 50;
    const EXR_FORMAT_RGBA = 1023;
    const EXR_FORMAT_RED = 1028;
    const IMAGE_EXTENSIONS = new Set(['.png','.jpg','.jpeg','.webp','.gif','.bmp','.svg','.avif']);
    const EXR_EXTENSIONS = new Set(['.exr']);
    const VIDEO_EXTENSIONS = new Set(['.mp4','.webm','.mov','.m4v','.mkv','.avi','.ts','.m3u8']);
    const HLS_DEFAULT_CONFIG = {
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 30,
      maxBufferLength: 45,
      maxMaxBufferLength: 90,
      maxBufferSize: 120 * 1000 * 1000,
      startFragPrefetch: true,
      manifestLoadingMaxRetry: 4,
      levelLoadingMaxRetry: 4,
      fragLoadingMaxRetry: 4,
      fragLoadingRetryDelay: 750,
      fragLoadingMaxRetryTimeout: 10000
    };
    const CAPTURE_CANVAS = document.createElement('canvas');
    const CAPTURE_CTX = CAPTURE_CANVAS.getContext('2d');

    const getActivePlayerIndices = ()=>PLAYER_IDS.map((_,index)=>index).filter(index=>index<activePlayerCount);
    const isPlayerActive = index => Number.isInteger(index) && index>=0 && index<activePlayerCount;

    function applyModeState(layoutId){
      const layout = getLayoutConfig(layoutId);
      activeLayoutId = Object.prototype.hasOwnProperty.call(LAYOUTS, layoutId) ? layoutId : DEFAULT_LAYOUT_ID;
      activePlayerCount = layout.playerCount;
      if(gridEl){
        gridEl.style.gridTemplateColumns = `repeat(${layout.columns}, minmax(0, 1fr))`;
        gridEl.style.gridTemplateRows = `repeat(${layout.rows}, minmax(0, 1fr))`;
        gridEl.dataset.layout = activeLayoutId;
      }
      if(compareLayoutSelect && compareLayoutSelect.value !== activeLayoutId){
        compareLayoutSelect.value = activeLayoutId;
      }
      videoColumns.forEach((col,index)=>{
        if(!col) return;
        col.style.display = isPlayerActive(index) ? 'flex' : 'none';
      });
      playlistEditButtons.forEach(btn=>{
        const player=parseInt(btn.dataset.player,10);
        if(!Number.isInteger(player)) return;
        btn.style.display=isPlayerActive(player)?'':'none';
      });
      controlSets.forEach((controls,index)=>{
        if(!controls || !controls.playbar) return;
        controls.playbar.style.display=isPlayerActive(index)?'':'none';
      });
      PLAYER_IDS.forEach((_,index)=>{
        if(isPlayerActive(index)) return;
        const v=videos[index];
        if(v && !v.paused) v.pause();
      });
      getActivePlayerIndices().forEach(index=>updateTimelineForPlayer(index,true));
      updatePlayButtons();
      hideSyncedCursor();
      refreshPlaylistOverlay();
    }


    let zoom=2;
    let zoomedIn=false;
    let cropState=0; // 0:none, 1:left, 2:right
    let monitorVisible=false;
    let cursorSyncEnabled=true;
    const playlistPairs=[];
    let playlistIdCounter=0;
    let currentPlaylistIndex=null;
    let currentPlaylistId=null;

    // --- rVFC sync ---
    const RVFC_SUPPORTED='requestVideoFrameCallback' in HTMLVideoElement.prototype;
    const RVFC_DRIFT_THRESHOLD=0.5; // 500ms: only correct large drifts to avoid seek-stutter
    let rVFCHandle=null;
    let rVFCMasterIndex=null;

    // --- Frame cache (seamless loop for short local videos) ---
    const FRAME_CACHE_MAX_DURATION=8; // seconds: only cache if <= this length
    const FRAME_CACHE_MAX_WIDTH=480;  // cap resolution to limit memory (~125MB per player max)
    const frameCaches=videos.map(()=>null);
    const cacheRafIds=videos.map(()=>null);

    // --- Timeline thumbnail strip ---
    const THUMB_W=160, THUMB_H=90;
    const THUMB_MAX_COUNT=30; // max thumbnails per video strip
    const thumbStrips=videos.map(()=>({frames:[],building:false}));
    const thumbPopups=videos.map(()=>null); // {popup, canvas, ctx, timeLabel}

    // --- FFmpeg codec fallback ---
    let ffmpegReady=false;
    let ffmpegLoading=false;
    let ffmpegInstance=null;

    // --- WebCodecs frame decoder (local MP4/MOV > 8s) ---
    const WEBCODECS_SUPPORTED=typeof VideoDecoder!=='undefined';
    const wcdStates=videos.map(()=>null);

    // --- Per-player stats overlay ---
    let statsActive=false;
    let statsRafId=null;
    const fpsHistories=videos.map(()=>[]);
    const lastQuality=videos.map(()=>({total:0,dropped:0,time:performance.now()}));
    const statsOverlays=videos.map(()=>null); // populated after DOM ready

    // --- MediaInfo metadata comparison ---
    let metaPanelVisible=false;
    let mediaInfoInstance=null;
    const fileMetadata=videos.map(()=>null);  // parsed meta per player
    const fileMetaAnalyzing=videos.map(()=>false);


    const metrics = videos.map(()=>({
      speedHistory:[],
      speedWindow:[],
      latencyHistory:[],
      bandwidthHistory:[],
      bufferHistory:[],
      ingestHistory:[],
      pendingFragments:[],
      lastSpeed:null,
      avgSpeed:null,
      lastLatency:null,
      lastBandwidth:null,
      lastBuffer:null,
      lastIngestLatency:null,
      lastBitrate:null,
      lastResolution:'-',
      lastCodec:'-',
      dropped:0,
      total:0,
      stallCount:0,
      stallDuration:0,
      stallStart:null,
      errors:{network:0, media:0, other:0},
      playbackRate:1,
      lastDebug:null
    }));

    window.__monitorMetrics = metrics;


    metrics.forEach((_,i)=>updateMonitorUI(i));


    syncCanvasResolution();
    if(monitorCloseButton) monitorCloseButton.addEventListener('click',()=>toggleMonitor(false));
    window.addEventListener('resize', ()=>{
      syncCanvasResolution();
      metrics.forEach((_,i)=>updateMonitorUI(i));
    });


    videos.forEach((video,index)=>{
      initVideoMonitoring(video,index);
      video.addEventListener('play',()=>{
        updatePlayButtons();
        wcdHideCanvas(index);
        const masterIndex=getActivePlayerIndices()[0];
        if(index===masterIndex) startRVFCSync(masterIndex);
      });
      video.addEventListener('pause',()=>{
        updatePlayButtons();
        const masterIndex=getActivePlayerIndices()[0];
        if(index===masterIndex) stopRVFCSync();
      });
      video.addEventListener('timeupdate',()=>updateTimelineForPlayer(index));
      video.addEventListener('seeking',()=>updateTimelineForPlayer(index,true));
    });

    controlSets.forEach((controls,index)=>{
      const {playButton,timeline,fullscreen}=controls;
      if(playButton) playButton.addEventListener('click',()=>togglePlay(index));
      if(fullscreen) fullscreen.addEventListener('click',()=>toggleFullscreen(boxes[index]));
      if(timeline){
        timeline.addEventListener('input',()=>{
          const percent=Number(timeline.value)/100;
          if(Number.isFinite(percent)) seekToPercent(percent,index);
        });
        const startDrag=()=>{ timelineActive[index]=true; };
        const endDrag=()=>{
          if(timelineActive[index]){
            timelineActive[index]=false;
            updateTimelineForPlayer(index,true);
          }
        };
        ['pointerdown','mousedown','touchstart'].forEach(evt=>timeline.addEventListener(evt,startDrag));
        ['pointerup','mouseup','touchend','touchcancel','mouseleave'].forEach(evt=>timeline.addEventListener(evt,endDrag));
        timeline.addEventListener('blur',endDrag);
      }
    });

    updatePlayButtons();
    updateTimelineUI(true);
    initializePlaylistSystem();
    if(compareLayoutSelect){
      compareLayoutSelect.addEventListener('change',()=>{
        applyModeState(compareLayoutSelect.value);
      });
    }
    if(captureStillButton){
      captureStillButton.addEventListener('click',()=>captureAllVisibleVideoStills());
    }
    applyModeState(DEFAULT_LAYOUT_ID);
    // Set up timeline thumbnail hover for all players
    videos.forEach((_,i)=>setupTimelineThumb(i));
    // Stats overlay init + toggle button
    initStatsOverlays();
    const statsToggleBtn=document.getElementById('statsToggleBtn');
    if(statsToggleBtn) statsToggleBtn.addEventListener('click',toggleStats);
    // Meta panel toggle
    const metaToggleBtn=document.getElementById('metaToggleBtn');
    if(metaToggleBtn) metaToggleBtn.addEventListener('click',toggleMetaPanel);
    const metaPanelClose=document.getElementById('metaPanelClose');
    if(metaPanelClose) metaPanelClose.addEventListener('click',toggleMetaPanel);


    boxes.forEach((box,i)=>{
      const video=videos[i],label=labels[i];
      const dropZone=box.querySelector(".drop-zone");
      const fileInput=box.querySelector('input[type=file]');
      const urlInput=box.querySelector(".url-input");


      dropZone.addEventListener("click",()=>fileInput.click());
      fileInput.addEventListener("change",e=>handleFile(e.target.files[0],video,label,box,i));


      urlInput.addEventListener("keydown",e=>{
        if(e.key==="Enter"){
          const url=e.target.value.trim();
          if(url) handleURL(url,video,label,box,i);
        }
      });


      box.addEventListener("dragenter",e=>{ e.preventDefault(); box.classList.add('dragover-active'); });
      box.addEventListener("dragleave",e=>{ if(!box.contains(e.relatedTarget)) box.classList.remove('dragover-active'); });
      box.addEventListener("dragover",e=>e.preventDefault());
      box.addEventListener("drop",e=>{
        e.preventDefault();
        box.classList.remove('dragover-active');
        const dt=e.dataTransfer;
        if(dt.files.length>0) handleFile(dt.files[0],video,label,box,i);
        else{
          const url=dt.getData("text")||dt.getData("text/plain");
          if(url) handleURL(url.trim(),video,label,box,i);
        }
      });


      box.addEventListener("mousemove",e=>{
        handleZoomMove(e,box);
        updateSyncedCursor(i,e);
      });
      box.addEventListener("mouseenter",e=>updateSyncedCursor(i,e));
      box.addEventListener("mouseleave",e=>{
        const next=e.relatedTarget;
        const movingToOther=boxes.some((candidate,idx)=>idx!==i && candidate && next && candidate.contains(next));
        if(!movingToOther) hideSyncedCursor();
      });
      box.addEventListener("wheel",e=>{
        if(!box.classList.contains("loaded"))return;
        e.preventDefault();
        zoom+=e.deltaY*-0.01;
        zoom=Math.min(Math.max(zoom,ZOOM_MIN),ZOOM_MAX);
        updateTransforms();
      });
      box.addEventListener("click",()=>{
        if(!box.classList.contains("loaded"))return;
        zoomedIn=!zoomedIn;
        boxes.forEach(b=>b.style.cursor=zoomedIn?"zoom-out":"zoom-in");
        updateTransforms();
      });
    });

    function initializePlaylistSystem(){
      bulkModals.forEach(initBulkModal);
      multiAddButtons.forEach(btn=>{
        btn.addEventListener('click',()=>{
          const player=parseInt(btn.dataset.player,10);
          openBulkModal(player);
        });
      });
      if(playlistToggle) playlistToggle.setAttribute('aria-pressed','false');
      if(playlistToggle && playlistOverlay){
        playlistToggle.addEventListener('click',()=>{
          const willShow=!playlistOverlay.classList.contains('visible');
          playlistOverlay.classList.toggle('visible',willShow);
          playlistOverlay.setAttribute('aria-hidden',willShow?'false':'true');
          playlistToggle.classList.toggle('active',willShow);
          playlistToggle.setAttribute('aria-pressed',willShow?'true':'false');
          if(willShow) refreshPlaylistOverlay();
        });
      }
      if(playlistClose){
        playlistClose.addEventListener('click',hidePlaylistOverlay);
      }
      if(playlistOverlay){
        playlistOverlay.addEventListener('click',e=>{
          if(e.target===playlistOverlay) hidePlaylistOverlay();
        });
      }
      document.addEventListener('keydown',e=>{
        if(e.key==='Escape' && playlistOverlay && playlistOverlay.classList.contains('visible')) hidePlaylistOverlay();
      });
      playlistEditButtons.forEach(btn=>{
        btn.addEventListener('click',()=>{
          const player=parseInt(btn.dataset.player,10);
          openBulkModal(player);
        });
      });
      if(playlistBody){
        playlistBody.addEventListener('click',handlePlaylistBodyClick);
      }
      setupPlaylistDragging();
      refreshPlaylistOverlay();
    }

    function hidePlaylistOverlay(){
      if(!playlistOverlay) return;
      playlistOverlay.classList.remove('visible');
      playlistOverlay.setAttribute('aria-hidden','true');
      if(playlistToggle){
        playlistToggle.classList.remove('active');
        playlistToggle.setAttribute('aria-pressed','false');
      }
    }

    function handlePlaylistBodyClick(event){
      const deleteBtn=event.target.closest('.playlist-delete');
      if(deleteBtn){
        const index=parseInt(deleteBtn.dataset.index,10);
        if(Number.isInteger(index)) removePlaylistRow(index);
        return;
      }
      const editBtn=event.target.closest('.playlist-cell button');
      if(editBtn){
        const player=parseInt(editBtn.dataset.player,10);
        const focusIndex=parseInt(editBtn.dataset.index,10);
        if(Number.isInteger(player)) openBulkModal(player,{focusIndex:Number.isInteger(focusIndex)?focusIndex:null});
      }
    }

    function setupPlaylistDragging(){
      if(!playlistBody) return;
      let dragIndex=null;
      playlistBody.addEventListener('dragstart',e=>{
        const row=e.target.closest('.playlist-row');
        if(!row) return;
        dragIndex=parseInt(row.dataset.index,10);
        if(!Number.isInteger(dragIndex)){
          dragIndex=null;
          return;
        }
        e.dataTransfer.effectAllowed='move';
        row.classList.add('dragging');
      });
      playlistBody.addEventListener('dragend',()=>{
        dragIndex=null;
        playlistBody.querySelectorAll('.playlist-row').forEach(r=>r.classList.remove('dragging','dragover'));
      });
      playlistBody.addEventListener('dragover',e=>{
        if(dragIndex===null) return;
        const row=e.target.closest('.playlist-row');
        if(!row) return;
        e.preventDefault();
        playlistBody.querySelectorAll('.playlist-row').forEach(r=>{ if(r!==row) r.classList.remove('dragover'); });
        row.classList.add('dragover');
      });
      playlistBody.addEventListener('dragleave',e=>{
        const row=e.target.closest('.playlist-row');
        if(row) row.classList.remove('dragover');
      });
      playlistBody.addEventListener('drop',e=>{
        if(dragIndex===null) return;
        e.preventDefault();
        const row=e.target.closest('.playlist-row');
        playlistBody.querySelectorAll('.playlist-row').forEach(r=>r.classList.remove('dragover'));
        if(!row) return;
        const targetIndex=parseInt(row.dataset.index,10);
        if(Number.isInteger(targetIndex) && targetIndex!==dragIndex){
          reorderPlaylistPairs(dragIndex,targetIndex);
        }
        dragIndex=null;
      });
    }

    function reorderPlaylistPairs(from,to){
      if(from<0||to<0||from>=playlistPairs.length||to>=playlistPairs.length||from===to) return;
      const [pair]=playlistPairs.splice(from,1);
      playlistPairs.splice(to,0,pair);
      updateCurrentPlaylistIndexFromId();
      refreshPlaylistOverlay();
    }

    function removePlaylistRow(index){
      if(index<0||index>=playlistPairs.length) return;
      const [removed]=playlistPairs.splice(index,1);
      trimTrailingEmptyPairs();
      const length=getMaxPlaylistLength();
      if(removed && removed.id===currentPlaylistId){
        currentPlaylistId=null;
        currentPlaylistIndex=null;
        if(length>0){
          const next=Math.min(index,length-1);
          loadPlaylistIndex(next,{autoplay:true,force:true});
        }else{
          refreshPlaylistOverlay();
        }
      }else{
        updateCurrentPlaylistIndexFromId();
        refreshPlaylistOverlay();
      }
    }

    function getMaxPlaylistLength(){
      return playlistPairs.length;
    }

    function setPlaylistForPlayer(playerIndex,items){
      const cleaned=items.map(clonePlaylistItem).filter(Boolean);
      const maxLength=Math.max(cleaned.length,playlistPairs.length);
      for(let i=0;i<maxLength;i++){
        let pair=playlistPairs[i];
        if(!pair){
          pair={id:playlistIdCounter++,sources:Array(videos.length).fill(null)};
          playlistPairs[i]=pair;
        }
        pair.sources[playerIndex]=cleaned[i]||null;
      }
      for(let i=cleaned.length;i<playlistPairs.length;i++){
        if(playlistPairs[i]) playlistPairs[i].sources[playerIndex]=playlistPairs[i].sources[playerIndex]||null;
      }
      trimTrailingEmptyPairs();
      if(cleaned.length>0){
        loadPlaylistIndex(0,{autoplay:true,force:true});
      }else{
        if(getMaxPlaylistLength()===0){
          currentPlaylistId=null;
          currentPlaylistIndex=null;
        }else{
          updateCurrentPlaylistIndexFromId();
        }
        refreshPlaylistOverlay();
      }
    }

    function trimTrailingEmptyPairs(){
      while(playlistPairs.length && playlistPairs[playlistPairs.length-1].sources.every(src=>!src)){
        playlistPairs.pop();
      }
    }

    function refreshPlaylistOverlay(){
      if(!playlistBody) return;
      playlistBody.innerHTML='';
      const length=getMaxPlaylistLength();
      if(length===0){
        const empty=document.createElement('div');
        empty.className='playlist-empty';
        empty.textContent='Playlist is empty. Add items to create a list.';
        playlistBody.appendChild(empty);
      }else{
        const activeIndices=getActivePlayerIndices();
        playlistPairs.forEach((pair,index)=>{
          const row=document.createElement('div');
          row.className='playlist-row';
          row.style.setProperty('--playlist-player-count',String(activeIndices.length));
          row.dataset.index=index;
          row.setAttribute('draggable','true');
          if(pair.id===currentPlaylistId) row.classList.add('active');
          const indexTag=document.createElement('div');
          indexTag.className='playlist-index-tag';
          indexTag.textContent=`#${index+1}`;
          row.appendChild(indexTag);
          activeIndices.forEach(player=>{
            const item=pair.sources[player];
            const cell=document.createElement('div');
            cell.className='playlist-cell';
            if(!item){
              cell.classList.add('empty');
              const label=document.createElement('span');
              label.className='playlist-label';
              label.textContent=`P${player+1}`;
              const name=document.createElement('span');
              name.className='playlist-name';
              name.textContent='Empty';
              cell.appendChild(label);
              cell.appendChild(name);
            }else{
              const label=document.createElement('span');
              label.className='playlist-label';
              label.textContent=`P${player+1}`;
              const name=document.createElement('span');
              name.className='playlist-name';
              name.textContent=item.name||item.url||'';
              const type=document.createElement('span');
              type.className='playlist-type';
              type.textContent=item.type==='file'?'📁 File':'🔗 URL';
              cell.appendChild(label);
              cell.appendChild(name);
              cell.appendChild(type);
            }
            const edit=document.createElement('button');
            edit.type='button';
            edit.textContent='Edit';
            edit.dataset.player=player;
            edit.dataset.index=index;
            cell.appendChild(edit);
            row.appendChild(cell);
          });
          const del=document.createElement('button');
          del.className='playlist-delete';
          del.type='button';
          del.dataset.index=index;
          del.textContent='Delete';
          row.appendChild(del);
          playlistBody.appendChild(row);
        });
      }
      if(playlistOverlay){
        playlistOverlay.setAttribute('aria-hidden',playlistOverlay.classList.contains('visible')?'false':'true');
      }
      if(playlistToggle){
        playlistToggle.classList.toggle('has-items',getMaxPlaylistLength()>0);
      }
    }

    function updateCurrentPlaylistIndexFromId(){
      if(currentPlaylistId===null){
        currentPlaylistIndex=null;
        return;
      }
      const idx=playlistPairs.findIndex(pair=>pair && pair.id===currentPlaylistId);
      currentPlaylistIndex=idx>=0?idx:null;
      if(idx<0) currentPlaylistId=null;
    }

    function openBulkModal(playerIndex,{focusIndex=null}={}){
      if(!isPlayerActive(playerIndex)) return;
      const modal=bulkModals.find(m=>parseInt(m.dataset.player,10)===playerIndex);
      if(!modal) return;
      if(playlistOverlay && playlistOverlay.classList.contains('visible')) hidePlaylistOverlay();
      const items=playlistPairs.map(pair=>pair?.sources?.[playerIndex]).filter(item=>item);
      populateBulkModal(modal,items);
      modal.classList.add('visible');
      modal.setAttribute('aria-hidden','false');
      modal.dataset.focusIndex = Number.isInteger(focusIndex)?String(focusIndex):'';
      if(Number.isInteger(focusIndex)){
        requestAnimationFrame(()=>{
          const rows=modal.querySelectorAll('.bulk-row');
          const target=rows[focusIndex];
          if(target){
            target.classList.add('highlight');
            target.scrollIntoView({block:'center'});
            setTimeout(()=>target.classList.remove('highlight'),1200);
          }
        });
      }
    }

    function closeBulkModal(modal){
      modal.classList.remove('visible');
      modal.setAttribute('aria-hidden','true');
      modal._state.activeRow=null;
    }

    function initBulkModal(modal){
      const playerIndex=parseInt(modal.dataset.player,10);
      const rowsContainer=modal.querySelector('.bulk-rows');
      const dropZone=modal.querySelector('.bulk-drop');
      const addRowBtn=modal.querySelector('.bulk-add-row');
      const applyBtn=modal.querySelector('.bulk-apply');
      const closeBtn=modal.querySelector('.bulk-close');
      const fileInput=modal.querySelector('.bulk-file-input');
      modal._state={playerIndex,rowsContainer,fileInput,activeRow:null};

      dropZone.addEventListener('click',()=>{
        modal._state.activeRow=null;
        fileInput.value='';
        fileInput.click();
      });
      ['dragenter','dragover'].forEach(evt=>dropZone.addEventListener(evt,e=>{
        e.preventDefault();
        dropZone.classList.add('dragover');
      }));
      ['dragleave','dragend'].forEach(evt=>dropZone.addEventListener(evt,()=>dropZone.classList.remove('dragover')));
      dropZone.addEventListener('drop',e=>{
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files=Array.from(e.dataTransfer.files||[]);
        if(files.length) placeFilesIntoRows(modal,files);
      });

      addRowBtn.addEventListener('click',()=>createBulkRow(modal,{type:'file'}));

      applyBtn.addEventListener('click',()=>{
        const items=collectBulkItems(modal);
        setPlaylistForPlayer(playerIndex,items);
        closeBulkModal(modal);
      });

      closeBtn.addEventListener('click',()=>closeBulkModal(modal));

      modal.addEventListener('keydown',e=>{
        if(e.key==='Escape') closeBulkModal(modal);
      });

      fileInput.addEventListener('change',e=>{
        const files=Array.from(e.target.files||[]);
        if(!files.length) return;
        if(modal._state.activeRow){
          assignFileToRow(modal._state.activeRow,files[0]);
          placeFilesIntoRows(modal,files.slice(1));
        }else{
          placeFilesIntoRows(modal,files);
        }
        modal._state.activeRow=null;
        fileInput.value='';
      });

      populateBulkModal(modal,[]);
    }

    function populateBulkModal(modal,items){
      const {rowsContainer}=modal._state;
      rowsContainer.innerHTML='';
      const list=items.length?items:[{type:'file'}];
      list.forEach(item=>createBulkRow(modal,item));
    }

    function createBulkRow(modal,data={}){
      const {rowsContainer,fileInput}=modal._state;
      const row=document.createElement('div');
      row.className='bulk-row';
      const initialType=data.type==='url'?'url':'file';
      row.dataset.type=initialType;

      const typeSelect=document.createElement('select');
      typeSelect.className='bulk-type';
      typeSelect.innerHTML='<option value="file">File</option><option value="url">URL</option>';
      typeSelect.value=initialType;

      const content=document.createElement('div');
      content.style.display='flex';
      content.style.flexDirection='column';
      content.style.gap='6px';

      const fileWrapper=document.createElement('div');
      fileWrapper.style.display='flex';
      fileWrapper.style.flexDirection='column';
      fileWrapper.style.gap='6px';

      const fileButton=document.createElement('button');
      fileButton.type='button';
      fileButton.className='bulk-file-btn';
      fileButton.textContent='Choose file';
      const fileName=document.createElement('span');
      fileName.className='bulk-file-name';
      fileName.textContent=data.file?.name || data.name || 'No file selected';
      fileName.style.fontSize='11px';
      fileName.style.color='#9ecbf5';
      fileWrapper.appendChild(fileButton);
      fileWrapper.appendChild(fileName);

      const urlInput=document.createElement('input');
      urlInput.type='text';
      urlInput.placeholder='Enter URL';
      urlInput.className='bulk-url-input';
      if(data.type==='url' && data.url) urlInput.value=data.url;

      content.appendChild(fileWrapper);
      content.appendChild(urlInput);

      const removeBtn=document.createElement('button');
      removeBtn.type='button';
      removeBtn.className='bulk-remove';
      removeBtn.textContent='×';

      row.appendChild(typeSelect);
      row.appendChild(content);
      row.appendChild(removeBtn);

      rowsContainer.appendChild(row);

      function updateType(type){
        row.dataset.type=type;
        if(type==='file'){
          fileWrapper.style.display='flex';
          urlInput.style.display='none';
        }else{
          urlInput.style.display='block';
          fileWrapper.style.display='none';
        }
      }

      typeSelect.addEventListener('change',()=>{
        const type=typeSelect.value;
        if(type==='url') assignFileToRow(row,null);
        updateType(type);
      });

      fileButton.addEventListener('click',()=>{
        modal._state.activeRow=row;
        fileInput.value='';
        fileInput.click();
      });

      removeBtn.addEventListener('click',()=>{
        rowsContainer.removeChild(row);
        if(!rowsContainer.children.length) createBulkRow(modal,{type:'file'});
      });

      row._file=null;
      if(initialType==='file' && data.file){
        assignFileToRow(row,data.file);
      }
      updateType(initialType);
      return row;
    }

    function assignFileToRow(row,file){
      row._file=file||null;
      const nameEl=row.querySelector('.bulk-file-name');
      if(nameEl) nameEl.textContent=file?file.name:'No file selected';
    }

    function collectBulkItems(modal){
      const {rowsContainer}=modal._state;
      const items=[];
      rowsContainer.querySelectorAll('.bulk-row').forEach(row=>{
        const type=row.dataset.type;
        if(type==='file'){
          if(row._file) items.push({type:'file',file:row._file,name:row._file.name});
        }else if(type==='url'){
          const input=row.querySelector('.bulk-url-input');
          const value=input?input.value.trim():'';
          if(value) items.push({type:'url',url:value,name:value});
        }
      });
      return items;
    }

    function placeFilesIntoRows(modal,files){
      if(!files.length) return;
      const pending=[...files];
      const pool=Array.from(modal._state.rowsContainer.querySelectorAll('.bulk-row'));
      pending.forEach(file=>{
        let target=pool.find(row=>row.dataset.type==='file' && !row._file);
        if(!target){
          target=createBulkRow(modal,{type:'file'});
          pool.push(target);
        }
        assignFileToRow(target,file);
      });
    }

    function clonePlaylistItem(item){
      if(!item) return null;
      if(item.type==='file' && item.file){
        return {type:'file',file:item.file,name:item.name||item.file.name};
      }
      if(item.type==='url' && item.url){
        return {type:'url',url:item.url,name:item.name||item.url};
      }
      return null;
    }

    function loadPlaylistIndex(index,{autoplay=true,force=false}={}){
      if(index<0||index>=playlistPairs.length) return;
      const pair=playlistPairs[index];
      if(!pair) return;
      let loaded=false;
      const resumeTimes=videos.map(video=>{
        if(!video) return 0;
        const t=Number.isFinite(video.currentTime)?video.currentTime:0;
        return Number.isFinite(t)?t:0;
      });
      const wasPlaying=videos.map(video=>!!(video && !video.paused && !video.ended));
      pair.sources.forEach((item,player)=>{
        if(!isPlayerActive(player)) return;
        if(!item) return;
        const videoRef = videos[player];
        const hadSource = hasVideoSource(videoRef);
        const shouldPlay = autoplay ? (hadSource ? wasPlaying[player] : true) : autoplay;
        const resumeTime = resumeTimes[player] || 0;
        if(item.type==='file' && item.file){
          handleFile(item.file,videoRef,labels[player],boxes[player],player,{fromPlaylist:true,autoplay:shouldPlay,resumeTime});
        }else if(item.type==='url' && item.url){
          handleURL(item.url,videoRef,labels[player],boxes[player],player,{fromPlaylist:true,autoplay:shouldPlay,resumeTime});
        }
        loaded=true;
      });
      currentPlaylistId=pair.id;
      updateCurrentPlaylistIndexFromId();
      if(loaded||force) refreshPlaylistOverlay();
      if(loaded) updatePlayButtons();
    }


    function handleFile(file,video,label,box,index,{fromPlaylist=false,autoplay=true,resumeTime=null}={}){
      const mediaKind=inferMediaKindFromFile(file);
      if(!mediaKind){
        const fileName=file?.name||'Unknown file';
        const fileType=file?.type||'(no type)';
        alert(`Unsupported file type.\nFile: ${fileName}\nMIME: ${fileType}`);
        return;
      }
      if(mediaKind==='exr'){
        handleExrFile(file,label,box,index,{fromPlaylist}).catch(err=>{
          console.error('EXR load failed',err);
          alert(`EXR load failed: ${err.message||err}`);
        });
        return;
      }
      if(mediaKind==='image'){
        const objectURL=URL.createObjectURL(file);
        loadImageSource({url:objectURL,name:file.name,objectURL},label,box,index,{fromPlaylist});
        return;
      }
      clearImageSource(index);
      clearVideoSource(video);
      resetMetricState(index);
      const url=URL.createObjectURL(file);
      video._objectURL=url;
      video._sourceFile=file; // for WebCodecs init
      video.src=url;
      // Analyze file metadata in background
      analyzeFileMetadata(file,index).catch(()=>{});
      showVideo(index);
      applyPlaybackOptimizations(video);
      try{ video.load(); }catch(err){}
      scheduleResume(video,{resumeTime,shouldPlay:autoplay});
      // Codec fallback: MEDIA_ERR_SRC_NOT_SUPPORTED (code 4) → FFmpeg transcode
      video.addEventListener('error',function onCodecError(){
        if(video.error && video.error.code===4){
          handleCodecFallback(file,video,label,box,index).catch(err=>{
            console.error('Codec fallback failed',err);
            alert(`Codec fallback failed: ${err.message||err}`);
          });
        }
      },{once:true});
      label.textContent=file.name;
      box.classList.add("loaded");
      updateTimelineForPlayer(index,true);
      updatePlayButtons();
      if(!fromPlaylist){
        currentPlaylistId=null;
        currentPlaylistIndex=null;
        refreshPlaylistOverlay();
      }
    }


    function handleURL(
      url,
      video,
      label,
      box,
      index,
      { fromPlaylist = false, autoplay = true, resumeTime = null } = {}
    ) {
      const mediaKind=inferMediaKindFromUrl(url);
      if(mediaKind==='exr'){
        handleExrUrl(url,label,box,index,{fromPlaylist}).catch(err=>{
          console.error('EXR URL load failed',err);
          alert(`EXR URL load failed: ${err.message||err}`);
        });
        return;
      }
      if(mediaKind==='image'){
        loadImageSource({url,name:url},label,box,index,{fromPlaylist});
        return;
      }
      clearImageSource(index);
      clearVideoSource(video);

      label.textContent = url;
      box.classList.add("loaded");
      resetMetricState(index);

      // HLS handling
      if (mediaKind==='hls' || url.endsWith(".m3u8")) {
        if (Hls.isSupported()) {
          const hls = new Hls(HLS_DEFAULT_CONFIG);
          attachHlsListeners(hls, index);
          hls.loadSource(url);
          hls.attachMedia(video);
          showVideo(index);
          applyPlaybackOptimizations(video);
          scheduleResume(video, { resumeTime, shouldPlay: autoplay });
          video._hls = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          showVideo(index);
          applyPlaybackOptimizations(video);
          try{ video.load(); }catch(err){}
          scheduleResume(video, { resumeTime, shouldPlay: autoplay });
        } else {
          alert("This browser does not support HLS playback.");
        }
      }
      // Standard MP4/WebM handling
      else {
        video.src = url;
        showVideo(index);
        applyPlaybackOptimizations(video);
        try{ video.load(); }catch(err){}
        scheduleResume(video, { resumeTime, shouldPlay: autoplay });
      }

      updateTimelineForPlayer(index, true);
      updatePlayButtons();

      if (!fromPlaylist) {
        currentPlaylistId = null;
        currentPlaylistIndex = null;
        refreshPlaylistOverlay();
      }
    }




    function destroyHls(video){
      if(video._hls){
        try{ video._hls.destroy(); }catch(err){ console.warn('Hls destroy error', err); }
        video._hls=null;
      }
      if(video._pendingResumeHandler){
        video.removeEventListener('loadedmetadata',video._pendingResumeHandler);
        video._pendingResumeHandler=null;
      }
    }


    function handleZoomMove(e,box){
      if(cropState!==0) return;
      const rect=box.getBoundingClientRect();
      const xPercent=((e.clientX-rect.left)/rect.width)*100;
      const yPercent=((e.clientY-rect.top)/rect.height)*100;
      getActivePlayerIndices().forEach(idx=>{
        const v=videos[idx];
        [v,images[idx]].filter(Boolean).forEach(el=>{
          el.style.transformOrigin=`${xPercent}% ${yPercent}%`;
        });
      });
    }


    function updateTransforms(){
      const baseScale = cropState===0 ? 1 : 2;
      getActivePlayerIndices().forEach(idx=>{
        const v=videos[idx];
        [v,images[idx]].filter(Boolean).forEach(el=>{
          if(cropState===1) el.style.transformOrigin="left center";
          else if(cropState===2) el.style.transformOrigin="right center";
          else if(!zoomedIn) el.style.transformOrigin="center center";
          const totalScale = (zoomedIn ? zoom : 1) * baseScale;
          el.style.transform=`scale(${totalScale})`;
        });
      });
    }


    document.addEventListener("keydown",e=>{
      const active = document.activeElement;
      const tag = active ? active.tagName : '';
      const activeType = (active && active.type) ? String(active.type).toLowerCase() : '';
      const isInputField = tag === 'INPUT';
      const isTyping = (isInputField && !['range','button','checkbox','radio','submit'].includes(activeType)) || tag === 'TEXTAREA' || (active && active.isContentEditable);
      const key = (e.key||'');
      const lowerKey = key.toLowerCase();
      const code = e.code || '';
      if(e.key === 'Escape' && monitorVisible){
        e.preventDefault();
        toggleMonitor(false);
        return;
      }
      if(code==="Space" && !isTyping){
        e.preventDefault(); togglePlay();
      } else if(!isTyping && (lowerKey==="r" || code==="KeyR")) syncAll();
      else if(!isTyping && (lowerKey==="f" || code==="KeyF")) toggleFullscreen();
      else if(!isTyping && (/^[0-9]$/.test(key) || /^Digit[0-9]$/.test(code))){
        e.preventDefault();
        const digit=/^[0-9]$/.test(key)?parseInt(key,10):parseInt(code.replace('Digit',''),10);
        if(Number.isFinite(digit)) seekToPercent(digit/10);
      }
      else if(!isTyping && (lowerKey==="-" || key==="_" || code==="Minus")){
        e.preventDefault();
        jumpToLatestBuffered();
      }
      else if(!isTyping && (lowerKey==="arrowright"||lowerKey==="arrowleft"||code==="ArrowRight"||code==="ArrowLeft")){
        const forward = lowerKey==="arrowright" || code==="ArrowRight";
        stepFrames(e.shiftKey,forward);
      }
      else if(!isTyping && code==="Comma" && !e.shiftKey){
        e.preventDefault();
        toggleSyncedCursor();
      }
      else if(!isTyping && ((lowerKey===">"||lowerKey===".") || code==="Period")) adjustSpeed(0.1);
      else if(!isTyping && ((lowerKey===","||lowerKey==="<") || code==="Comma")) adjustSpeed(-0.1);
      else if(!isTyping && (lowerKey==="s" || code==="KeyS")) cycleCrop();
      else if(!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey && (lowerKey==="m" || code==="KeyM")){
        e.preventDefault();
        toggleMonitor();
      }
      else if(!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey && (lowerKey==="c" || code==="KeyC")){
        e.preventDefault();
        captureAllVisibleVideoStills();
      }
    });


    function hasVideoSource(video){
      return !!(video && (video.currentSrc || video.src));
    }

    function toTwoDigits(value){
      return String(value).padStart(2,'0');
    }

    function getCaptureTimestamp(date=new Date()){
      const year = date.getFullYear();
      const month = toTwoDigits(date.getMonth()+1);
      const day = toTwoDigits(date.getDate());
      const hour = toTwoDigits(date.getHours());
      const minute = toTwoDigits(date.getMinutes());
      const second = toTwoDigits(date.getSeconds());
      return `${year}${month}${day}-${hour}${minute}${second}`;
    }

    function sanitizeFileName(name){
      if(!name || typeof name!=='string') return 'capture';
      return name
        .replace(/[\\/:*?"<>|]/g,'_')
        .replace(/[\u0000-\u001F]/g,'')
        .replace(/\s+/g,' ')
        .trim();
    }

    function extractBaseName(rawName){
      if(!rawName || typeof rawName!=='string') return '';
      let candidate = rawName.trim();
      if(!candidate) return '';
      try{
        const parsed = new URL(candidate, window.location.href);
        const pathname = parsed.pathname || '';
        const lastSegment = pathname.split('/').filter(Boolean).pop();
        if(lastSegment) candidate = decodeURIComponent(lastSegment);
      }catch(err){}
      const slashIndex = Math.max(candidate.lastIndexOf('/'), candidate.lastIndexOf('\\'));
      if(slashIndex>=0) candidate = candidate.slice(slashIndex+1);
      return candidate.replace(/\.[^.]+$/,'').trim();
    }

    function triggerDownloadFromDataUrl(dataUrl,fileName){
      const a=document.createElement('a');
      a.href=dataUrl;
      a.download=fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    function captureStillForPlayer(index,timestamp){
      if(!isPlayerActive(index)) return { saved:false, reason:'inactive' };
      const video = videos[index];
      if(!video || !hasVideoSource(video)) return { saved:false, reason:'no-source' };
      if(video.readyState < 2) return { saved:false, reason:'not-ready' };
      const frameWidth = video.videoWidth || 0;
      const frameHeight = video.videoHeight || 0;
      if(frameWidth <= 0 || frameHeight <= 0) return { saved:false, reason:'invalid-size' };
      if(!CAPTURE_CTX) return { saved:false, reason:'canvas-unavailable' };

      CAPTURE_CANVAS.width = frameWidth;
      CAPTURE_CANVAS.height = frameHeight;
      CAPTURE_CTX.clearRect(0,0,frameWidth,frameHeight);
      CAPTURE_CTX.drawImage(video,0,0,frameWidth,frameHeight);

      const labelText = labels[index]?.textContent || `player${index+1}`;
      const baseName = sanitizeFileName(extractBaseName(labelText) || `player${index+1}`);
      const fileName = `${baseName}_still_${timestamp}.png`;
      try{
        const dataUrl = CAPTURE_CANVAS.toDataURL('image/png');
        triggerDownloadFromDataUrl(dataUrl,fileName);
        return { saved:true, fileName };
      }catch(err){
        console.error('Capture failed',err);
        return { saved:false, reason:'security-or-render' };
      }
    }

    function captureAllVisibleVideoStills(){
      const timestamp = getCaptureTimestamp();
      const results = getActivePlayerIndices().map(index=>captureStillForPlayer(index,timestamp));
      const saved = results.filter(item=>item.saved).length;
      const failed = results.length - saved;
      if(saved===0){
        alert('No savable video frame found. Ensure videos are loaded and a frame is currently displayed.');
      }else if(failed>0){
        alert(`Saved ${saved} frame(s). ${failed} frame(s) failed (possible remote CORS restriction or frame not ready yet).`);
      }
    }

    function hasImageSource(index){
      const image=images[index];
      return !!(image && image.src);
    }

    function hasSource(video){
      if(!video) return false;
      const index=videos.indexOf(video);
      if(index>=0 && !isPlayerActive(index)) return false;
      return hasVideoSource(video) || (index>=0 && hasImageSource(index));
    }

    function inferMediaKindFromFile(file){
      if(!file) return null;
      const mime=(file.type||'').toLowerCase();
      if(mime.startsWith('image/')) return 'image';
      if(mime.startsWith('video/')) return 'video';
      const name=(file.name||'').toLowerCase();
      const dot=name.lastIndexOf('.');
      const ext=dot>=0?name.slice(dot):'';
      if(EXR_EXTENSIONS.has(ext)) return 'exr';
      if(IMAGE_EXTENSIONS.has(ext)) return 'image';
      if(VIDEO_EXTENSIONS.has(ext)) return 'video';
      return null;
    }

    function inferMediaKindFromUrl(url){
      if(!url || typeof url!=='string') return null;
      let pathname=url;
      try{
        pathname=new URL(url,window.location.href).pathname||url;
      }catch(err){}
      const lower=pathname.toLowerCase();
      const dot=lower.lastIndexOf('.');
      const ext=dot>=0?lower.slice(dot):'';
      if(ext==='.m3u8') return 'hls';
      if(EXR_EXTENSIONS.has(ext)) return 'exr';
      if(IMAGE_EXTENSIONS.has(ext)) return 'image';
      if(VIDEO_EXTENSIONS.has(ext)) return 'video';
      return null;
    }

    function clearImageSource(index){
      const image=images[index];
      if(!image) return;
      if(image._objectURL){
        try{ URL.revokeObjectURL(image._objectURL); }catch(err){}
        image._objectURL=null;
      }
      image.removeAttribute('src');
      image.style.display='none';
    }

    function clearVideoSource(video){
      if(!video) return;
      const idx=videos.indexOf(video);
      if(idx>=0){
        destroyFrameCache(idx); destroyThumbStrip(idx); destroyWebCodecs(idx);
        fileMetadata[idx]=null; fileMetaAnalyzing[idx]=false;
        if(metaPanelVisible) refreshMetaTable();
      }
      destroyHls(video);
      if(video._objectURL){
        try{ URL.revokeObjectURL(video._objectURL); }catch(err){}
        video._objectURL=null;
      }
      video.removeAttribute('src');
      try{ video.load(); }catch(err){}
      video.style.display='block';
    }

    function showVideo(index){
      const video=videos[index];
      const image=images[index];
      if(video) video.style.display='block';
      if(image) image.style.display='none';
    }

    function showImage(index){
      const video=videos[index];
      const image=images[index];
      if(video) video.style.display='none';
      if(image) image.style.display='block';
    }

    function loadImageSource(source,label,box,index,{fromPlaylist=false}={}){
      const image=images[index];
      const video=videos[index];
      if(!image || !video) return;
      clearVideoSource(video);
      clearImageSource(index);
      resetMetricState(index);
      image.src=source.url;
      image._objectURL=source.objectURL||null;
      image.onload=()=>{ updateTransforms(); };
      image.onerror=()=>{
        console.error('Image load failed',source.name,source.url);
        alert(`Image load failed: ${source.name}`);
      };
      showImage(index);
      label.textContent=source.name;
      box.classList.add("loaded");
      updateTimelineForPlayer(index,true);
      updatePlayButtons();
      if(!fromPlaylist){
        currentPlaylistId=null;
        currentPlaylistIndex=null;
        refreshPlaylistOverlay();
      }
    }

    function decodeHalfFloat(binary){
      const exponent=(binary & 0x7c00)>>10;
      const fraction=binary & 0x03ff;
      const sign=(binary>>15)?-1:1;
      if(exponent===0){
        return sign * 6.103515625e-5 * (fraction/0x400);
      }
      if(exponent===0x1f){
        return fraction ? NaN : sign*Infinity;
      }
      return sign * Math.pow(2,exponent-15) * (1 + fraction/0x400);
    }

    function linearToSrgb8(linear){
      const safe=Number.isFinite(linear)?Math.max(0,linear):0;
      const gamma=Math.pow(safe,1/2.2);
      return Math.min(255,Math.max(0,Math.round(gamma*255)));
    }

    function renderExrToObjectUrl(exrData){
      const width=exrData.width||0;
      const height=exrData.height||0;
      if(!(width>0 && height>0)) throw new Error('Invalid EXR dimensions');
      const channelCount=exrData.format===EXR_FORMAT_RED ? 1 : 4;
      const data=exrData.data;
      if(!data || !data.length) throw new Error('Empty EXR pixel data');
      const pixels=width*height;
      const sampleStep=Math.max(1,Math.floor(pixels/20000));
      let sampledMax=1;
      for(let i=0;i<pixels;i+=sampleStep){
        const base=i*channelCount;
        const get=(offset)=>{
          const v=data[base+offset];
          return data instanceof Uint16Array ? decodeHalfFloat(v) : v;
        };
        const r=get(0);
        const g=channelCount===1?r:get(1);
        const b=channelCount===1?r:get(2);
        if(Number.isFinite(r) && r>sampledMax) sampledMax=r;
        if(Number.isFinite(g) && g>sampledMax) sampledMax=g;
        if(Number.isFinite(b) && b>sampledMax) sampledMax=b;
      }
      const scale=sampledMax>1 ? 1/sampledMax : 1;
      const canvas=document.createElement('canvas');
      canvas.width=width;
      canvas.height=height;
      const ctx=canvas.getContext('2d',{willReadFrequently:false});
      if(!ctx) throw new Error('Failed to create canvas context');
      const imageData=ctx.createImageData(width,height);
      const out=imageData.data;
      for(let i=0;i<pixels;i++){
        const base=i*channelCount;
        const outBase=i*4;
        const get=(offset)=>{
          const v=data[base+offset];
          return data instanceof Uint16Array ? decodeHalfFloat(v) : v;
        };
        const r=get(0)*scale;
        const g=(channelCount===1 ? r : get(1)*scale);
        const b=(channelCount===1 ? r : get(2)*scale);
        const a=(channelCount===1 ? 1 : get(3));
        out[outBase]=linearToSrgb8(r);
        out[outBase+1]=linearToSrgb8(g);
        out[outBase+2]=linearToSrgb8(b);
        out[outBase+3]=Math.min(255,Math.max(0,Math.round((Number.isFinite(a)?a:1)*255)));
      }
      ctx.putImageData(imageData,0,0);
      return canvas.toDataURL('image/png');
    }

    async function loadExrFromArrayBuffer(buffer,name,label,box,index,{fromPlaylist=false}={}){
      if(typeof window.parseExr!=='function'){
        throw new Error('EXR parser not initialized');
      }
      const parsed=window.parseExr(buffer,window.EXRFloatType||1015);
      const pngDataUrl=renderExrToObjectUrl(parsed);
      loadImageSource({url:pngDataUrl,name},label,box,index,{fromPlaylist});
    }

    async function handleExrFile(file,label,box,index,{fromPlaylist=false}={}){
      const buffer=await file.arrayBuffer();
      await loadExrFromArrayBuffer(buffer,file.name,label,box,index,{fromPlaylist});
    }

    async function handleExrUrl(url,label,box,index,{fromPlaylist=false}={}){
      const response=await fetch(url);
      if(!response.ok) throw new Error(`EXR download failed (${response.status})`);
      const buffer=await response.arrayBuffer();
      await loadExrFromArrayBuffer(buffer,url,label,box,index,{fromPlaylist});
    }

    function setSyncedCursorPosition(cursor,xPercent,yPercent){
      if(!cursor) return;
      cursor.style.setProperty('--cursor-x',`${xPercent}%`);
      cursor.style.setProperty('--cursor-y',`${yPercent}%`);
      cursor.classList.add('visible');
    }

    function toggleSyncedCursor(forceState){
      const nextState = typeof forceState === 'boolean' ? forceState : !cursorSyncEnabled;
      cursorSyncEnabled = nextState;
      if(!cursorSyncEnabled) hideSyncedCursor();
    }

    function hideSyncedCursor(){
      syncedCursors.forEach(cursor=>{ if(cursor) cursor.classList.remove('visible'); });
    }

    function updateSyncedCursor(sourceIndex,event){
      if(!cursorSyncEnabled){
        hideSyncedCursor();
        return;
      }
      if(!Number.isInteger(sourceIndex) || !event) return;
      if(!isPlayerActive(sourceIndex)) return;
      const sourceBox=boxes[sourceIndex];
      if(!sourceBox) return;
      const activeIndices=getActivePlayerIndices();
      const loadedAllActive=activeIndices.every(idx=>boxes[idx] && boxes[idx].classList.contains("loaded"));
      if(!loadedAllActive){
        hideSyncedCursor();
        return;
      }
      const rect=sourceBox.getBoundingClientRect();
      if(!(rect.width>0 && rect.height>0)) return;
      const xPercent=((event.clientX-rect.left)/rect.width)*100;
      const yPercent=((event.clientY-rect.top)/rect.height)*100;
      const clampedX=Math.min(Math.max(xPercent,0),100);
      const clampedY=Math.min(Math.max(yPercent,0),100);
      activeIndices.forEach(idx=>setSyncedCursorPosition(syncedCursors[idx],clampedX,clampedY));
    }

    function togglePlay(targetIndex){
      const applyTargets = targetIndex===undefined
        ? getActivePlayerIndices().map(index=>({video:videos[index],index}))
        : [{video:videos[targetIndex],index:targetIndex}];
      if(targetIndex!==undefined && !isPlayerActive(targetIndex)) return;
      const validTargets = applyTargets.filter(({video})=>hasVideoSource(video));
      if(!validTargets.length) return;

      if(targetIndex===undefined){
        const anyPlaying = validTargets.some(({video})=>!video.paused);
        validTargets.forEach(({video})=>{
          if(anyPlaying) video.pause();
          else safePlay(video);
        });
      }else{
        const video = validTargets[0].video;
        if(video.paused) safePlay(video);
        else video.pause();
      }
      updatePlayButtons();
    }
    function syncAll(){
      const activeIndices=getActivePlayerIndices();
      if(!activeIndices.length) return;
      const masterIndex=activeIndices[0];
      const master=videos[masterIndex];
      const t=(master && Number.isFinite(master.currentTime)) ? master.currentTime : 0;
      activeIndices.forEach(i=>{
        if(i!==masterIndex && hasVideoSource(videos[i])) videos[i].currentTime=t;
      });
      // Restart rVFC drift correction after manual sync
      if(master && !master.paused) startRVFCSync(masterIndex);
      updateTimelineUI(true);
    }

    // --- rVFC-based continuous drift correction ---
    function startRVFCSync(masterIndex){
      stopRVFCSync();
      if(!RVFC_SUPPORTED) return;
      const master=videos[masterIndex];
      if(!master || !hasVideoSource(master)) return;
      rVFCMasterIndex=masterIndex;

      function tick(_,meta){
        if(rVFCMasterIndex===null) return;
        const masterTime=meta.mediaTime;
        getActivePlayerIndices().forEach(i=>{
          if(i===rVFCMasterIndex) return;
          const slave=videos[i];
          if(!hasVideoSource(slave)) return;
          const drift=Math.abs(slave.currentTime-masterTime);
          // Only correct large drifts (> 500ms) to avoid constant seek-stutter
          if(drift>RVFC_DRIFT_THRESHOLD){
            try{ slave.currentTime=masterTime; }catch(e){}
          }
        });
        const m=videos[rVFCMasterIndex];
        if(m && !m.paused && hasVideoSource(m)){
          rVFCHandle=m.requestVideoFrameCallback(tick);
        }else{
          rVFCHandle=null;
          rVFCMasterIndex=null;
        }
      }

      rVFCHandle=master.requestVideoFrameCallback(tick);
    }

    function stopRVFCSync(){
      if(rVFCHandle!==null && rVFCMasterIndex!==null){
        const master=videos[rVFCMasterIndex];
        if(master && 'cancelVideoFrameCallback' in master){
          master.cancelVideoFrameCallback(rVFCHandle);
        }
      }
      rVFCHandle=null;
      rVFCMasterIndex=null;
    }

    // --- Frame cache: seamless loop for short local-file videos ---
    async function captureFrameBitmap(video,targetW,targetH){
      try{
        return await createImageBitmap(video,{resizeWidth:targetW,resizeHeight:targetH,resizeQuality:'medium'});
      }catch(e){
        // Fallback: OffscreenCanvas resize
        try{
          const oc=new OffscreenCanvas(targetW,targetH);
          oc.getContext('2d').drawImage(video,0,0,targetW,targetH);
          return oc.transferToImageBitmap();
        }catch(e2){
          return createImageBitmap(video);
        }
      }
    }

    function startFrameCacheBuild(video,index){
      if(!RVFC_SUPPORTED) return;
      if(!video._objectURL) return; // local blob only — avoid CORS issues
      const duration=video.duration;
      if(!duration||!Number.isFinite(duration)||duration>FRAME_CACHE_MAX_DURATION) return;
      if(frameCaches[index]&&frameCaches[index].ready) return; // already cached

      const nativeW=video.videoWidth||960;
      const nativeH=video.videoHeight||540;
      const scale=Math.min(1,FRAME_CACHE_MAX_WIDTH/nativeW);
      const tw=Math.max(2,Math.round(nativeW*scale));
      const th=Math.max(2,Math.round(nativeH*scale));

      const cache={frames:[],ready:false,duration,tw,th};
      frameCaches[index]=cache;

      // Show building indicator
      const indicator=document.createElement('div');
      indicator.className='cache-build-indicator';
      indicator.textContent='Caching…';
      boxes[index].appendChild(indicator);

      let lastTime=-1;

      function capture(_,meta){
        if(!frameCaches[index]||frameCaches[index]!==cache) return; // cleared
        const t=meta.mediaTime;
        if(t-lastTime>=1/60-0.001){ // ~60fps max
          lastTime=t;
          captureFrameBitmap(video,tw,th).then(bitmap=>{
            if(frameCaches[index]===cache) cache.frames.push({time:t,bitmap});
          }).catch(()=>{});
        }
        if(t<duration-0.02){
          video.requestVideoFrameCallback(capture);
        }else{
          cache.ready=true;
          indicator.remove();
          // Insert canvas overlay into box
          const canvas=document.createElement('canvas');
          canvas.className='frame-cache-canvas';
          boxes[index].appendChild(canvas);
          cache.canvas=canvas;
          startCacheOverlay(index,cache);
          // Extract thumbnail strip from cached frames (no extra decode needed)
          extractThumbStripFromCache(index).catch(()=>{});
        }
      }

      video.requestVideoFrameCallback(capture);
    }

    function startCacheOverlay(index,cache){
      const canvas=cache.canvas;
      if(!canvas) return;
      stopCacheOverlay(index); // cancel existing RAF

      const box=boxes[index];
      const rect=box.getBoundingClientRect();
      canvas.width=Math.round(rect.width)||cache.tw;
      canvas.height=Math.round(rect.height)||cache.th;
      const ctx=canvas.getContext('2d',{willReadFrequently:false,alpha:false});

      function raf(){
        if(frameCaches[index]!==cache){ cacheRafIds[index]=null; return; }
        const t=videos[index].currentTime;
        const frames=cache.frames;
        if(frames.length){
          // Binary search: find last frame with time <= t
          let lo=0,hi=frames.length-1,idx=0;
          while(lo<=hi){
            const mid=(lo+hi)>>1;
            if(frames[mid].time<=t){idx=mid;lo=mid+1;}
            else hi=mid-1;
          }
          ctx.drawImage(frames[idx].bitmap,0,0,canvas.width,canvas.height);
        }
        cacheRafIds[index]=requestAnimationFrame(raf);
      }
      cacheRafIds[index]=requestAnimationFrame(raf);
    }

    function stopCacheOverlay(index){
      if(cacheRafIds[index]!==null){
        cancelAnimationFrame(cacheRafIds[index]);
        cacheRafIds[index]=null;
      }
    }

    function destroyFrameCache(index){
      stopCacheOverlay(index);
      const cache=frameCaches[index];
      if(cache){
        if(cache.canvas) cache.canvas.remove();
        cache.frames.forEach(f=>{ try{ f.bitmap.close(); }catch(e){} });
        cache.frames=[];
      }
      frameCaches[index]=null;
      // Remove any stray build indicators
      const box=boxes[index];
      if(box){
        box.querySelectorAll('.cache-build-indicator').forEach(el=>el.remove());
        box.querySelectorAll('.frame-cache-canvas').forEach(el=>el.remove());
      }
    }

    // --- WebCodecs fast frame stepping ---

    async function initWebCodecsForPlayer(index,file){
      if(!WEBCODECS_SUPPORTED||typeof MP4Box==='undefined') return;
      const ext=(file.name.split('.').pop()||'').toLowerCase();
      if(!['mp4','mov','m4v'].includes(ext)) return;
      destroyWebCodecs(index);
      let fileBuffer;
      try{ fileBuffer=await file.arrayBuffer(); }catch(e){ return; }

      // First pass: get track info + codec description
      let trackInfo,mp4desc;
      await new Promise(resolve=>{
        const mp4=MP4Box.createFile();
        mp4.onReady=(info)=>{
          trackInfo=info?.videoTracks?.[0];
          if(trackInfo){
            try{
              const trak=mp4.getTrackById(trackInfo.id);
              const entry=trak?.mdia?.minf?.stbl?.stsd?.entries?.[0];
              const box=entry?.avcC??entry?.hvcC??entry?.vpcC??entry?.av1C;
              if(box&&typeof DataStream!=='undefined'){
                const ds=new DataStream(undefined,0,DataStream.BIG_ENDIAN);
                box.write(ds);
                mp4desc=new Uint8Array(ds.buffer,8);
              }
            }catch(e){}
          }
          resolve();
        };
        mp4.onError=resolve;
        const buf=fileBuffer.slice(0);buf.fileStart=0;
        mp4.appendBuffer(buf);mp4.flush();
      });
      if(!trackInfo) return;

      // Check WebCodecs support for this codec
      try{
        const check=await VideoDecoder.isConfigSupported({
          codec:trackInfo.codec,
          codedWidth:trackInfo.video.width,
          codedHeight:trackInfo.video.height,
        });
        if(!check.supported) return;
      }catch(e){ return; }

      // Second pass: extract sample metadata only (no data copy)
      const samples=[];
      await new Promise(resolve=>{
        const mp4=MP4Box.createFile();
        mp4.onReady=(info)=>{
          const tid=info?.videoTracks?.[0]?.id;
          if(!tid){ resolve(); return; }
          mp4.setExtractionOptions(tid,null,{nbSamples:Infinity});
          mp4.start();
        };
        mp4.onSamples=(_id,_user,batch)=>{
          for(const s of batch){
            samples.push({dts:s.dts,cts:s.cts,pts:s.dts+s.cts,
              duration:s.duration,isSync:s.is_sync,offset:s.offset,size:s.size});
            s.data=null;
          }
        };
        mp4.onFlush=resolve;mp4.onError=resolve;
        const buf=fileBuffer.slice(0);buf.fileStart=0;
        mp4.appendBuffer(buf);mp4.flush();
      });
      if(!samples.length) return;
      samples.sort((a,b)=>a.dts-b.dts);

      // Canvas overlay (above video, z-index 3)
      const box=boxes[index];
      const canvas=document.createElement('canvas');
      canvas.className='wcd-canvas';
      canvas.style.display='none';
      box.appendChild(canvas);

      wcdStates[index]={
        samples,timescale:trackInfo.timescale,
        codecString:trackInfo.codec,
        codedWidth:trackInfo.video.width,codedHeight:trackInfo.video.height,
        description:mp4desc,fileBuffer,
        canvas,ctx:canvas.getContext('2d'),
        decodeGen:0,
      };
    }

    function destroyWebCodecs(index){
      const state=wcdStates[index];
      if(!state) return;
      state.canvas?.remove();
      wcdStates[index]=null;
    }

    function wcdHideCanvas(index){
      const st=wcdStates[index];
      if(st?.canvas) st.canvas.style.display='none';
    }

    // --- Stats overlay functions ---

    function initStatsOverlays(){
      PLAYER_IDS.forEach((pid,index)=>{
        const box=boxes[index];
        if(!box) return;
        const el=document.createElement('div');
        el.className='vid-stats';
        el.id='vidStats'+pid;
        // FPS sparkline canvas
        const cv=document.createElement('canvas');
        cv.width=200; cv.height=26;
        el.appendChild(cv);
        // Stats text container
        const body=document.createElement('div');
        body.className='vs-body';
        el.appendChild(body);
        box.appendChild(el);
        statsOverlays[index]={el,canvas:cv,ctx:cv.getContext('2d'),body};
      });
    }

    function toggleStats(){
      statsActive=!statsActive;
      const btn=document.getElementById('statsToggleBtn');
      if(btn) btn.classList.toggle('active',statsActive);
      if(statsActive){
        startStatsLoop();
      }else{
        stopStatsLoop();
        statsOverlays.forEach(ov=>{ if(ov) ov.el.classList.remove('visible'); });
      }
    }

    function startStatsLoop(){
      if(statsRafId) return;
      const loop=()=>{
        updateAllStats();
        statsRafId=requestAnimationFrame(loop);
      };
      statsRafId=requestAnimationFrame(loop);
    }

    function stopStatsLoop(){
      if(statsRafId){ cancelAnimationFrame(statsRafId); statsRafId=null; }
    }

    function updateAllStats(){
      getActivePlayerIndices().forEach(i=>updateStatsForPlayer(i));
    }

    function updateStatsForPlayer(index){
      const ov=statsOverlays[index];
      if(!ov) return;
      const v=videos[index];
      const m=metrics[index];
      if(!v||!hasVideoSource(v)){
        ov.el.classList.remove('visible'); return;
      }
      ov.el.classList.add('visible');

      // FPS via getVideoPlaybackQuality()
      let fpsStr='—', dropStr='—';
      if(typeof v.getVideoPlaybackQuality==='function'){
        const q=v.getVideoPlaybackQuality();
        const now=performance.now();
        const lq=lastQuality[index];
        const dt=(now-lq.time)/1000;
        if(dt>=0.5){
          const fDelta=q.totalVideoFrames-lq.total;
          if(fDelta>0) fpsHistories[index].push(parseFloat((fDelta/dt).toFixed(2)));
          if(fpsHistories[index].length>60) fpsHistories[index].shift();
          lq.total=q.totalVideoFrames; lq.dropped=q.droppedVideoFrames; lq.time=now;
        }
        const hist=fpsHistories[index];
        const curFps=hist.length?hist[hist.length-1]:null;
        fpsStr=curFps!==null?curFps.toFixed(1)+'':'—';
        const td=v.getVideoPlaybackQuality().droppedVideoFrames;
        const tt=v.getVideoPlaybackQuality().totalVideoFrames;
        if(tt>0) dropStr=((td/tt)*100).toFixed(1)+'%';
      }

      const res=v.videoWidth&&v.videoHeight?`${v.videoWidth}×${v.videoHeight}`:'—';
      const codec=(m.lastCodec&&m.lastCodec!=='-')?m.lastCodec:'—';
      const rate=m.playbackRate!==1?`${m.playbackRate}×`:'1×';
      const stalls=String(m.stallCount);
      const bitrate=m.lastBitrate?`${Math.round(m.lastBitrate/1000)}`:'';
      const buffer=m.lastBuffer!=null?`${m.lastBuffer.toFixed(1)}s`:'';

      // Sparkline
      const hist=fpsHistories[index];
      if(hist.length>1) drawStatsSparkline(ov.ctx,ov.canvas,hist);

      // Text rows
      const fpsCls=parseFloat(fpsStr)<18?'sv-warn':'';
      const dropCls=parseFloat(dropStr)>2?'sv-warn':'';
      ov.body.innerHTML=
        `<div class="sv-row"><span class="sv-k">RES</span><span class="sv-v">${res}</span></div>`+
        `<div class="sv-row"><span class="sv-k">FPS</span><span class="sv-v ${fpsCls}">${fpsStr}</span></div>`+
        `<div class="sv-row"><span class="sv-k">DROP</span><span class="sv-v ${dropCls}">${dropStr}</span></div>`+
        `<div class="sv-row"><span class="sv-k">CODEC</span><span class="sv-v">${codec}</span></div>`+
        (bitrate?`<div class="sv-row"><span class="sv-k">KBPS</span><span class="sv-v">${bitrate}</span></div>`:'')+
        (buffer?`<div class="sv-row"><span class="sv-k">BUF</span><span class="sv-v">${buffer}</span></div>`:'')+
        `<div class="sv-row"><span class="sv-k">RATE</span><span class="sv-v">${rate}</span></div>`+
        `<div class="sv-row"><span class="sv-k">STALL</span><span class="sv-v">${stalls}</span></div>`;
    }

    function drawStatsSparkline(ctx,canvas,data){
      const w=canvas.width, h=canvas.height;
      ctx.clearRect(0,0,w,h);
      const shown=data.slice(-40);
      if(shown.length<2) return;
      const maxV=Math.max(...shown,30);
      const stepX=w/(shown.length-1);
      // fill
      ctx.beginPath();
      shown.forEach((v,i)=>{
        const x=i*stepX;
        const y=h-(v/maxV)*(h-2)-1;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      ctx.lineTo((shown.length-1)*stepX,h);
      ctx.lineTo(0,h);
      ctx.closePath();
      ctx.fillStyle='rgba(61,166,255,0.13)';
      ctx.fill();
      // line
      ctx.beginPath();
      shown.forEach((v,i)=>{
        const x=i*stepX;
        const y=h-(v/maxV)*(h-2)-1;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      ctx.strokeStyle='rgba(61,166,255,0.75)';
      ctx.lineWidth=1.5;
      ctx.stroke();
      // 24fps reference line
      const refY=h-(24/maxV)*(h-2)-1;
      ctx.beginPath();
      ctx.setLineDash([3,3]);
      ctx.moveTo(0,refY); ctx.lineTo(w,refY);
      ctx.strokeStyle='rgba(255,200,60,0.3)';
      ctx.lineWidth=1;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // --- MediaInfo metadata comparison ---

    async function getMediaInfoInstance(){
      if(mediaInfoInstance) return mediaInfoInstance;
      return new Promise((resolve,reject)=>{
        if(typeof window.MediaInfo!=='function'){ reject(new Error('MediaInfo not loaded')); return; }
        window.MediaInfo({
          format:'JSON',
          locateFile:(path)=>`https://cdn.jsdelivr.net/npm/mediainfo.js@0.3.8/dist/${path}`
        }, resolve, reject);
      }).then(mi=>{ mediaInfoInstance=mi; return mi; });
    }

    async function analyzeFileMetadata(file, index){
      if(fileMetaAnalyzing[index]) return;
      fileMetaAnalyzing[index]=true;
      fileMetadata[index]=null;
      if(metaPanelVisible) refreshMetaTable();
      try{
        const mi=await getMediaInfoInstance();
        const getSize=()=>file.size;
        const readChunk=(chunkSize,offset)=>new Promise((res,rej)=>{
          const reader=new FileReader();
          reader.onload=e=>res(new Uint8Array(e.target.result));
          reader.onerror=rej;
          reader.readAsArrayBuffer(file.slice(offset,offset+chunkSize));
        });
        const raw=await mi.analyzeData(getSize,readChunk);
        const parsed=JSON.parse(raw);
        fileMetadata[index]=extractMetaRows(file.name, parsed);
      }catch(e){
        console.warn('MediaInfo analysis failed',e);
        fileMetadata[index]=null;
      }finally{
        fileMetaAnalyzing[index]=false;
        if(metaPanelVisible) refreshMetaTable();
      }
    }

    function fmtDuration(sec){
      if(!sec) return '—';
      const s=parseFloat(sec);
      const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=Math.floor(s%60);
      const ms=Math.round((s%1)*1000);
      if(h>0) return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
      return `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;
    }
    function fmtSize(b){
      if(!b) return '—';
      const n=parseInt(b);
      if(n>=1e9) return `${(n/1e9).toFixed(2)} GB`;
      if(n>=1e6) return `${(n/1e6).toFixed(1)} MB`;
      return `${(n/1e3).toFixed(0)} KB`;
    }
    function fmtKbps(bps){
      if(!bps) return '—';
      const n=parseInt(bps);
      if(n>=1e6) return `${(n/1e6).toFixed(2)} Mbps`;
      return `${Math.round(n/1000)} kbps`;
    }

    function extractMetaRows(filename, info){
      const tracks=info?.media?.track||[];
      const G=tracks.find(t=>t['@type']==='General')||{};
      const V=tracks.find(t=>t['@type']==='Video')||{};
      const A=tracks.find(t=>t['@type']==='Audio')||{};

      const vCodec=[V.Format,V.Format_Profile].filter(Boolean).join(' ') || '—';
      const res=V.Width&&V.Height?`${V.Width}×${V.Height}`:'—';
      const fps=V.FrameRate?parseFloat(V.FrameRate).toFixed(3)+'':'—';
      const aspectStr=V.DisplayAspectRatio_String||V.DisplayAspectRatio||'—';
      const hdr=V.HDR_Format||V.HDR_Format_Compatibility||(V.colour_primaries&&V.colour_primaries.includes('2020')?'HDR':'');
      const transfer=V.transfer_characteristics||V.transfer_characteristics_Original||'—';
      const colorPrim=V.colour_primaries||'—';
      const sr=A.SamplingRate?`${(parseInt(A.SamplingRate)/1000).toFixed(1)} kHz`:'—';
      const aCh=A.Channels?`${A.Channels}ch`:'—';

      return [
        // ── General ──
        {s:'General',k:'filename',  label:'File Name',     v:filename||'—'},
        {s:'General',k:'container', label:'Container',     v:G.Format||'—'},
        {s:'General',k:'duration',  label:'Duration',      v:fmtDuration(G.Duration)},
        {s:'General',k:'filesize',  label:'File Size',     v:fmtSize(G.FileSize)},
        {s:'General',k:'obitrate',  label:'Overall Bitrate',v:fmtKbps(G.OverallBitRate)},
        // ── Video ──
        {s:'Video',  k:'vcodec',    label:'Codec',         v:vCodec},
        {s:'Video',  k:'resolution',label:'Resolution',    v:res},
        {s:'Video',  k:'fps',       label:'Frame Rate',    v:fps},
        {s:'Video',  k:'bitdepth',  label:'Bit Depth',     v:V.BitDepth?`${V.BitDepth}-bit`:'—'},
        {s:'Video',  k:'chroma',    label:'Chroma',        v:V.ChromaSubsampling||'—'},
        {s:'Video',  k:'colorprim', label:'Color Primaries',v:colorPrim},
        {s:'Video',  k:'transfer',  label:'Transfer',      v:transfer},
        {s:'Video',  k:'hdr',       label:'HDR',           v:hdr||'SDR'},
        {s:'Video',  k:'aspect',    label:'Aspect Ratio',  v:aspectStr},
        {s:'Video',  k:'scantype',  label:'Scan Type',     v:V.ScanType||'—'},
        {s:'Video',  k:'vbitrate',  label:'Video Bitrate', v:fmtKbps(V.BitRate)},
        // ── Audio ──
        {s:'Audio',  k:'acodec',    label:'Codec',         v:A.Format||'—'},
        {s:'Audio',  k:'channels',  label:'Channels',      v:aCh},
        {s:'Audio',  k:'samplerate',label:'Sample Rate',   v:sr},
        {s:'Audio',  k:'abitdepth', label:'Bit Depth',     v:A.BitDepth?`${A.BitDepth}-bit`:'—'},
        {s:'Audio',  k:'abitrate',  label:'Audio Bitrate', v:fmtKbps(A.BitRate)},
        {s:'Audio',  k:'lang',      label:'Language',      v:A.Language||'—'},
      ];
    }

    function getMostCommon(arr){
      const c={};
      arr.forEach(v=>{ c[v]=(c[v]||0)+1; });
      return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0];
    }

    function toggleMetaPanel(){
      metaPanelVisible=!metaPanelVisible;
      const panel=document.getElementById('metaPanel');
      const btn=document.getElementById('metaToggleBtn');
      if(panel){ panel.classList.toggle('visible',metaPanelVisible); panel.setAttribute('aria-hidden',String(!metaPanelVisible)); }
      if(btn) btn.classList.toggle('active',metaPanelVisible);
      if(metaPanelVisible) refreshMetaTable();
    }

    function refreshMetaTable(){
      const body=document.getElementById('metaPanelBody');
      const hint=document.getElementById('metaPanelHint');
      if(!body) return;

      const activeIdx=getActivePlayerIndices();
      const loadedIdx=activeIdx.filter(i=>fileMetadata[i]||fileMetaAnalyzing[i]);
      const analyzingIdx=activeIdx.filter(i=>fileMetaAnalyzing[i]);

      if(hint){
        const diffCount=countDiffRows(activeIdx);
        hint.textContent=analyzingIdx.length
          ? `Analyzing ${analyzingIdx.map(i=>`P${PLAYER_IDS[i]}`).join(', ')}…`
          : loadedIdx.length>1&&diffCount>0
          ? `${diffCount} field${diffCount>1?'s':''} differ`
          : '';
      }

      if(!loadedIdx.length){
        body.innerHTML='<div class="meta-empty">Load video files to compare metadata.</div>';
        return;
      }

      // Define canonical row order (use first loaded player's rows as template)
      const templateIdx=activeIdx.find(i=>fileMetadata[i]);
      if(!templateIdx&&templateIdx!==0){
        body.innerHTML=`<div class="meta-loading"><span class="mt-analyzing">⬡ Analyzing…</span></div>`;
        return;
      }
      const rowDefs=fileMetadata[templateIdx];

      // Build per-key value map: key → {label, section, values: {index→value}}
      const rowMap={};
      activeIdx.forEach(i=>{
        if(!fileMetadata[i]) return;
        fileMetadata[i].forEach(r=>{ if(!rowMap[r.k]) rowMap[r.k]={label:r.label,s:r.s,vals:{}}; rowMap[r.k].vals[i]=r.v; });
      });

      const readyIdx=activeIdx.filter(i=>fileMetadata[i]);

      // Build table HTML
      let html='<table class="meta-table"><thead><tr>';
      html+='<th class="mt-field-header">Field</th>';
      activeIdx.forEach(i=>{
        const name=fileMetaAnalyzing[i]?`<span class="mt-analyzing">P${PLAYER_IDS[i]} ⬡</span>`:`P${PLAYER_IDS[i]}`;
        html+=`<th>${name}</th>`;
      });
      html+='</tr></thead><tbody>';

      let curSection='';
      rowDefs.forEach(rowDef=>{
        const row=rowMap[rowDef.k];
        if(!row) return;

        if(rowDef.s!==curSection){
          curSection=rowDef.s;
          const colspan=1+activeIdx.length;
          html+=`<tr class="mt-section"><td colspan="${colspan}">${curSection}</td></tr>`;
        }

        const vals=readyIdx.map(i=>row.vals[i]||'—');
        const mostCommon=getMostCommon(vals.filter(v=>v!=='—'));
        const hasDiff=new Set(vals.filter(v=>v!=='—')).size>1;

        html+='<tr class="mt-row">';
        html+=`<td class="mt-label">${rowDef.label}</td>`;
        activeIdx.forEach(i=>{
          if(fileMetaAnalyzing[i]&&!fileMetadata[i]){
            html+='<td class="mt-val mt-empty">—</td>'; return;
          }
          const v=row.vals[i]||'—';
          const isDiff=hasDiff&&v!==mostCommon&&v!=='—';
          const cls='mt-val'+(isDiff?' mt-diff':v==='—'?' mt-empty':'');
          html+=`<td class="${cls}">${v}</td>`;
        });
        html+='</tr>';
      });

      html+='</tbody></table>';
      body.innerHTML=html;
    }

    function countDiffRows(activeIdx){
      const readyIdx=activeIdx.filter(i=>fileMetadata[i]);
      if(readyIdx.length<2) return 0;
      const template=fileMetadata[readyIdx[0]];
      if(!template) return 0;
      let count=0;
      template.forEach(rowDef=>{
        const vals=readyIdx.map(i=>{
          const row=fileMetadata[i]?.find(r=>r.k===rowDef.k);
          return row?.v||'—';
        });
        const unique=new Set(vals.filter(v=>v!=='—'));
        if(unique.size>1) count++;
      });
      return count;
    }

    async function wcdDecodeFrameAt(index,targetSec){
      const state=wcdStates[index];
      if(!state||!state.samples.length) return false;
      const gen=++state.decodeGen;
      const{samples,timescale,codecString,codedWidth,codedHeight,description,fileBuffer}=state;
      const targetPts=Math.round(targetSec*timescale);

      // Last keyframe with pts <= target
      let kfIdx=0;
      for(let i=samples.length-1;i>=0;i--){
        if(samples[i].isSync&&samples[i].pts<=targetPts){kfIdx=i;break;}
      }
      // Last sample with pts <= target
      let endIdx=samples.length-1;
      for(let i=kfIdx;i<samples.length;i++){
        if(samples[i].pts>targetPts){endIdx=Math.max(i-1,kfIdx);break;}
      }

      let bestFrame=null,bestDiff=Infinity;
      const decoder=new VideoDecoder({
        output:(frame)=>{
          if(gen!==state.decodeGen){frame.close();return;}
          const diff=Math.abs(frame.timestamp/1e6-targetSec);
          if(diff<bestDiff){bestDiff=diff;bestFrame?.close();bestFrame=frame;}
          else frame.close();
        },
        error:()=>{},
      });

      try{
        decoder.configure({
          codec:codecString,codedWidth,codedHeight,
          ...(description?{description}:{}),
        });
        for(let i=kfIdx;i<=endIdx;i++){
          if(gen!==state.decodeGen) break;
          const s=samples[i];
          decoder.decode(new EncodedVideoChunk({
            type:s.isSync?'key':'delta',
            timestamp:Math.round(s.pts/timescale*1e6),
            duration:Math.round(s.duration/timescale*1e6),
            data:new Uint8Array(fileBuffer,s.offset,s.size),
          }));
        }
        await decoder.flush();
      }catch(e){
        bestFrame?.close();bestFrame=null;
      }finally{
        try{decoder.close();}catch(e){}
      }

      if(!bestFrame||gen!==state.decodeGen){bestFrame?.close();return false;}
      const box=boxes[index];
      state.canvas.width=box.clientWidth||codedWidth;
      state.canvas.height=box.clientHeight||codedHeight;
      state.ctx.drawImage(bestFrame,0,0,state.canvas.width,state.canvas.height);
      bestFrame.close();
      state.canvas.style.display='block';
      return true;
    }

    // --- Timeline thumbnail strip ---

    // Extract thumbnails from existing frame cache (instant, no extra decode)
    async function extractThumbStripFromCache(index){
      const cache=frameCaches[index];
      if(!cache?.ready||!cache.frames.length) return;
      const strip=thumbStrips[index];
      strip.frames.forEach(f=>{ try{ f.bitmap.close(); }catch(e){} });
      strip.frames=[];
      const frames=cache.frames;
      const step=Math.max(1,Math.floor(frames.length/THUMB_MAX_COUNT));
      for(let i=0;i<frames.length;i+=step){
        const src=frames[i];
        try{
          const bm=await createImageBitmap(src.bitmap,{resizeWidth:THUMB_W,resizeHeight:THUMB_H,resizeQuality:'low'})
            .catch(()=>createImageBitmap(src.bitmap));
          strip.frames.push({time:src.time,bitmap:bm});
        }catch(e){}
      }
    }

    // Build thumbnail strip via background seeks on a hidden video element (for videos > FRAME_CACHE_MAX_DURATION)
    async function buildThumbStripBackground(video,index){
      if(!video._objectURL) return; // local blob only — no CORS risk
      const strip=thumbStrips[index];
      if(strip.building||strip.frames.length>=5) return;
      const duration=video.duration;
      if(!duration||!Number.isFinite(duration)) return;
      strip.building=true;

      const tv=document.createElement('video');
      tv.style.cssText='position:fixed;opacity:0;pointer-events:none;width:1px;height:1px;top:-9999px;left:-9999px;';
      tv.muted=true; tv.preload='auto';
      document.body.appendChild(tv);
      tv.src=video._objectURL;

      try{
        await Promise.race([
          new Promise(r=>tv.addEventListener('loadedmetadata',r,{once:true})),
          new Promise(r=>setTimeout(r,6000))
        ]);
        const count=Math.min(THUMB_MAX_COUNT,Math.max(5,Math.ceil(duration/3)));
        for(let i=0;i<=count;i++){
          if(thumbStrips[index]!==strip) break; // source changed — abort
          const t=Math.min(duration-0.1,(i/count)*duration);
          tv.currentTime=t;
          await Promise.race([
            new Promise(r=>tv.addEventListener('seeked',r,{once:true})),
            new Promise(r=>setTimeout(r,3000))
          ]);
          try{
            const bm=await createImageBitmap(tv,{resizeWidth:THUMB_W,resizeHeight:THUMB_H,resizeQuality:'low'})
              .catch(()=>createImageBitmap(tv));
            if(thumbStrips[index]===strip){
              strip.frames.push({time:t,bitmap:bm});
              strip.frames.sort((a,b)=>a.time-b.time);
            }
          }catch(e){}
        }
      }catch(e){}finally{
        tv.remove();
        if(thumbStrips[index]===strip) strip.building=false;
      }
    }

    // Get nearest available thumbnail for a given time
    function getThumbAtTime(index,time){
      const frames=thumbStrips[index].frames;
      if(!frames.length) return null;
      let lo=0,hi=frames.length-1,idx=0;
      while(lo<=hi){ const mid=(lo+hi)>>1; if(frames[mid].time<=time){idx=mid;lo=mid+1;}else hi=mid-1; }
      return frames[idx]?.bitmap||null;
    }

    // Destroy thumb strip and free ImageBitmap memory
    function destroyThumbStrip(index){
      const strip=thumbStrips[index];
      strip.frames.forEach(f=>{ try{ f.bitmap.close(); }catch(e){} });
      strip.frames=[];
      strip.building=false;
    }

    // Set up timeline mousemove → show thumbnail popup
    function setupTimelineThumb(index){
      const controls=controlSets[index];
      if(!controls?.timeline||!controls.playbar) return;
      const timeline=controls.timeline;

      // Create popup element once
      if(!thumbPopups[index]){
        const popup=document.createElement('div');
        popup.className='timeline-thumb-popup';
        const canvas=document.createElement('canvas');
        canvas.className='timeline-thumb-canvas';
        canvas.width=THUMB_W; canvas.height=THUMB_H;
        const timeLabel=document.createElement('span');
        timeLabel.className='timeline-thumb-time';
        popup.appendChild(canvas);
        popup.appendChild(timeLabel);
        controls.playbar.appendChild(popup);
        thumbPopups[index]={popup,canvas,ctx:canvas.getContext('2d'),timeLabel};
      }
      const pp=thumbPopups[index];

      timeline.addEventListener('mousemove',e=>{
        const rect=timeline.getBoundingClientRect();
        const ratio=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
        const range=getSeekRange(videos[index]);
        if(!range){ pp.popup.style.display='none'; return; }
        const time=range.start+(range.end-range.start)*ratio;
        const bm=getThumbAtTime(index,time);
        if(!bm){ pp.popup.style.display='none'; return; }
        pp.ctx.drawImage(bm,0,0,THUMB_W,THUMB_H);
        pp.timeLabel.textContent=formatTimecode(time-range.start);
        // Horizontal clamp so popup stays inside playbar
        const pbRect=controls.playbar.getBoundingClientRect();
        const relX=e.clientX-pbRect.left;
        const half=THUMB_W/2+4;
        const clamped=Math.max(half,Math.min(relX,pbRect.width-half));
        pp.popup.style.left=clamped+'px';
        pp.popup.style.display='flex';
      });
      timeline.addEventListener('mouseleave',()=>{ pp.popup.style.display='none'; });
    }

    // --- FFmpeg codec fallback ---
    function loadFFmpegScript(){
      return new Promise((resolve,reject)=>{
        if(window.FFmpeg){ resolve(); return; }
        const s=document.createElement('script');
        s.src='https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
        s.onload=resolve;
        s.onerror=()=>reject(new Error('Failed to load FFmpeg.wasm'));
        document.head.appendChild(s);
      });
    }

    async function getFFmpeg(){
      if(ffmpegInstance && ffmpegReady) return ffmpegInstance;
      if(ffmpegLoading){
        while(ffmpegLoading) await new Promise(r=>setTimeout(r,100));
        return ffmpegInstance;
      }
      ffmpegLoading=true;
      try{
        await loadFFmpegScript();
        const {createFFmpeg,fetchFile}=window.FFmpeg;
        ffmpegInstance=createFFmpeg({
          corePath:'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
          log:false
        });
        ffmpegInstance._fetchFile=fetchFile;
        await ffmpegInstance.load();
        ffmpegReady=true;
      }finally{
        ffmpegLoading=false;
      }
      return ffmpegInstance;
    }

    async function handleCodecFallback(file,video,label,box,index){
      const overlay=document.createElement('div');
      overlay.className='transcode-overlay';
      overlay.innerHTML='<div class="transcode-msg">Transcoding<br><span class="transcode-pct">0%</span><br><small>Unsupported codec — converting to H.264</small></div>';
      box.appendChild(overlay);
      const pctEl=overlay.querySelector('.transcode-pct');
      try{
        const ff=await getFFmpeg();
        const ext=(file.name.split('.').pop()||'mp4').toLowerCase();
        const inputName=`input.${ext}`;
        const outputName='output.mp4';
        ff.setProgress(({ratio})=>{
          if(pctEl) pctEl.textContent=`${Math.round(Math.min(ratio,1)*100)}%`;
        });
        ff.FS('writeFile',inputName,await ff._fetchFile(file));
        await ff.run('-i',inputName,'-c:v','libx264','-preset','ultrafast','-crf','23','-c:a','aac','-movflags','faststart',outputName);
        const data=ff.FS('readFile',outputName);
        try{ ff.FS('unlink',inputName); }catch(e){}
        try{ ff.FS('unlink',outputName); }catch(e){}
        const blob=new Blob([data.buffer],{type:'video/mp4'});
        if(video._objectURL){ try{ URL.revokeObjectURL(video._objectURL); }catch(e){} }
        const url=URL.createObjectURL(blob);
        video._objectURL=url;
        video.src=url;
        box.classList.add('loaded');
        applyPlaybackOptimizations(video);
        try{ video.load(); }catch(e){}
        scheduleResume(video,{shouldPlay:true});
        updateTimelineForPlayer(index,true);
        updatePlayButtons();
        label.textContent=file.name+' (transcoded)';
      }finally{
        overlay.remove();
      }
    }
    function toggleFullscreen(target=document.documentElement){
      if(!document.fullscreenElement) target.requestFullscreen();
      else document.exitFullscreen();
    }
    // Draw a specific time from frame cache directly to canvas — instant visual feedback
    function drawCacheFrameAtTime(index,time){
      const cache=frameCaches[index];
      if(!cache?.ready||!cache.canvas) return false;
      const frames=cache.frames;
      if(!frames.length) return false;
      const ctx=cache.canvas.getContext('2d');
      if(!ctx) return false;
      let lo=0,hi=frames.length-1,idx=0;
      while(lo<=hi){ const mid=(lo+hi)>>1; if(frames[mid].time<=time){idx=mid;lo=mid+1;}else hi=mid-1; }
      if(frames[idx]) ctx.drawImage(frames[idx].bitmap,0,0,cache.canvas.width,cache.canvas.height);
      return true;
    }

    function stepFrames(shift,forward){
      const step=(shift?10:1)/30;
      getActivePlayerIndices().forEach(index=>{
        const v=videos[index];
        if(!hasVideoSource(v)) return;
        if(!v.paused) v.pause();
        const newTime=Math.max(0,v.currentTime+(forward?step:-step));
        if(!drawCacheFrameAtTime(index,newTime)&&wcdStates[index]){
          // WebCodecs path: async GPU decode for long non-cached videos
          wcdDecodeFrameAt(index,newTime).catch(()=>{});
        }
        try{ v.currentTime=newTime; }catch(e){}
      });
      updateTimelineUI(true);
    }
    function adjustSpeed(delta){
      getActivePlayerIndices().forEach(i=>{
        const v=videos[i];
        if(!hasVideoSource(v)) return;
        v.playbackRate=Math.min(Math.max(v.playbackRate+delta,0.1),4);
        metrics[i].playbackRate=v.playbackRate;
        updateMonitorUI(i);
      });
    }
    function cycleCrop(){
      cropState=(cropState+1)%3;
      getActivePlayerIndices().forEach(idx=>{
        const v=videos[idx];
        [v,images[idx]].filter(Boolean).forEach(el=>{
          if(cropState===0) el.style.objectFit="contain";
          else el.style.objectFit="cover";
        });
      });
      updateTransforms();
    }


    function updatePlayButtons(){
      controlSets.forEach((controls,index)=>{
        const button=controls.playButton;
        if(!button) return;
        if(!isPlayerActive(index)){
          button.textContent='▶';
          button.setAttribute('aria-pressed','false');
          button.setAttribute('aria-label','Play');
          return;
        }
        const playing=hasVideoSource(videos[index]) && !videos[index].paused;
        button.textContent=playing?'⏸':'▶';
        button.setAttribute('aria-pressed',playing?'true':'false');
        button.setAttribute('aria-label',playing?'Pause':'Play');
      });
    }

    function formatTimecode(seconds){
      if(!Number.isFinite(seconds)) return "--:--";
      const clamped=Math.max(0,seconds);
      const hours=Math.floor(clamped/3600);
      const minutes=Math.floor((clamped%3600)/60);
      const secs=Math.floor(clamped%60);
      const pad=v=>String(v).padStart(2,'0');
      return hours>0?`${hours}:${pad(minutes)}:${pad(secs)}`:`${pad(minutes)}:${pad(secs)}`;
    }

    function getSeekRange(video){
      if(video.seekable && video.seekable.length){
        const lastIndex=video.seekable.length-1;
        const start=video.seekable.start(0);
        const end=video.seekable.end(lastIndex);
        if(Number.isFinite(start) && Number.isFinite(end) && end>start) return {start,end};
      }
      if(Number.isFinite(video.duration) && video.duration>0 && video.duration!==Infinity){
        return {start:0,end:video.duration};
      }
      return null;
    }

    function updateTimelineForPlayer(index,force=false){
      const controls=controlSets[index];
      if(!controls) return;
      const timeline=controls.timeline;
      const currentLabel=controls.current;
      const totalLabel=controls.total;
      const video=videos[index];
      const range=getSeekRange(video);
      if(!range){
        if(timeline){
          timeline.disabled=true;
          if(!timelineActive[index] || force) timeline.value='0';
          timeline.style.background=TIMELINE_BASE_BG;
        }
        if(currentLabel) currentLabel.textContent='--:--';
        if(totalLabel) totalLabel.textContent='--:--';
        return;
      }
      const span=range.end-range.start;
      const rawCurrent=Number.isFinite(video.currentTime)?video.currentTime:range.start;
      const clamped=Math.min(Math.max(rawCurrent,range.start),range.end);
      const percent=span>0? (clamped-range.start)/span : 0;
      const sliderValue=Math.round(percent*1000)/10;
      if(timeline){
        timeline.disabled=false;
        if(!timelineActive[index] || force) timeline.value=sliderValue.toString();
        updateTimelineBufferVisual(index,range);
      }
      if(currentLabel) currentLabel.textContent=formatTimecode(clamped-range.start);
      if(totalLabel) totalLabel.textContent=formatTimecode(Math.max(span,0));
    }

    function updateTimelineUI(force=false){
      getActivePlayerIndices().forEach(index=>updateTimelineForPlayer(index,force));
    }

    function updateTimelineBufferVisual(index,range){
      const controls=controlSets[index];
      if(!controls) return;
      const timeline=controls.timeline;
      if(!timeline) return;
      const video=videos[index];
      if(!video || !range){
        timeline.style.background=TIMELINE_BASE_BG;
        return;
      }
      const buffered=video.buffered;
      if(!buffered || buffered.length===0){
        timeline.style.background=TIMELINE_BASE_BG;
        return;
      }
      const span=range.end-range.start;
      if(!(span>0)){
        timeline.style.background=TIMELINE_BASE_BG;
        return;
      }
      const segments=[];
      for(let i=0;i<buffered.length;i++){
        let start;
        let end;
        try{
          start=buffered.start(i);
          end=buffered.end(i);
        }catch(err){ continue; }
        if(!Number.isFinite(start) || !Number.isFinite(end)) continue;
        start=Math.max(start,range.start);
        end=Math.min(end,range.end);
        if(end>start){
          const startPercent=((start-range.start)/span)*100;
          const endPercent=((end-range.start)/span)*100;
          segments.push({startPercent,endPercent});
        }
      }
      if(!segments.length){
        timeline.style.background=TIMELINE_BASE_BG;
        return;
      }
      segments.sort((a,b)=>a.startPercent-b.startPercent);
      const base=TIMELINE_BASE_BG;
      const bufferColor='rgba(201,201,205,0.5)';
      let current=0;
      const parts=[];
      segments.forEach(seg=>{
        const start=Math.min(100,Math.max(0,seg.startPercent));
        const end=Math.min(100,Math.max(0,seg.endPercent));
        if(end<=current) return;
        if(start>current){
          parts.push(`${base} ${current}% ${start}%`);
        }
        const clampedStart=Math.max(current,start);
        parts.push(`${bufferColor} ${clampedStart}% ${end}%`);
        current=Math.max(current,end);
      });
      if(current<100){
        parts.push(`${base} ${current}% 100%`);
      }
      timeline.style.background=`linear-gradient(to right, ${parts.join(', ')})`;
    }

    function seekToPercent(percent,targetIndex){
      const clamped=Math.min(Math.max(percent,0),1);
      const applyAll=targetIndex===undefined;
      if(targetIndex!==undefined && !isPlayerActive(targetIndex)) return;
      const apply=(video)=>{
        const range=getSeekRange(video);
        if(!range) return;
        const span=range.end-range.start;
        if(!(span>0)) return;
        const target=range.start+span*clamped;
        if(Number.isFinite(target)){
          try{ video.currentTime=target; }catch(err){}
        }
      };
      if(applyAll){
        getActivePlayerIndices().forEach(index=>apply(videos[index]));
      }else{
        const video=videos[targetIndex];
        if(video) apply(video);
      }
      updateTimelineUI(true);
    }

    function jumpToLatestBuffered(){
      getActivePlayerIndices().forEach(index=>{
        const video=videos[index];
        let target=null;
        if(video.buffered && video.buffered.length){
          const last=video.buffered.length-1;
          const end=video.buffered.end(last);
          const start=video.buffered.start(last);
          if(Number.isFinite(end)){
            target=end-0.3;
            if(!Number.isFinite(start) || target<start) target=start;
          }
        }
        if(target===null){
          const range=getSeekRange(video);
          if(range){
            target=range.end-0.3;
            if(target<range.start) target=range.start;
          }
        }
        if(target!==null && Number.isFinite(target)){
          try{ video.currentTime=target; }catch(err){}
        }
      });
      updateTimelineUI(true);
    }


    function toggleMonitor(forceState){
      if(!monitorPanel) return;
      const nextState = typeof forceState === 'boolean' ? forceState : !monitorVisible;
      if(nextState === monitorVisible) return;
      monitorVisible = nextState;
      monitorPanel.classList.toggle('visible',monitorVisible);
      monitorPanel.setAttribute('aria-hidden',monitorVisible?'false':'true');
      if(monitorVisible){
        syncCanvasResolution();
        metrics.forEach((_,i)=>updateMonitorUI(i));
      }
    }

    function applyPlaybackOptimizations(video){
      if(!video) return;
      video.preload='auto';
      video.playsInline=true;
      video.setAttribute('playsinline','');
      video.disablePictureInPicture=true;
      video.setAttribute('disablePictureInPicture','');
      video.setAttribute('disableRemotePlayback','');
      video.controlsList='nodownload noplaybackrate noremoteplayback';
      video.loop=true;
    }


    function initVideoMonitoring(video,index){
      applyPlaybackOptimizations(video);
      video.addEventListener('loadedmetadata',()=>{
        if(video.videoWidth&&video.videoHeight){
          metrics[index].lastResolution=`${video.videoWidth}x${video.videoHeight}`;
        }
        metrics[index].playbackRate=video.playbackRate||1;
        updateMonitorUI(index);
        updateTimelineForPlayer(index,true);
      });
      // Start frame cache + thumbnail strip once fully buffered
      video.addEventListener('canplaythrough',()=>{
        if(!frameCaches[index]) startFrameCacheBuild(video,index);
        // For longer local files not covered by frame cache, build thumbnail strip in background
        const d=video.duration;
        if(Number.isFinite(d)&&d>FRAME_CACHE_MAX_DURATION&&video._objectURL){
          if(!thumbStrips[index].frames.length&&!thumbStrips[index].building){
            buildThumbStripBackground(video,index).catch(()=>{});
          }
          if(!wcdStates[index]&&WEBCODECS_SUPPORTED&&video._sourceFile){
            initWebCodecsForPlayer(index,video._sourceFile).catch(()=>{});
          }
        }
      },{once:false});
      video.addEventListener('durationchange',()=>updateTimelineForPlayer(index,true));
      ['waiting','stalled'].forEach(evt=>{
        video.addEventListener(evt,()=>{
          const m=metrics[index];
          if(!m.stallStart){
            m.stallStart=performance.now();
            m.stallCount+=1;
            updateMonitorUI(index);
          }
        });
      });
      video.addEventListener('playing',()=>{
        const m=metrics[index];
        if(m.stallStart){
          m.stallDuration+= (performance.now()-m.stallStart)/1000;
          m.stallStart=null;
          updateMonitorUI(index);
        }
      });
      video.addEventListener('ratechange',()=>{
        metrics[index].playbackRate=video.playbackRate||1;
        updateMonitorUI(index);
      });
    }


    function getStatTime(stats,primaryKey,fallbackKey){
      if(!stats) return null;
      const primary=stats[primaryKey];
      if(Number.isFinite(primary) && primary>0) return primary;
      const loading=stats.loading;
      if(loading){
        const fallback=loading[fallbackKey];
        if(Number.isFinite(fallback) && fallback>0) return fallback;
      }
      return null;
    }

    function recalcAverageSpeed(metric){
      const now = performance.now();
      const windowStart = now - SPEED_AVG_WINDOW_MS;
      while(metric.speedWindow.length){
        const sample = metric.speedWindow[0];
        const sampleEnd = sample.timestamp;
        if(sampleEnd < windowStart) metric.speedWindow.shift();
        else break;
      }
      if(!metric.speedWindow.length){
        metric.avgSpeed = null;
        return;
      }
      let totalBits = 0;
      const windowEnd = now;
      metric.speedWindow.forEach(sample=>{
        const durationMs = sample.duration * 1000;
        const sampleEnd = sample.timestamp;
        const sampleStart = sampleEnd - durationMs;
        if(sampleEnd <= windowStart) return;
        const overlapStart = Math.max(sampleStart, windowStart);
        const overlapEnd = Math.min(sampleEnd, windowEnd);
        if(overlapEnd <= overlapStart) return;
        const overlapDuration = overlapEnd - overlapStart;
        const ratio = durationMs > 0 ? overlapDuration / durationMs : 1;
        totalBits += sample.bits * ratio;
      });
      if(totalBits <= 0){
        metric.avgSpeed = 0;
        return;
      }
      const windowSeconds = SPEED_AVG_WINDOW_MS / 1000;
      metric.avgSpeed = totalBits / (windowSeconds * 1e6);
    }

    function recordFragmentMetrics(index,stats,{pushToHistory=true}={}){
      const m=metrics[index];
      if(!stats) return;
      const bytes=stats.total || stats.loaded || stats.totalbytes || stats.totalBytes || 0;
      const trequest=getStatTime(stats,'trequest','start');
      const tfirst=getStatTime(stats,'tfirst','first');
      const tload=getStatTime(stats,'tload','end');
      let downloadTime=null;
      if(Number.isFinite(tload) && Number.isFinite(tfirst) && tload>tfirst){
        downloadTime=(tload-tfirst)/1000;
      }else if(Number.isFinite(tload) && Number.isFinite(trequest) && tload>trequest){
        downloadTime=(tload-trequest)/1000;
      }
      const latency=(Number.isFinite(tfirst) && Number.isFinite(trequest) && tfirst>=trequest)?(tfirst-trequest)/1000:null;
      if(downloadTime!==null && downloadTime>0 && bytes){
        const durationSec=Math.max(downloadTime,0.001);
        const bits=bytes*8;
        const speed=bits/(durationSec*1e6);
        m.lastSpeed=speed;
        if(pushToHistory) pushHistory(m.speedHistory,speed,180);
        m.speedWindow.push({timestamp:performance.now(),duration:durationSec,bits});
        recalcAverageSpeed(m);
      }
      if(latency!==null && latency>=0){
        m.lastLatency=latency;
        if(pushToHistory) pushHistory(m.latencyHistory,latency,180);
      }
      m.lastDebug={
        bytes,
        downloadTime,
        latency,
        derived:{
          trequest,
          tfirst,
          tload
        },
        stats:{
          trequest:stats.trequest,
          tfirst:stats.tfirst,
          tload:stats.tload,
          loaded:stats.loaded,
          total:stats.total,
          loading:stats.loading || null
        }
      };
    }

    function isRelevantMediaFragment(frag){
      if(!frag) return true;
      if(frag.type===undefined || frag.type===null) return true;
      const ignoredTypes=new Set(['subtitle','key']);
      return !ignoredTypes.has(frag.type);
    }

    function attachHlsListeners(hls,index){
      hls.on(Hls.Events.FRAG_LOADED,(_,data)=>{
        const frag=data?.frag;
        if(!isRelevantMediaFragment(frag)) return;
        const stats=data?.stats || frag?.stats;
        recordFragmentMetrics(index,stats,{pushToHistory:false});
        if(typeof hls.bandwidthEstimate==='number'&&hls.bandwidthEstimate>0){
          const bw=hls.bandwidthEstimate/1e6;
          metrics[index].lastBandwidth=bw;
          pushHistory(metrics[index].bandwidthHistory,bw,180);
        }
        updateMonitorUI(index);
      });

      hls.on(Hls.Events.FRAG_BUFFERED,(_,data)=>{
        const stats=data?.stats || data?.frag?.stats;
        const frag=data?.frag;
        if(!isRelevantMediaFragment(frag)) return;
        recordFragmentMetrics(index,stats);
        if(typeof hls.bandwidthEstimate==='number'&&hls.bandwidthEstimate>0){
          const bw=hls.bandwidthEstimate/1e6;
          metrics[index].lastBandwidth=bw;
          pushHistory(metrics[index].bandwidthHistory,bw,180);
        }
        if(frag){
          const start=typeof frag.start==='number'?frag.start:(typeof frag.startPTS==='number'?frag.startPTS:null);
          const duration=typeof frag.duration==='number'?frag.duration:null;
          if(start!==null && duration!==null){
            metrics[index].pendingFragments.push({
              sn: frag.sn,
              end: start+duration,
              bufferedAt: performance.now()
            });
            if(metrics[index].pendingFragments.length>120) metrics[index].pendingFragments.shift();
          }
        }
        updateMonitorUI(index);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED,(_,data)=>{
        const level=hls.levels?.[data.level];
        const m=metrics[index];
        if(level){
          if(level.width&&level.height) m.lastResolution=`${level.width}x${level.height}`;
          if(level.bitrate) m.lastBitrate=level.bitrate;
          const codec=level.codecSet||level.codecs||level.codec;
          if(codec) m.lastCodec=codec;
        }
        updateMonitorUI(index);
      });


      hls.on(Hls.Events.ERROR,(_,data)=>{
        const m=metrics[index];
        if(!data) return;
        if(data.type===Hls.ErrorTypes.NETWORK_ERROR) m.errors.network+=1;
        else if(data.type===Hls.ErrorTypes.MEDIA_ERROR) m.errors.media+=1;
        else m.errors.other+=1;
        updateMonitorUI(index);
      });
    }


    function resetMetricState(index){
      const m=metrics[index];
      m.speedHistory=[];
      m.speedWindow=[];
      m.latencyHistory=[];
      m.bandwidthHistory=[];
      m.bufferHistory=[];
      m.ingestHistory=[];
      m.pendingFragments=[];
      m.lastSpeed=null;
      m.avgSpeed=null;
      m.lastLatency=null;
      m.lastBandwidth=null;
      m.lastBuffer=null;
      m.lastIngestLatency=null;
      m.lastBitrate=null;
      m.lastResolution='-';
      m.lastCodec='-';
      m.dropped=0;
      m.total=0;
      m.stallCount=0;
      m.stallDuration=0;
      m.stallStart=null;
      m.errors={network:0,media:0,other:0};
      m.playbackRate=videos[index].playbackRate||1;
      m.lastDebug=null;
      updateMonitorUI(index);
      updateTimelineForPlayer(index,true);
      updatePlayButtons();
    }


    function safePlay(video){
      const res=video.play();
      if(res&&typeof res.catch==='function') res.catch(()=>{});
    }

    function scheduleResume(video,{resumeTime=null,shouldPlay=true}={}){
      if(!video) return;
      if(video._pendingResumeHandler){
        video.removeEventListener('loadedmetadata',video._pendingResumeHandler);
        video._pendingResumeHandler=null;
      }
      const hasTime = resumeTime!==null && resumeTime!==undefined && Number.isFinite(resumeTime);
      const applyState=()=>{
        if(hasTime){
          let target=Math.max(0,resumeTime);
          const duration=video.duration;
          if(Number.isFinite(duration) && duration>0){
            const maxTarget=Math.max(0,duration-0.1);
            if(target>maxTarget) target=maxTarget;
          }
          try{ video.currentTime=target; }catch(err){}
        }
        if(shouldPlay) safePlay(video);
        else video.pause();
      };
      if(hasTime && video.readyState < 1){
        const handler=()=>{
          video.removeEventListener('loadedmetadata',handler);
          if(video._pendingResumeHandler===handler) video._pendingResumeHandler=null;
          applyState();
        };
        video._pendingResumeHandler=handler;
        video.addEventListener('loadedmetadata',handler);
        if(shouldPlay===false) video.pause();
      }else{
        if(!shouldPlay) video.pause();
        applyState();
      }
    }


    function syncCanvasResolution(){
      allCanvases.forEach(canvas=>{
        if(!canvas) return;
        const rect=canvas.getBoundingClientRect();
        if(rect.width===0||rect.height===0) return;
        canvas.width=rect.width;
        canvas.height=rect.height;
      });
    }


    function pushHistory(arr,value,limit=120){
      if(value===null||value===undefined||Number.isNaN(value)) return;
      arr.push(value);
      if(arr.length>limit) arr.shift();
    }


    function drawSparkline(canvas,data,color){
      if(!canvas) return;
      const ctx=canvas.getContext('2d');
      const width=canvas.width;
      const height=canvas.height;
      ctx.clearRect(0,0,width,height);
      if(!data.length){
        ctx.strokeStyle='rgba(255,255,255,0.2)';
        ctx.strokeRect(0.5,0.5,width-1,height-1);
        return;
      }
      const max=Math.max(...data);
      const min=Math.min(...data);
      const range=max-min || 1;
      ctx.strokeStyle=color;
      ctx.lineWidth=1.8;
      ctx.beginPath();
      data.forEach((val,idx)=>{
        const x = data.length===1 ? width/2 : (idx/(data.length-1))* (width-4)+2;
        const y = height - ((val-min)/range)*(height-4) - 2;
        if(idx===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      });
      ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,0.2)';
      ctx.lineWidth=1;
      ctx.strokeRect(0.5,0.5,width-1,height-1);
    }


    function formatNumber(value,unit,digits=2){
      return (value!==null&&value!==undefined&&!Number.isNaN(value)) ? `${value.toFixed(digits)} ${unit}` : '-';
    }


    function updateMonitorUI(index){
      const m=metrics[index];
      recalcAverageSpeed(m);
      if(!metricEls.speed[index]) return;
      metricEls.speed[index].textContent=formatNumber(m.avgSpeed,'Mbps',2);
      if(metricEls.speedInstant[index]) metricEls.speedInstant[index].textContent=formatNumber(m.lastSpeed,'Mbps',2);
      metricEls.latency[index].textContent=m.lastLatency!==null&&m.lastLatency!==undefined&&!Number.isNaN(m.lastLatency)?`${m.lastLatency.toFixed(3)}  sec`:'-';
      metricEls.bandwidth[index].textContent=formatNumber(m.lastBandwidth,'Mbps',2);
      metricEls.buffer[index].textContent=m.lastBuffer!==null&&m.lastBuffer!==undefined&&!Number.isNaN(m.lastBuffer)?`${m.lastBuffer.toFixed(2)}  sec`:'-';
      metricEls.ingest[index].textContent=m.lastIngestLatency!==null&&m.lastIngestLatency!==undefined&&!Number.isNaN(m.lastIngestLatency)?`${m.lastIngestLatency.toFixed(2)}  sec`:'-';
      metricEls.playback[index].textContent=`${(m.playbackRate||1).toFixed(2)}x`;
      metricEls.stallCount[index].textContent=`${m.stallCount} times`;
      metricEls.stallDuration[index].textContent=`${m.stallDuration.toFixed(1)} sec`;
      const qualityParts=[];
      if(m.lastResolution&&m.lastResolution!=='-') qualityParts.push(m.lastResolution);
      if(m.lastBitrate&&Number.isFinite(m.lastBitrate)) qualityParts.push(`${(m.lastBitrate/1000).toFixed(0)} kbps`);
      metricEls.quality[index].textContent=qualityParts.length?qualityParts.join(' · '):'-';
      metricEls.codec[index].textContent=`Codec: ${m.lastCodec&&m.lastCodec!=='-'?m.lastCodec:'-'}`;
      if(m.total){
        const ratio=(m.dropped/m.total)*100;
        metricEls.dropped[index].textContent=`${m.dropped} / ${m.total} (${ratio.toFixed(2)}%)`;
      }else if(m.dropped){
        metricEls.dropped[index].textContent=`${m.dropped} / -`;
      }else{
        metricEls.dropped[index].textContent='-';
      }
      metricEls.errorNetwork[index].textContent=m.errors.network;
      metricEls.errorMedia[index].textContent=m.errors.media;
      metricEls.errorOther[index].textContent=m.errors.other;
      drawSparkline(sparklineCanvases.speed[index],m.speedHistory,'#4cc3ff');
      drawSparkline(sparklineCanvases.latency[index],m.latencyHistory,'#7ce8a0');
      drawSparkline(sparklineCanvases.bandwidth[index],m.bandwidthHistory,'#ffad66');
      drawSparkline(sparklineCanvases.buffer[index],m.bufferHistory,'#c989ff');
      drawSparkline(sparklineCanvases.ingest[index],m.ingestHistory,'#8df7c8');
    }


    function currentBufferedAhead(video){
      if(!video) return null;
      try{
        const {buffered,currentTime}=video;
        for(let i=0;i<buffered.length;i++){
          const start=buffered.start(i);
          const end=buffered.end(i);
          if(start<=currentTime && end>=currentTime) return Math.max(0,end-currentTime);
        }
        if(buffered.length>0){
          const end=buffered.end(buffered.length-1);
          return Math.max(0,end-currentTime);
        }
      }catch(err){ }
      return null;
    }


    function updateDroppedFrames(video,index){
      const m=metrics[index];
      if(typeof video.getVideoPlaybackQuality==='function'){
        const q=video.getVideoPlaybackQuality();
        m.dropped=q.droppedVideoFrames||0;
        m.total=q.totalVideoFrames||0;
      }else if(video.webkitDroppedFrameCount!==undefined){
        m.dropped=video.webkitDroppedFrameCount||0;
        m.total=video.webkitDecodedFrameCount||0;
      }
    }


    setInterval(()=>{
      getActivePlayerIndices().forEach(index=>{
        const video=videos[index];
        if(!(video.currentSrc || video.src)) return;
        const buffer=currentBufferedAhead(video);
        if(buffer!==null){
          metrics[index].lastBuffer=buffer;
          pushHistory(metrics[index].bufferHistory,buffer,180);
        }
        metrics[index].playbackRate=video.playbackRate||1;
        updateDroppedFrames(video,index);
        const m=metrics[index];
        if(m.pendingFragments.length){
          const now=performance.now();
          while(m.pendingFragments.length && video.currentTime>=m.pendingFragments[0].end-0.05){
            const fragInfo=m.pendingFragments.shift();
            const latency=(now-fragInfo.bufferedAt)/1000;
            if(latency>=0){
              m.lastIngestLatency=latency;
              pushHistory(m.ingestHistory,latency,60);
            }
          }
        }
        updateMonitorUI(index);
      });
      updateTimelineUI();
      updatePlayButtons();
      const primaryA=videos[0];
      const primaryB=videos[1];
      const has1=!!(primaryA?.currentSrc || primaryA?.src);
      const has2=!!(primaryB?.currentSrc || primaryB?.src);
      if(has1 && has2){
        const t1=primaryA.currentTime;
        const t2=primaryB.currentTime;
        const diff=t2-t1;
        const sign=diff>=0?'+':'-';
        timeDiffValueEl.textContent=`${sign}${Math.abs(diff).toFixed(3)}  sec`;
        timeDiffDetailEl.textContent=`P1 ${t1.toFixed(3)} sec · P2 ${t2.toFixed(3)} sec`;
      }else{
        timeDiffValueEl.textContent='-';
        timeDiffDetailEl.textContent='Shown when both players are loaded.';
      }
    },1000);
