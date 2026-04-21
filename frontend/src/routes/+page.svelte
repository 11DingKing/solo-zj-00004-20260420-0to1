<script>
	import { onMount } from 'svelte';
	import { api } from '$lib/services/api';
	import { goto } from '$app/navigation';

	let articles = [];
	let categories = [];
	let tags = [];
	let loading = false;
	let error = '';

	let currentPage = 1;
	let totalPages = 1;
	let totalCount = 0;

	let searchQuery = '';
	let selectedCategory = null;
	let selectedTag = null;

	async function loadData() {
		loading = true;
		error = '';

		try {
			const params = {
				page: currentPage
			};

			if (searchQuery) {
				params.search = searchQuery;
			}
			if (selectedCategory) {
				params.category = selectedCategory;
			}
			if (selectedTag) {
				params.tag = selectedTag;
			}

			const [articlesData, categoriesData, tagsData] = await Promise.all([
				api.get('/articles/', params),
				api.get('/articles/categories/'),
				api.get('/articles/tags/')
			]);

			articles = articlesData.results || articlesData;
			totalCount = articlesData.count || articles.length;
			totalPages = Math.ceil(totalCount / 12);
			categories = categoriesData.results || categoriesData;
			tags = tagsData.results || tagsData;
		} catch (err) {
			error = '加载数据失败，请刷新重试';
			console.error('Load error:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadData();
	});

	function handleSearch() {
		currentPage = 1;
		loadData();
	}

	function handleCategoryChange(categoryId) {
		selectedCategory = categoryId === '' ? null : parseInt(categoryId);
		currentPage = 1;
		loadData();
	}

	function handleTagChange(tagId) {
		selectedTag = tagId === '' ? null : parseInt(tagId);
		currentPage = 1;
		loadData();
	}

	function handlePageChange(page) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			loadData();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function clearFilters() {
		searchQuery = '';
		selectedCategory = null;
		selectedTag = null;
		currentPage = 1;
		loadData();
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<div class="home-page">
	<div class="page-header">
		<h1>文章列表</h1>
		<p class="subtitle">共 {totalCount} 篇文章</p>
	</div>

	<div class="search-filter-section">
		<div class="search-box">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="搜索文章标题..."
				on:keydown={(e) => e.key === 'Enter' && handleSearch()}
			/>
			<button on:click={handleSearch} class="search-btn">搜索</button>
		</div>

		<div class="filters">
			<div class="filter-item">
				<label>分类：</label>
				<select on:change={(e) => handleCategoryChange(e.target.value)}>
					<option value="">全部</option>
					{#each categories as category}
						<option value={category.id} selected={selectedCategory === category.id}>
							{category.name}
						</option>
					{/each}
				</select>
			</div>

			<div class="filter-item">
				<label>标签：</label>
				<select on:change={(e) => handleTagChange(e.target.value)}>
					<option value="">全部</option>
					{#each tags as tag}
						<option value={tag.id} selected={selectedTag === tag.id}>
							{tag.name}
						</option>
					{/each}
				</select>
			</div>

			{#if searchQuery || selectedCategory || selectedTag}
				<button on:click={clearFilters} class="clear-btn">清除筛选</button>
			{/if}
		</div>
	</div>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}

	{#if loading}
		<div class="loading">加载中...</div>
	{:else if articles.length === 0}
		<div class="empty-state">
			<p>暂无文章</p>
		</div>
	{:else}
		<div class="articles-grid">
			{#each articles as article}
				<article class="article-card" on:click={() => goto(`/articles/${article.id}`)}>
					{#if article.cover_url}
						<div class="article-cover">
							<img src={article.cover_url} alt={article.title} />
						</div>
					{/if}
					<div class="article-content">
						<h3 class="article-title">{article.title}</h3>
						<p class="article-excerpt">{article.excerpt}</p>
						<div class="article-meta">
							<span class="author">
								{article.author?.display_name || article.author?.username}
							</span>
							<span class="date">
								{formatDate(article.published_at || article.created_at)}
							</span>
							{#if article.category}
								<span class="category">{article.category.name}</span>
							{/if}
						</div>
						{#if article.tags?.length > 0}
							<div class="article-tags">
								{#each article.tags as tag}
									<span class="tag">{tag.name}</span>
								{/each}
							</div>
						{/if}
					</div>
				</article>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="pagination">
				<button
					on:click={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1}
					class="page-btn"
				>
					上一页
				</button>
				<div class="page-numbers">
					{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
						<button
							on:click={() => handlePageChange(page)}
							class:active={currentPage === page}
							class="page-num"
						>
							{page}
						</button>
					{/each}
				</div>
				<button
					on:click={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					class="page-btn"
				>
					下一页
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.home-page {
		min-height: 100vh;
	}

	.page-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		color: #2c3e50;
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: #7f8c8d;
	}

	.search-filter-section {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		margin-bottom: 2rem;
	}

	.search-box {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.search-box input {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 1px solid #bdc3c7;
		border-radius: 4px;
		font-size: 1rem;
	}

	.search-box input:focus {
		outline: none;
		border-color: #3498db;
	}

	.search-btn {
		padding: 0.75rem 1.5rem;
		background: #3498db;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.search-btn:hover {
		background: #2980b9;
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
	}

	.filter-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.filter-item label {
		color: #7f8c8d;
		font-size: 0.9rem;
	}

	.filter-item select {
		padding: 0.5rem 1rem;
		border: 1px solid #bdc3c7;
		border-radius: 4px;
		background: white;
		cursor: pointer;
	}

	.clear-btn {
		padding: 0.5rem 1rem;
		background: #ecf0f1;
		color: #7f8c8d;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.clear-btn:hover {
		background: #bdc3c7;
	}

	.alert {
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.alert-error {
		background: #fdf2f2;
		color: #e74c3c;
		border: 1px solid #fecaca;
	}

	.loading,
	.empty-state {
		text-align: center;
		padding: 3rem;
		color: #7f8c8d;
	}

	.articles-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	.article-card {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		overflow: hidden;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.article-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 20px rgba(0,0,0,0.15);
	}

	.article-cover {
		height: 180px;
		overflow: hidden;
	}

	.article-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.article-card:hover .article-cover img {
		transform: scale(1.05);
	}

	.article-content {
		padding: 1.25rem;
	}

	.article-title {
		font-size: 1.1rem;
		color: #2c3e50;
		margin-bottom: 0.75rem;
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.article-excerpt {
		color: #7f8c8d;
		font-size: 0.9rem;
		line-height: 1.6;
		margin-bottom: 1rem;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
	}

	.article-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		font-size: 0.85rem;
		color: #95a5a6;
		margin-bottom: 0.75rem;
	}

	.article-meta .category {
		color: #3498db;
		font-weight: 500;
	}

	.article-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.article-tags .tag {
		background: #ecf0f1;
		color: #7f8c8d;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.75rem;
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		margin-top: 2rem;
	}

	.page-btn {
		padding: 0.5rem 1rem;
		background: white;
		border: 1px solid #bdc3c7;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.page-btn:hover:not(:disabled) {
		background: #ecf0f1;
		border-color: #3498db;
	}

	.page-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.page-numbers {
		display: flex;
		gap: 0.25rem;
	}

	.page-num {
		padding: 0.5rem 0.75rem;
		background: white;
		border: 1px solid #bdc3c7;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.page-num:hover {
		background: #ecf0f1;
	}

	.page-num.active {
		background: #3498db;
		color: white;
		border-color: #3498db;
	}
</style>
