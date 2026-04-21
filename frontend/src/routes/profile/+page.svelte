<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/services/api';
	import { auth } from '$lib/stores/auth';

	let user = null;
	let loading = false;
	let error = '';
	let success = '';

	let nickname = '';
	let bio = '';
	let email = '';
	let avatarFile = null;

	$: if (!$auth.isAuthenticated) {
		goto('/login');
	}

	onMount(async () => {
		try {
			const data = await api.get('/users/profile/');
			user = data;
			nickname = user.nickname || '';
			bio = user.bio || '';
			email = user.email || '';
		} catch (err) {
			error = '加载个人资料失败';
		}
	});

	function handleAvatarChange(e) {
		const file = e.target.files[0];
		if (file) {
			avatarFile = file;
		}
	}

	async function handleSubmit(e) {
		e.preventDefault();
		error = '';
		success = '';
		loading = true;

		try {
			const formData = new FormData();
			if (nickname) formData.append('nickname', nickname);
			if (bio) formData.append('bio', bio);
			if (email) formData.append('email', email);
			if (avatarFile) formData.append('avatar', avatarFile);

			const data = await api.patch('/users/profile/update/', formData, true);
			auth.updateUser(data);
			user = { ...user, ...data };
			success = '个人资料更新成功';
			avatarFile = null;
		} catch (err) {
			error = err.message || '更新失败，请重试';
		} finally {
			loading = false;
		}
	}
</script>

<div class="profile-container">
	<div class="profile-card">
		<h1>个人资料</h1>

		{#if error}
			<div class="alert alert-error">{error}</div>
		{/if}

		{#if success}
			<div class="alert alert-success">{success}</div>
		{/if}

		{#if user}
			<div class="avatar-section">
				<div class="avatar-preview">
					{#if user.avatar_url || avatarFile}
						<img
							src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatar_url}
							alt="头像"
							class="avatar"
						/>
					{:else}
						<div class="avatar-placeholder">
							{user.display_name[0]?.toUpperCase() || '?'}
						</div>
					{/if}
				</div>
				<label class="avatar-upload-btn">
					更换头像
					<input type="file" accept="image/*" on:change={handleAvatarChange} hidden />
				</label>
			</div>

			<form on:submit={handleSubmit}>
				<div class="form-group">
					<label for="username">用户名</label>
					<input
						type="text"
						id="username"
						value={user.username}
						disabled
					/>
				</div>

				<div class="form-group">
					<label for="email">邮箱</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						disabled={loading}
						placeholder="请输入邮箱"
					/>
				</div>

				<div class="form-group">
					<label for="nickname">昵称</label>
					<input
						type="text"
						id="nickname"
						bind:value={nickname}
						disabled={loading}
						placeholder="请输入昵称"
					/>
				</div>

				<div class="form-group">
					<label for="bio">简介</label>
					<textarea
						id="bio"
						bind:value={bio}
						disabled={loading}
						placeholder="请输入个人简介（最多500字）"
						rows={4}
					></textarea>
				</div>

				<button type="submit" class="btn btn-primary" disabled={loading}>
					{loading ? '保存中...' : '保存修改'}
				</button>
			</form>

			<div class="info-section">
				<h3>账号信息</h3>
				<div class="info-item">
					<span class="label">注册时间：</span>
					<span class="value">{new Date(user.created_at).toLocaleString('zh-CN')}</span>
				</div>
			</div>
		{:else}
			<div class="loading">加载中...</div>
		{/if}
	</div>
</div>

<style>
	.profile-container {
		display: flex;
		justify-content: center;
		min-height: 60vh;
	}

	.profile-card {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		width: 100%;
		max-width: 600px;
	}

	.profile-card h1 {
		text-align: center;
		margin-bottom: 1.5rem;
		color: #2c3e50;
	}

	.avatar-section {
		text-align: center;
		margin-bottom: 2rem;
	}

	.avatar-preview {
		margin-bottom: 1rem;
	}

	.avatar {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid #3498db;
	}

	.avatar-placeholder {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: #3498db;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		font-weight: bold;
		margin: 0 auto;
	}

	.avatar-upload-btn {
		background: #ecf0f1;
		color: #3498db;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: background 0.2s;
	}

	.avatar-upload-btn:hover {
		background: #bdc3c7;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		color: #34495e;
		font-weight: 500;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #bdc3c7;
		border-radius: 4px;
		font-size: 1rem;
		transition: border-color 0.2s;
		font-family: inherit;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: #3498db;
	}

	.form-group input:disabled,
	.form-group textarea:disabled {
		background: #f5f5f5;
	}

	.btn {
		width: 100%;
		padding: 0.75rem;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
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

	.alert {
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.alert-error {
		background: #fdf2f2;
		color: #e74c3c;
		border: 1px solid #fecaca;
	}

	.alert-success {
		background: #f0fdf4;
		color: #27ae60;
		border: 1px solid #bbf7d0;
	}

	.loading {
		text-align: center;
		color: #7f8c8d;
		padding: 2rem;
	}

	.info-section {
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid #ecf0f1;
	}

	.info-section h3 {
		color: #2c3e50;
		margin-bottom: 1rem;
	}

	.info-item {
		display: flex;
		margin-bottom: 0.5rem;
	}

	.info-item .label {
		color: #7f8c8d;
		margin-right: 0.5rem;
	}

	.info-item .value {
		color: #34495e;
	}
</style>
