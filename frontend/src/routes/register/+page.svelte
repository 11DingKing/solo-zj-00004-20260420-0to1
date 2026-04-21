<script>
	import { api } from '$lib/services/api';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	let username = '';
	let email = '';
	let nickname = '';
	let password = '';
	let password2 = '';
	let error = '';
	let loading = false;

	async function handleSubmit(e) {
		e.preventDefault();
		error = '';

		if (password !== password2) {
			error = '两次输入的密码不一致';
			return;
		}

		loading = true;

		try {
			const data = await api.post('/users/register/', {
				username,
				email: email || undefined,
				nickname: nickname || undefined,
				password,
				password2
			});
			auth.login(data);
			goto('/');
		} catch (err) {
			error = err.message || '注册失败，请重试';
		} finally {
			loading = false;
		}
	}
</script>

<div class="auth-container">
	<div class="auth-card">
		<h1>注册</h1>

		{#if error}
			<div class="alert alert-error">{error}</div>
		{/if}

		<form on:submit={handleSubmit}>
			<div class="form-group">
				<label for="username">用户名 <span class="required">*</span></label>
				<input
					type="text"
					id="username"
					bind:value={username}
					required
					disabled={loading}
					placeholder="请输入用户名"
				/>
			</div>

			<div class="form-group">
				<label for="email">邮箱</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					disabled={loading}
					placeholder="请输入邮箱（选填）"
				/>
			</div>

			<div class="form-group">
				<label for="nickname">昵称</label>
				<input
					type="text"
					id="nickname"
					bind:value={nickname}
					disabled={loading}
					placeholder="请输入昵称（选填）"
				/>
			</div>

			<div class="form-group">
				<label for="password">密码 <span class="required">*</span></label>
				<input
					type="password"
					id="password"
					bind:value={password}
					required
					disabled={loading}
					placeholder="请输入密码"
				/>
			</div>

			<div class="form-group">
				<label for="password2">确认密码 <span class="required">*</span></label>
				<input
					type="password"
					id="password2"
					bind:value={password2}
					required
					disabled={loading}
					placeholder="请再次输入密码"
				/>
			</div>

			<button type="submit" class="btn btn-primary" disabled={loading}>
				{loading ? '注册中...' : '注册'}
			</button>
		</form>

		<div class="auth-footer">
			已有账号？<a href="/login">立即登录</a>
		</div>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 60vh;
	}

	.auth-card {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0,0,0,0.1);
		width: 100%;
		max-width: 400px;
	}

	.auth-card h1 {
		text-align: center;
		margin-bottom: 1.5rem;
		color: #2c3e50;
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

	.form-group .required {
		color: #e74c3c;
	}

	.form-group input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #bdc3c7;
		border-radius: 4px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.form-group input:focus {
		outline: none;
		border-color: #3498db;
	}

	.form-group input:disabled {
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

	.auth-footer {
		text-align: center;
		margin-top: 1.5rem;
		color: #7f8c8d;
	}

	.auth-footer a {
		color: #3498db;
		text-decoration: none;
	}

	.auth-footer a:hover {
		text-decoration: underline;
	}
</style>
