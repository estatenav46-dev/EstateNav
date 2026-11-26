import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JsonLd } from '@/components/ui/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

vi.mock('next/link', () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));

describe('JsonLd', () => {
  it('cannot be broken out of by text inside the data', () => {
    const { container } = render(<JsonLd data={{ name: '</script><script>alert(1)</script>' }} />);
    const scripts = container.querySelectorAll('script');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].innerHTML).not.toContain('</script>');
    expect(JSON.parse(scripts[0].innerHTML).name).toBe('</script><script>alert(1)</script>');
  });
});

describe('Breadcrumbs', () => {
  it('links every step except the current page', () => {
    render(<Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Bangalore', path: '/bangalore' }, { name: 'Whitefield', path: '/bangalore/whitefield' }]} />);
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Bangalore' })).toHaveAttribute('href', '/bangalore');
    expect(screen.queryByRole('link', { name: 'Whitefield' })).not.toBeInTheDocument();
  });
});
