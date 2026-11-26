import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ListPropertyBar } from '@/components/layout/ListPropertyBar';

vi.mock('next/link', () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));

describe('ListPropertyBar', () => {
  const open = () => fireEvent.click(screen.getByRole('button', { name: /list your property/i }));

  it('starts closed and opens a menu with the form and WhatsApp', () => {
    render(<ListPropertyBar whatsapp="919876543210" />);
    const button = screen.getByRole('button', { name: /list your property/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    open();
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /fill a short form/i })).toHaveAttribute('href', '/contact?intent=list-property');
    const wa = screen.getByRole('link', { name: /message on whatsapp/i });
    expect(wa.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/);
    expect(wa).toHaveAttribute('target', '_blank');
    expect(wa.getAttribute('rel')).toContain('noopener');
  });

  it('closes on Escape', () => {
    render(<ListPropertyBar whatsapp="919876543210" />);
    open();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('link', { name: /fill a short form/i })).not.toBeInTheDocument();
  });

  it('closes when clicking elsewhere, but not inside the menu', () => {
    render(
      <>
        <ListPropertyBar whatsapp="919876543210" />
        <p>outside</p>
      </>,
    );
    open();
    fireEvent.pointerDown(screen.getByRole('link', { name: /fill a short form/i }));
    expect(screen.getByRole('link', { name: /fill a short form/i })).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByText('outside'));
    expect(screen.queryByRole('link', { name: /fill a short form/i })).not.toBeInTheDocument();
  });

  it('toggles closed on a second click', () => {
    render(<ListPropertyBar whatsapp="919876543210" />);
    open();
    open();
    expect(screen.queryByRole('link', { name: /fill a short form/i })).not.toBeInTheDocument();
  });
});
