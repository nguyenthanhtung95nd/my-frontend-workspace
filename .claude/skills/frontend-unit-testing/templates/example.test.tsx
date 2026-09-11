import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Example component test showing the defaults this skill recommends:
//  - accessibility-first queries (getByRole / getByLabelText)
//  - user-event over fireEvent (and awaited)
//  - Arrange-Act-Assert, one scenario per test
//  - a dependency injected as a prop so it can be a plain mock
// Replace SecretForm with your real component.
import { SecretForm } from '@/components/SecretForm';

describe('SecretForm', () => {
  beforeEach(() => localStorage.clear());

  it('stores the secret the user typed', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(<SecretForm onSaved={onSaved} />);

    // Act
    await user.type(screen.getByLabelText('Secret'), 'my secret');
    await user.click(screen.getByRole('button', { name: 'Store Secret' }));

    // Assert: observable behavior, not internals
    expect(localStorage.getItem('secret')).toBe('my secret');
    expect(onSaved).toHaveBeenCalledWith('my secret');
  });

  it('disables the button until a secret is entered', () => {
    render(<SecretForm onSaved={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Store Secret' })).toBeDisabled();
  });

  it('rejects an empty secret', async () => {
    const user = userEvent.setup();
    render(<SecretForm onSaved={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Store Secret' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Secret is required');
  });
});
