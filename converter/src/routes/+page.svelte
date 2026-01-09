<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let dropzone: HTMLElement | null = null;
  let fileInput: HTMLInputElement | null = null;
  let fileBtn: HTMLElement | null = null;
  let textarea: HTMLTextAreaElement | null = null;
  let convertBtn: HTMLElement | null = null;
  let errorDiv: HTMLElement | null = null;
  // Title applied to all generated events
  let eventTitle: string = 'Appointment';

  type Listener = { el: EventTarget; ev: string; fn: EventListenerOrEventListenerObject };
  const listeners: Listener[] = [];

  function addListener(el: EventTarget, ev: string, fn: EventListenerOrEventListenerObject) {
    el.addEventListener(ev, fn as EventListener);
    listeners.push({ el, ev, fn });
  }

  function removeAll() {
    for (const l of listeners) {
      // @ts-ignore
      l.el.removeEventListener(l.ev, l.fn);
    }
    listeners.length = 0;
  }

  function readFileToTextarea(file: File) {
    if (!file || !textarea) return;
    file.text().then((text) => (textarea!.value = text));
  }

  function parseAppointments(text: string) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const regex = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/;
    const results: Array<{ date: string; startTime: string; endTime: string }> = [];
    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      const m = ln.match(regex);
      if (!m) return { error: `Malformed line ${i + 1}: "${ln}"` };
      results.push({ date: m[1], startTime: m[2], endTime: m[3] });
    }
    return { data: results };
  }

  onMount(() => {
    console.log('Landing page mounted');

    if (fileBtn && fileInput) addListener(fileBtn, 'click', () => fileInput!.click());

    if (dropzone) {
    addListener(dropzone, 'dragover', (e: Event) => {
      e.preventDefault();
      (dropzone as HTMLElement).style.opacity = '0.8';
    });
      addListener(dropzone, 'dragleave', () => {
        (dropzone as HTMLElement).style.opacity = '1';
      });
      addListener(dropzone, 'drop', (e: Event) => {
        e.preventDefault();
        (dropzone as HTMLElement).style.opacity = '1';
        const de = e as DragEvent;
        const file = de.dataTransfer && de.dataTransfer.files[0];
        if (file) readFileToTextarea(file);
      });
    }

    if (fileInput) {
      addListener(fileInput, 'change', (e: Event) => {
        const f = (e.target as HTMLInputElement).files?.[0];
        if (f) readFileToTextarea(f);
      });
    }

    if (convertBtn) {
      addListener(convertBtn, 'click', () => {
        console.log('Convert clicked');
        if (!textarea || !errorDiv) return;
        errorDiv.textContent = '';
        const text = textarea.value.trim();
        if (!text) {
          errorDiv.textContent = 'Input is empty.';
          console.warn('Convert failed: input empty');
          return;
        }
        const parsed = parseAppointments(text);
        if ((parsed as any).error) {
          errorDiv.textContent = (parsed as any).error;
          console.warn('Convert failed:', (parsed as any).error);
          return;
        }
        localStorage.setItem('appointments', JSON.stringify((parsed as any).data));
        localStorage.setItem('eventTitle', eventTitle);
        console.log('Parsed and stored', (parsed as any).data, 'eventTitle=', eventTitle);
        window.location.href = '/review';
      });
    }
  });

  onDestroy(() => {
    removeAll();
  });
</script>

<section style="max-width:900px; margin:0 auto; font-family:var(--font-sans);">
  <p style="color:var(--color-muted-foreground);">Drop a plain text file (one appointment per line) or paste text using the textarea. Expected format per line: <code>YYYY-MM-DD HH:MM-HH:MM</code> (e.g., <code>2026-01-10 09:00-10:30</code>).</p>

  <div bind:this={dropzone} id="dropzone" class="dropzone-centered" role="region" aria-label="File dropzone">
    <div class="dropzone-inner">
      <div class="upload-logo" aria-hidden="true">
        <span class="material-icons" aria-hidden="true">cloud_upload</span>
      </div>

      <div class="dropzone-text">
        <div class="dropzone-title">Drag &amp; Drop Your File Here</div>
        <div class="dropzone-sub">Supported formats: .txt, .text</div>
      </div>

      <button bind:this={fileBtn} id="file-btn" class="dropzone-btn" aria-label="Browse Files">Browse Files</button>

      <input bind:this={fileInput} id="file-input" type="file" accept=".txt,.text,text/plain" style="display:none" />
    </div>
  </div>

  <textarea bind:this={textarea} id="textarea" placeholder="Paste text here" style="width:100%; min-height:180px; padding:.75rem; border-radius:8px; border:1px solid var(--color-border); background:var(--color-input); color:var(--color-foreground);"></textarea> 

  <div class="event-title-field" style="margin:0.5rem 0; display:flex; flex-direction:column; gap:.25rem; width:100%;">
    <label for="event-title" class="event-title-label" style="font-weight:600; color:var(--color-foreground);">Event Title <span style="font-weight:400; color:var(--color-muted-foreground); font-size:.9rem;">(applied to all appointments)</span></label>
    <input id="event-title" bind:value={eventTitle} class="event-title-input" type="text" placeholder="Appointment" style="padding:.5rem .6rem; border-radius:6px; border:1px solid var(--color-border); background:var(--color-input); color:var(--color-foreground);" />
  </div>

  <div style="display:flex; flex-direction:column; gap:.5rem; margin-top:.75rem; width:100%;">
    <button bind:this={convertBtn} id="convert-btn" style="width:100%; padding:.75rem; border-radius:6px; background:var(--color-primary); color:var(--color-primary-foreground); border:none; cursor:pointer; display:flex; justify-content:center; gap:.5rem; align-items:center;" aria-label="Convert"><span class="material-icons" aria-hidden="true">play_arrow</span>Convert</button>
    <div bind:this={errorDiv} id="error" style="color:var(--color-destructive-foreground);"></div>
  </div>
</section>

<style>
  .dropzone-centered {
    border: 2px dashed var(--color-border);
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    background: var(--color-popover);
    color: var(--color-popover-foreground);
    display: flex;
    justify-content: center;
  }

  .dropzone-inner {
    max-width: 560px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
  }

  .upload-logo .material-icons { font-size: 72px; display:block; color: var(--color-muted-foreground); padding: 10px; border-radius: 999px; background: rgba(0,0,0,0.03); }

  .dropzone-title { font-size: 1.1rem; font-weight: 600; color: var(--color-foreground); }
  .dropzone-sub { font-size: 0.9rem; color: var(--color-muted-foreground); }

  .dropzone-btn {
    margin-top: 0.5rem;
    padding: .6rem .75rem;
    border-radius: 6px;
    background: var(--color-accent);
    color: var(--color-accent-foreground);
    border: none;
    cursor: pointer;
    text-transform: none;
    width: auto;
    display: inline-flex;
    align-items: center;
  }

  .dropzone-btn:focus { box-shadow: 0 0 0 3px rgba(0,180,255,0.12); outline: none; }

  @media (min-width: 640px) {
    .dropzone-title { font-size: 1.25rem; }
  }



  .event-title-field { width: 100%; }
  .event-title-input { width: 100%; padding:.5rem .6rem; border-radius:6px; border:1px solid var(--color-border); background:var(--color-input); color:var(--color-foreground); }
  .event-title-label { font-size: 0.95rem; color:var(--color-foreground); }

</style>