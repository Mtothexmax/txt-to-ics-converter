<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let { children } = $props();

	let themeIcon = 'dark_mode';

	onMount(() => {
		const theme = localStorage.getItem('theme');
		if (theme === 'dark') document.documentElement.classList.add('dark');
		else if (theme === 'light') document.documentElement.classList.remove('dark');
		else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');

		themeIcon = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
	});

	function toggleTheme() {
		const isDark = document.documentElement.classList.toggle('dark');
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
		themeIcon = isDark ? 'light_mode' : 'dark_mode';
	}

	function goHome() {
		goto('/');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href="/shadcn.css" />
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
</svelte:head>

<header style="background:var(--color-card); color:var(--color-card-foreground); padding:1rem; display:flex; align-items:center; justify-content:space-between; gap:1rem;">
	<div style="display:flex; align-items:center; gap:1rem;">
		<h1 tabindex="0" role="link" onclick={goHome} onkeydown={e => ((e.key === 'Enter' || e.key === ' ') ? goHome() : null)} style="margin:0; font-family:var(--font-sans); cursor:pointer;">Text to ICS Converter</h1>
	</div>
	<div>
		<button onclick={toggleTheme} style="padding:.35rem .5rem; border-radius:6px; background:var(--color-primary); color:var(--color-primary-foreground); border:none; cursor:pointer; display:flex; align-items:center; gap:.5rem;" aria-label="Toggle theme"><span class="material-icons" aria-hidden>{themeIcon}</span></button>
	</div> 
</header>

<main style="padding:1.25rem; background:var(--color-background); color:var(--color-foreground); min-height:calc(100vh - 72px);">
	{@render children()}
</main>
