import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

const apiMock = vi.hoisted(() => ({
  defaults: { headers: { common: {} } },
  post: vi.fn(),
  get: vi.fn(),
}));

vi.mock('../src/services/api', () => ({
  default: apiMock,
}));

function AuthHarness() {
  const { user, token, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-state">{isAuthenticated ? 'authed' : 'guest'}</div>
      <div data-testid="auth-role">{user?.role || 'none'}</div>
      <div data-testid="auth-token">{token || 'none'}</div>
      <button type="button" onClick={() => login({ id: 'u-1', role: 'student' }, 'manual-token')}>
        login
      </button>
      <button type="button" onClick={logout}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('restores a session, updates auth headers, and supports login/logout', async () => {
    apiMock.post.mockResolvedValueOnce({ data: { accessToken: 'silent-refresh-token' } });
    apiMock.post.mockResolvedValue({ data: {} });
    apiMock.get.mockResolvedValueOnce({ data: { id: 'u-1', role: 'student' } });

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth-state')).toHaveTextContent('authed'));
    expect(screen.getByTestId('auth-role')).toHaveTextContent('student');
    expect(screen.getByTestId('auth-token')).toHaveTextContent('silent-refresh-token');
    expect(apiMock.defaults.headers.common.Authorization).toBe('Bearer silent-refresh-token');

    fireEvent.click(screen.getByRole('button', { name: 'login' }));
    expect(screen.getByTestId('auth-token')).toHaveTextContent('manual-token');
    expect(apiMock.defaults.headers.common.Authorization).toBe('Bearer manual-token');

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));
    await waitFor(() => expect(screen.getByTestId('auth-state')).toHaveTextContent('guest'));
    expect(screen.getByTestId('auth-token')).toHaveTextContent('none');
    expect(apiMock.defaults.headers.common.Authorization).toBeUndefined();
    expect(apiMock.post).toHaveBeenCalledWith('/auth/logout');
  });
});