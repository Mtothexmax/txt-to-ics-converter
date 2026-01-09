<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let dropzone: HTMLElement | null = null;
  let fileInput: HTMLInputElement | null = null;
  let fileBtn: HTMLElement | null = null;
  let textarea: HTMLTextAreaElement | null = null;
  let convertBtn: HTMLElement | null = null;
  let errorDiv: HTMLElement | null = null;

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
        console.log('Parsed and stored', (parsed as any).data);
        window.location.href = '/review';
      });
    }
  });

  onDestroy(() => {
    removeAll();
  });
</script>

<section style="max-width:900px; margin:0 auto; font-family:var(--font-sans);">
  <h2 style="margin-top:0;">Text to ICS Converter</h2>
  <p style="color:var(--color-muted-foreground);">Drop a plain text file (one appointment per line) or paste text using the textarea. Expected format per line: <code>YYYY-MM-DD HH:MM-HH:MM</code> (e.g., <code>2026-01-10 09:00-10:30</code>).</p>

  <div bind:this={dropzone} id="dropzone" style="border:2px dashed var(--color-border); padding:1rem; border-radius:8px; margin-bottom:1rem; background:var(--color-popover); color:var(--color-popover-foreground);">
    <p style="margin:0.25rem 0;">Drag & drop a text file here or <button bind:this={fileBtn} id="file-btn" style="background:var(--color-accent); color:var(--color-accent-foreground); border:none; padding:.35rem .5rem; border-radius:6px; cursor:pointer; display:flex; gap:.5rem; align-items:center;" aria-label="Choose file"><span class="material-icons" aria-hidden>upload_file</span>Choose file</button></p>
    <input bind:this={fileInput} id="file-input" type="file" accept="text/plain" style="display:none" />
  </div>

  <textarea bind:this={textarea} id="textarea" placeholder="Paste text here" style="width:100%; min-height:180px; padding:.75rem; border-radius:8px; border:1px solid var(--color-border); background:var(--color-input); color:var(--color-foreground);"></textarea>

  <div style="display:flex; gap:1rem; align-items:center; margin-top:.75rem;">
    <button bind:this={convertBtn} id="convert-btn" style="padding:.5rem .75rem; border-radius:6px; background:var(--color-primary); color:var(--color-primary-foreground); border:none; cursor:pointer; display:flex; gap:.5rem; align-items:center;" aria-label="Convert"><span class="material-icons" aria-hidden>play_arrow</span>Convert</button>
    <div bind:this={errorDiv} id="error" style="color:var(--color-destructive-foreground);"></div>
  </div>
</section>