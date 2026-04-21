<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { api } from '$lib/services/api';
	import { auth } from '$lib/stores/auth';
	import { renderMarkdown } from '$lib/utils/markdown';

	let title = '';
	let content = '';
	let selectedCategory = '';
	let selectedTags = [];
	let status = 'draft';
	let coverFile = null;
	let coverPreview = null;
	let originalCoverUrl = null;

	let categories = [];
	let tags = [];
	let article = null;
	let loading = true;
	let submitting = false;
	let error = '';
	let isPreview = false;

	$: if (!$auth.isAuthenticated) {
		goto('/login');
	}

	async function loadData() {
		loading = true;
		try {
			const articleId = $page.params.id;
			article = await api.get(`/articles/${articleId}/`);

			if ($auth.user?.id !== article.author?.id) {
				goto('/');
				return;
			}

			title = article.title;
			content = article.content;
			status = article.status;
			selectedCategory = article.category?.id?.toString() || '';
			selectedTags = article.tags?.map(t => t.id) || [];
			originalCoverUrl = article.cover_url;

			const [categoriesData, tagsData] = await Promise.all([
				api.get('/articles/categories/'),
				api.get('/articles/tags/')
			]);
			categories = categoriesData.results || categoriesData;
			tags = tagsData.results || tagsData;
		} catch (err) {
			error = '加载数据失败';
			console.error('Load error:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadData();
	});

	function handleCoverChange(e) {
		const file = e.target.files[0];
		if (file) {
			coverFile = file;
			coverPreview = URL.createObjectURL(file);
		}
	}

	function toggleTag(tagId) {
		const index = selectedTags.indexOf(tagId);
		if (index > -1) {
			selectedTags.splice(index, 1);
		} else {
			selectedTags.push(tagId);
		}
		selectedTags = [...selectedTags];
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (!title.trim() || !content.trim()) {
			error = '请填写标题和内容';
			return;
		}

		submitting = true;
		error = '';

		try {
			const articleId = $page.params.id;
			const formData = new FormData();
			formData.append('title', title);
			formData.append('content', content);
			formData.append('status', status);
			if (selectedCategory) {
				formData.append('category', selectedCategory);
			}
			selectedTags.forEach(tagId => {
				formData.append('tags', tagId);
			});
			if (coverFile) {
				formData.append('cover', coverFile);
			}

			const data = await api.put(`/articles/${articleId}/`, formData, true);
			goto(`/articles/${data.id}`);
		} catch (err) {
			error = err.message || '更新文章失败，请重试';
			console.error('Update error:', err);
		} finally {
			submitting = false;
		}
	}
</script>

<div class="article-editor-page">
	<div class="page-header">
		<h1>编辑文章</h1>
		<div class="editor-actions">
			<button on:click={() => (isPreview = !isPreview)} class="btn btn-toggle">
				{isPreview ? '编辑' : '预览'}
			</button>
		</div>
	</div>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}

	{#if loading}
		<div class="loading">加载中...</div>
	{:else}
		<form on:submit={handleSubmit}>
			<div class="form-section">
				<div class="form-group">
					<label for="title">标题 <span class="required">*</span></label>
					<input
						type="text"
						id="title"
						bind:value={title}
						placeholder="请输入文章标题"
						disabled={submitting}
					/>
				</div>

				<div class="form-group">
					<label>封面图</label>
					<div class="cover-upload">
						{#if coverPreview || originalCoverUrl}
							<div class="cover-preview">
								<img src={coverPreview || originalCoverUrl} alt="封面预览" />
								<button
									type="button"
									on:click={() => {
										coverFile = null;
										coverPreview = null;
										originalCoverUrl = null;
									}}
									class="remove-cover"
								>
									移除
								</button>
							</div>
						{:else}
							<label class="upload-btn">
								<span>点击上传封面图</span>
								<input
									type="file"
									accept="image/*"
									on:change={handleCoverChange}
									hidden
								/>
							</label>
						{/if}
					</div>
				</div>

				{#if !isPreview}
					<div class="form-group">
						<label for="content">内容 <span class="required">*</span></label>
						<textarea
							id="content"
							bind:value={content}
							placeholder="请输入文章内容（支持 Markdown 语法）"
							rows={20}
							disabled={submitting}
						></textarea>
						<p class="help-text">支持 Markdown 语法：# 标题、**粗体**、*斜体*、> 引用、- 列表等</p>
					</div>
				{:else}
					<div class="form-group">
						<label>内容预览</label>
						<div class="markdown-preview">
							{#if content}
								{@html renderMarkdown(content)}
							{:else}
								<p class="empty-preview">暂无内容可预览</p>
							{/if}
						</div>
					</div>
				{/if}
			</div>

			<div class="form-sidebar">
				<div class="sidebar-section">
					<h3>分类</h3>
					<select bind:value={selectedCategory} disabled={submitting}>
						<option value="">未分类</option>
						{#each categories as category}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>

				<div class="sidebar-section">
					<h3>标签</h3>
					<div class="tags-grid">
						{#each tags as tag}
							<label class="tag-item" class:active={selectedTags.includes(tag.id)}>
								<input
									type="checkbox"
									checked={selectedTags.includes(tag.id)}
									on:change={() => toggleTag(tag.id)}
									disabled={submitting}
									hidden
								/>
								<span>{tag.name}</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="sidebar-section">
					<h3>状态</h3>
					<select bind:value={status} disabled={submitting}>
						<option value="draft">草稿</option>
						<option value="published">发布</option>
					</select>
				</div>

				<div class="submit-section">
					<button type="button" on:click={() => goto(`/articles/${article?.id}`)} class="btn btn-cancel" disabled={submitting}>
						取消
					</button>
					<button type="submit" class="btn btn-primary" disabled={submitting}>
						{submitting ? '保存中...' : '保存'}
					</button>
				</div>
			</div>
		</form>
	{/if}
</div>

<style>
	.article-editor-page {
		max-width: 1000px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.page-header h1 {
		color: #2c3e50;
		margin: 0;
	}

	.editor-actions {
		display: flex;
		gap: 0.5rem;
	}

	.loading {
		text-align: center;
		padding: 3rem;
		color: #7f8c8d;
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

	form {
		display: flex;
		gap: 2rem;
	}

	.form-section {
		flex: 1;
	}

	.form-sidebar {
		width: 280px;
		flex-shrink: 0;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #34495e;
		font-weight: 500;
	}

	.form-group .required {
		color: #e74c3c;
	}

	.form-group input[type="text"],
	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 0.75rem 1rem;
		border: 1px solid #bdc3c7;
		border-radius: 4px;
		font-size: 1rem;
		transition: border-color 0.2s;
		font-family: inherit;
		box-sizing: border-box;
	}

	.form-group input[type="text"]:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: #3498db;
	}

	.form-group input[type="text"]:disabled,
	.form-group textarea:disabled,
	.form-group select:disabled {
		background: #f5f5f5;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 400px;
		line-height: 1.6;
	}

	.help-text {
		color: #95a5a6;
		font-size: 0.85rem;
		margin-top: 0.5rem;
	}

	.cover-upload {
		border: 2px dashed #bdc3c7;
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		transition: border-color 0.2s;
	}

	.cover-upload:hover {
		border-color: #3498db;
	}

	.upload-btn {
		color: #3498db;
		cursor: pointer;
	}

	.upload-btn:hover {
		text-decoration: underline;
	}

	.cover-preview {
		position: relative;
	}

	.cover-preview img {
		max-width: 100%;
		max-height: 200px;
		border-radius: 4px;
	}

	.remove-cover {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: #e74c3c;
		color: white;
		border: none;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.85rem;
	}

	.markdown-preview {
		background: white;
		border: 1px solid #bdc3c7;
		border-radius: 4px;
		padding: 1rem;
		min-height: 400px;
		line-height: 1.8;
		color: #34495e;
	}

	.markdown-preview :global(h1),
	.markdown-preview :global(h2),
	.markdown-preview :global(h3),
	.markdown-preview :global(h4),
	.markdown-preview :global(h5),
	.markdown-preview :global(h6) {
		color: #2c3e50;
		margin-top: 1.5rem;
		margin-bottom: 1rem;
	}

	.markdown-preview :global(h1) { font-size: 1.75rem; }
	.markdown-preview :global(h2) { font-size: 1.5rem; }
	.markdown-preview :global(h3) { font-size: 1.25rem; }

	.markdown-preview :global(p) {
		margin-bottom: 1rem;
	}

	.markdown-preview :global(pre) {
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		margin-bottom: 1rem;
	}

	.markdown-preview :global(code) {
		background: #f8f9fa;
		padding: 0.2rem 0.4rem;
		border-radius: 3px;
		font-size: 0.9em;
	}

	.markdown-preview :global(pre code) {
		background: none;
		padding: 0;
	}

	.markdown-preview :global(blockquote) {
		border-left: 4px solid #3498db;
		padding-left: 1rem;
		margin: 1rem 0;
		color: #7f8c8d;
	}

	.markdown-preview :global(ul),
	.markdown-preview :global(ol) {
		margin-bottom: 1rem;
		padding-left: 2rem;
	}

	.markdown-preview :global(li) {
		margin-bottom: 0.5rem;
	}

	.empty-preview {
		color: #95a5a6;
		text-align: center;
		padding: 2rem;
	}

	.sidebar-section {
		background: white;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
		box-shadow: 0 2px 4px rgba(0,0,0,0.05);
	}

	.sidebar-section h3 {
		margin-top: 0;
		margin-bottom: 0.75rem;
		color: #2c3e50;
		font-size: 1rem;
	}

	.tags-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag-item {
		background: #ecf0f1;
		color: #7f8c8d;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tag-item:hover {
		background: #bdc3c7;
	}

	.tag-item.active {
		background: #3498db;
		color: white;
	}

	.submit-section {
		display: flex;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.2s;
		flex: 1;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background: #3498db;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2980b9;
	}

	.btn-cancel {
		background: #ecf0f1;
		color: #7f8c8d;
	}

	.btn-cancel:hover:not(:disabled) {
		background: #bdc3c7;
	}

	.btn-toggle {
		background: #ecf0f1;
		color: #34495e;
		padding: 0.5rem 1rem;
		flex: none;
	}

	.btn-toggle:hover:not(:disabled) {
		background: #bdc3c7;
	}
</style>
