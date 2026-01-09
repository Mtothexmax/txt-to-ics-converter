<script lang="ts">
  export let tag: string = 'h1';
  /** animationSpeed in seconds (number) */
  export let animationSpeed: number = 50;
  /** gradientCloseness in percent (number) controls how wide each color band is; smaller = more bands visible */
  export let gradientCloseness: number = 300;
</script>

<svelte:element this={tag} {...$$restProps} class={"rainbow-title " + ($$restProps?.class ?? '')} style="--rt-speed: {animationSpeed}s; --rt-close: {gradientCloseness}%">
  <slot />
</svelte:element>

<style>
  .rainbow-title {
    margin: 0;
    font-family: var(--font-sans);
    font-weight: 700;

    /* repeating gradient with many stops so multiple colors are visible at once */
    background: repeating-linear-gradient(90deg,
      #00f5a0 0%,
      #00b4ff 8%,
      #8a2be2 16%,
      #ff4d6d 32%,
      #ffd166 42%,
      #00f5a0 50%
    );

    /* control closeness via CSS var set from the component prop */
    background-size: var(--rt-close) 100%;
    background-repeat: repeat;

    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;

    /* continuous motion controlled by --rt-speed */
    animation: flowRainbow var(--rt-speed) linear infinite;

    /* subtle multi-hued glow to evoke PC tower illumination */
    text-shadow:
      0 0 6px rgba(0,180,255,0.07),
      0 0 12px rgba(138,43,226,0.05),
      0 0 20px rgba(255,77,109,0.04);
  }

  @keyframes flowRainbow {
    from { background-position: 0% 50%; }
    to { background-position: 400% 50%; }
  }

  /* Respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .rainbow-title { animation: none; background-position: 0% 50%; }
  }
</style>