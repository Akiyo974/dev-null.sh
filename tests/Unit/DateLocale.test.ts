import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    formatDayLabel,
    formatFullDateTime,
    formatRelativeTime,
    formatZonedDate,
} from '../../resources/js/lib/utils.ts';

void test('month and weekday names stay in English whatever the browser language', () => {
    const original = Object.getOwnPropertyDescriptor(
        Date.prototype,
        'toLocaleDateString',
    )!;

    // A French browser: the default locale is what `undefined` resolves to.
    Object.defineProperty(Date.prototype, 'toLocaleDateString', {
        ...original,
        value(
            this: Date,
            locales?: Intl.LocalesArgument,
            options?: Intl.DateTimeFormatOptions,
        ) {
            return new Intl.DateTimeFormat(locales ?? 'fr-FR', options).format(
                this,
            );
        },
    });

    try {
        const now = new Date('2026-10-18T12:00:00Z');

        assert.equal(formatRelativeTime('2026-10-05T12:00:00Z', now), 'Oct 5');
        assert.equal(
            formatRelativeTime('2025-03-05T12:00:00Z', now),
            'Mar 5, 2025',
        );
        assert.equal(
            formatDayLabel('2026-10-13T12:00:00Z', now),
            'Tue, Oct 13',
        );
        assert.match(
            formatFullDateTime('2026-10-05T12:00:00Z', 'UTC'),
            / · Oct 5, 2026$/,
        );
        assert.equal(
            formatZonedDate('2025-10-05T12:00:00Z', 'UTC'),
            'Oct 5, 2025',
        );
    } finally {
        Object.defineProperty(Date.prototype, 'toLocaleDateString', original);
    }
});
