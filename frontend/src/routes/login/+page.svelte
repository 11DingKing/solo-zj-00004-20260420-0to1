<script>
	import { api } from '$lib/services/api';
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

	let username = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleSubmit(e) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const data = await api.post('/users/login/', {
				username,
				password
			});
			auth.login(data);
			goto('/');
		} catch (err) {
			error = err.message || '登录失败，请检查用户名和密码';
		} finally {
			loading = false;
		}
	}
</script>

<div class="auth-container">
	<div class="auth-card">
		<h1>登录</h1>

		{#if error}
			<div class="alert alert-error">{error}</div>
		{/if}

		<form on:submit={handleSubmit}>
			<div class="form-group">
				<label for="username">用户名</label>
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
				<label for="password">密码</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					required
					disabled={loading}
					placeholder="请输入密码"
				/>
			</div>

			<button type="submit" class="btn btn-primary" disabled={loading}>
				{loading ? '登录中...' : '登录'}
			</button>
		</form>

		<div class="auth-footer">
			还没有账号？<a href="/register">立即注册</a>
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
