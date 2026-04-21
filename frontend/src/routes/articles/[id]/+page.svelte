<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { api } from '$lib/services/api';
	import { auth } from '$lib/stores/auth';
	import { renderMarkdown } from '$lib/utils/markdown';

	let article = null;
	let comments = [];
	let loading = true;
	let error = '';

	let newComment = '';
	let replyTo = null;
	let commentLoading = false;

	let isAuthor = false;

	async function loadArticle() {
		loading = true;
		error = '';

		try {
			const articleId = $page.params.id;
			article = await api.get(`/articles/${articleId}/view/`);

			isAuthor = $auth.isAuthenticated && $auth.user?.id === article.author?.id;

			const commentsData = await api.get('/comments/', { article: articleId });
			comments = commentsData.results || commentsData;
		} catch (err) {
			error = '加载文章失败，请刷新重试';
			console.error('Load error:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadArticle();
	});

	async function handleSubmitComment() {
		if (!newComment.trim() || !$auth.isAuthenticated) return;

		commentLoading = true;

		try {
			const commentData = {
				article: article.id,
				content: newComment.trim()
			};

			if (replyTo) {
				commentData.parent = replyTo.id;
			}

			const savedComment = await api.post('/comments/', commentData);
			comments = [savedComment, ...comments];
			newComment = '';
			replyTo = null;
		} catch (err) {
			console.error('Comment error:', err);
		} finally {
			commentLoading = false;
		}
	}

	function handleReply(comment) {
		if ($auth.isAuthenticated) {
			replyTo = comment;
		} else {
			goto('/login');
		}
	}

	function cancelReply() {
		replyTo = null;
	}

	async function handleDeleteArticle() {
		if (!confirm('确定要删除这篇文章吗？')) return;

		try {
			await api.delete(`/articles/${article.id}/`);
			goto('/');
		} catch (err) {
			console.error('Delete error:', err);
		}
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="article-detail-page">
	{#if loading}
		<div class="loading">加载中...</div>
	{:else if error}
		<div class="alert alert-error">{error}</div>
	{:else if article}
		<article class="article-detail">
			{#if article.cover_url}
				<div class="article-cover">
					<img src={article.cover_url} alt={article.title} />
				</div>
			{/if}

			<header class="article-header">
				<h1 class="article-title">{article.title}</h1>
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
					<span class="views">阅读 {article.views}</span>
				</div>
				{#if article.tags?.length > 0}
					<div class="article-tags">
						{#each article.tags as tag}
							<span class="tag">{tag.name}</span>
						{/each}
					</div>
				{/if}

				{#if isAuthor}
					<div class="article-actions">
						<button class="btn btn-edit" on:click={() => goto(`/articles/${article.id}/edit`)}>
							编辑
						</button>
						<button class="btn btn-delete" on:click={handleDeleteArticle}>
							删除
						</button>
					</div>
				{/if}
			</header>

			<div class="article-content">
				{@html renderMarkdown(article.content)}
			</div>
		</article>

		<section class="comments-section">
			<h2>评论 ({comments.length})</h2>

			<div class="comment-form">
				{#if $auth.isAuthenticated}
					{#if replyTo}
						<div class="reply-notice">
							回复 @{replyTo.author?.display_name || replyTo.author?.username}
							<button on:click={cancelReply} class="cancel-reply">取消</button>
						</div>
					{/if}
					<textarea
						bind:value={newComment}
						placeholder="写下你的评论..."
						rows={3}
						disabled={commentLoading}
					></textarea>
					<button
						on:click={handleSubmitComment}
						disabled={!newComment.trim() || commentLoading}
						class="btn btn-primary"
					>
						{commentLoading ? '发送中...' : '发送'}
					</button>
				{:else}
					<div class="login-prompt">
						<a href="/login">登录</a> 后发表评论
					</div>
				{/if}
			</div>

			{#if comments.length === 0}
				<div class="empty-comments">暂无评论</div>
			{:else}
				<div class="comments-list">
					{#each comments as comment}
						<div class="comment-item" id={`comment-${comment.id}`}>
							<div class="comment-header">
								<span class="comment-author">
									{comment.author?.display_name || comment.author?.username}
								</span>
								<span class="comment-date">
									{formatDate(comment.created_at)}
								</span>
							</div>
							<div class="comment-content">{comment.content}</div>
							<div class="comment-actions">
								{#if !comment.is_reply}
									<button on:click={() => handleReply(comment)} class="reply-btn">
										回复
									</button>
								{/if}
							</div>

							{#if comment.replies?.length > 0}
								<div class="replies-list">
									{#each comment.replies as reply}
										<div class="reply-item" id={`comment-${reply.id}`}>
											<div class="comment-header">
												<span class="comment-author">
													{reply.author?.display_name || reply.author?.username}
												</span>
												{#if reply.parent_author}
													<span class="reply-to">
														回复 @{reply.parent_author.display_name || reply.parent_author.username}
													</span>
												{/if}
												<span class="comment-date">
													{formatDate(reply.created_at)}
												</span>
											</div>
											<div class="comment-content">{reply.content}</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</div>

<style>
	.article-detail-page {
		max-width: 800px;
		margin: 0 auto;
	}

	.loading,
	.empty-comments {
		text-align: center;
		padding: 3rem;
		color: #7f8c8d;
	}

	.alert {
		padding: 1rem;
		border-radius: 4px;
	}

	.alert-error {
		background: #fdf2f2;
		color: #e74c3c;
		border: 1px solid #fecaca;
	}

	.article-detail {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		overflow: hidden;
		margin-bottom: 2rem;
	}

	.article-cover {
		max-height: 400px;
		overflow: hidden;
	}

	.article-cover img {
		width: 100%;
		height: auto;
		object-fit: cover;
	}

	.article-header {
		padding: 2rem;
		border-bottom: 1px solid #ecf0f1;
	}

	.article-title {
		font-size: 2rem;
		color: #2c3e50;
		margin-bottom: 1rem;
		line-height: 1.3;
	}

	.article-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		color: #95a5a6;
		font-size: 0.9rem;
		margin-bottom: 1rem;
	}

	.article-meta .category {
		color: #3498db;
		font-weight: 500;
	}

	.article-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.article-tags .tag {
		background: #ecf0f1;
		color: #7f8c8d;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
	}

	.article-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #3498db;
		color: white;
	}

	.btn-primary:hover {
		background: #2980b9;
	}

	.btn-primary:disabled {
		background: #95a5a6;
		cursor: not-allowed;
	}

	.btn-edit {
		background: #f1c40f;
		color: #2c3e50;
	}

	.btn-edit:hover {
		background: #f39c12;
	}

	.btn-delete {
		background: #e74c3c;
		color: white;
	}

	.btn-delete:hover {
		background: #c0392b;
	}

	.article-content {
		padding: 2rem;
		line-height: 1.8;
		color: #34495e;
	}

	.article-content :global(h1),
	.article-content :global(h2),
	.article-content :global(h3),
	.article-content :global(h4),
	.article-content :global(h5),
	.article-content :global(h6) {
		color: #2c3e50;
		margin-top: 1.5rem;
		margin-bottom: 1rem;
	}

	.article-content :global(h1) { font-size: 1.75rem; }
	.article-content :global(h2) { font-size: 1.5rem; }
	.article-content :global(h3) { font-size: 1.25rem; }

	.article-content :global(p) {
		margin-bottom: 1rem;
	}

	.article-content :global(pre) {
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		margin-bottom: 1rem;
	}

	.article-content :global(code) {
		background: #f8f9fa;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-size: 0.9em;
	}

	.article-content :global(pre code) {
		background: none;
		padding: 0;
	}

	.article-content :global(blockquote) {
		border-left: 4px solid #3498db;
		padding-left: 1rem;
		margin: 1rem 0;
		color: #7f8c8d;
	}

	.article-content :global(ul),
	.article-content :global(ol) {
		margin-bottom: 1rem;
		padding-left: 2rem;
	}

	.article-content :global(li) {
		margin-bottom: 0.5rem;
	}

	.article-content :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 4px;
	}

	.article-content :global(a) {
		color: #3498db;
		text-decoration: none;
	}

	.article-content :global(a:hover) {
		text-decoration: underline;
	}

	.comments-section {
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		padding: 2rem;
	}

	.comments-section h2 {
		color: #2c3e50;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #ecf0f1;
	}

	.comment-form {
		margin-bottom: 2rem;
	}

	.login-prompt {
		text-align: center;
		padding: 1rem;
		color: #7f8c8d;
	}

	.login-prompt a {
		color: #3498db;
		text-decoration: none;
	}

	.reply-notice {
		background: #f8f9fa;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 0.75rem;
		color: #7f8c8d;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.cancel-reply {
		background: none;
		border: none;
		color: #e74c3c;
		cursor: pointer;
		font-size: 0.85rem;
	}

	.comment-form textarea {
		width: 100%;
		padding: 1rem;
		border: 1px solid #bdc3c7;
		border-radius: 4px;
		font-size: 1rem;
		resize: vertical;
		margin-bottom: 0.75rem;
		font-family: inherit;
	}

	.comment-form textarea:focus {
		outline: none;
		border-color: #3498db;
	}

	.comment-form textarea:disabled {
		background: #f5f5f5;
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.comment-item {
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 8px;
	}

	.comment-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.comment-author {
		font-weight: 500;
		color: #2c3e50;
	}

	.comment-date {
		color: #95a5a6;
		font-size: 0.85rem;
	}

	.reply-to {
		color: #3498db;
		font-size: 0.85rem;
	}

	.comment-content {
		color: #34495e;
		line-height: 1.6;
		margin-bottom: 0.5rem;
	}

	.comment-actions {
		margin-top: 0.5rem;
	}

	.reply-btn {
		background: none;
		border: none;
		color: #3498db;
		cursor: pointer;
		font-size: 0.85rem;
		padding: 0;
	}

	.reply-btn:hover {
		text-decoration: underline;
	}

	.replies-list {
		margin-top: 1rem;
		margin-left: 1rem;
		padding-left: 1rem;
		border-left: 2px solid #e9ecef;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.reply-item {
		background: white;
		padding: 0.75rem;
		border-radius: 6px;
	}
</style>
