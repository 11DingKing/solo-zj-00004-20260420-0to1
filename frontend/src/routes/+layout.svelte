<script>
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	function handleLogout() {
		auth.logout();
		goto('/');
	}
</script>

<nav class="navbar">
	<div class="container">
		<a href="/" class="logo">博客 CMS</a>
		<div class="nav-links">
			<a href="/" class:active={$page.url.pathname === '/'}>首页</a>
			{#if $auth.isAuthenticated}
				<a href="/articles/create">写文章</a>
				<a href="/profile">个人资料</a>
				<button on:click={handleLogout} class="logout-btn">退出</button>
			{:else}
				<a href="/login">登录</a>
				<a href="/register">注册</a>
			{/if}
		</div>
	</div>
</nav>

<main class="main">
	<div class="container">
		<slot />
	</div>
</main>

<footer class="footer">
	<div class="container">
		<p>&copy; 2024 博客 CMS 系统</p>
	</div>
</footer>

<style>
	.navbar {
		background: #2c3e50;
		color: white;
		padding: 1rem 0;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.navbar .container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		color: white;
		font-size: 1.5rem;
		font-weight: bold;
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}

	.nav-links a {
		color: #ecf0f1;
		text-decoration: none;
		transition: color 0.2s;
	}

	.nav-links a:hover,
	.nav-links a.active {
		color: #3498db;
	}

	.logout-btn {
		background: #e74c3c;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.logout-btn:hover {
		background: #c0392b;
	}

	.main {
		min-height: calc(100vh - 160px);
		padding: 2rem 0;
	}

	.footer {
		background: #2c3e50;
		color: #ecf0f1;
		padding: 1.5rem 0;
		text-align: center;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}
</style>
