import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ProtectedRoute from '../src/components/ProtectedRoute';

vi.mock('../src/context/AuthContext', () => ({
	useAuth: () => ({ isAuthenticated: false, user: null, isInitializing: false }),
}));

describe('ProtectedRoute', () => {
	test('does not render children when not authenticated', () => {
		const { container } = render(
			<MemoryRouter>
				<ProtectedRoute><div>Secret</div></ProtectedRoute>
			</MemoryRouter>
		);
		expect(container).not.toHaveTextContent('Secret');
	});
});
