import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingOverlay } from './LoadingOverlay';

describe('LoadingOverlay Component', () => {
    it('renders the loading overlay and shield icon', () => {
        const { container, getByText } = render(<LoadingOverlay />);

        // Check for the shield icon container and the pulsing text
        const overlayDiv = container.firstChild as HTMLDivElement;
        expect(overlayDiv).toBeInTheDocument();

        expect(getByText('Establishing Secure Link')).toBeInTheDocument();
    });
});
