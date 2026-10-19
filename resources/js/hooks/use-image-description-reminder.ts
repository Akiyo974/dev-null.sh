import { useRef, useState } from 'react';

const dismissedKey = 'image-description-reminder-dismissed';

function isDismissed(): boolean {
    try {
        return window.localStorage.getItem(dismissedKey) === '1';
    } catch {
        return false;
    }
}

/**
 * Screen readers read an image's description to people who can't see it, so posting an undescribed image asks first.
 * "Post anyway" holds for the images as they are; adding or removing one asks again.
 */
export function useImageDescriptionReminder(
    images: File[],
    descriptions: string[],
) {
    const undescribed = images.filter(
        (_, index) => !descriptions[index]?.trim(),
    ).length;
    const [confirming, setConfirming] = useState(false);
    const [dismissed, setDismissed] = useState(isDismissed);
    const approvedImages = useRef<File[] | null>(null);

    const beforeSubmit = () => {
        if (
            undescribed === 0 ||
            dismissed ||
            approvedImages.current === images
        ) {
            return true;
        }

        setConfirming(true);

        return false;
    };

    const approve = () => {
        approvedImages.current = images;
        setConfirming(false);
    };

    const dismiss = () => {
        setDismissed(true);
        approve();

        try {
            window.localStorage.setItem(dismissedKey, '1');
        } catch {
            // Without storage, the reminder stays off until the page reloads.
        }
    };

    return {
        undescribed,
        confirming,
        setConfirming,
        beforeSubmit,
        approve,
        dismiss,
    };
}
