import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar Component', () => {
    it('renders with default props', () => {
        const { container } = render(<Avatar avatarColor="#ff0000" />);
        const avatarDiv = container.firstChild as HTMLDivElement;
        expect(avatarDiv).toBeInTheDocument();
        // Check if color is applied
        expect(avatarDiv.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('renders the correct dot when connected', () => {
        const { container } = render(<Avatar avatarColor="#00ff00" isConnected={true} />);
        // By framer-motion defaults, the span is rendered. We can just verify it is in the DOM
        const span = container.querySelector('span');
        expect(span).toBeInTheDocument();
        expect(span?.className).toContain('bg-success');
    });

    it('does not render connection dot when unconnected or explicitly false', () => {
        const { container } = render(<Avatar avatarColor="#00ff00" isConnected={false} />);
        const span = container.querySelector('span');
        expect(span).not.toBeInTheDocument();
    });
});
