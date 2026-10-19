import type { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import type { useImageDescriptionReminder } from '@/hooks/use-image-description-reminder';

export function ImageDescriptionReminder({
    reminder,
    textarea,
    onEdit,
}: {
    reminder: ReturnType<typeof useImageDescriptionReminder>;
    textarea: RefObject<HTMLTextAreaElement | null>;
    onEdit?: () => void;
}) {
    const post = () => textarea.current?.form?.requestSubmit();

    // Opens the description of the first undescribed image, back in the editor if the draft was previewed.
    const describe = () => {
        reminder.setConfirming(false);
        onEdit?.();
        requestAnimationFrame(() =>
            textarea.current?.form
                ?.querySelector<HTMLButtonElement>(
                    'button[data-test="describe-image-button"][aria-label^="Add description"]',
                )
                ?.click(),
        );
    };

    return (
        <Dialog
            open={reminder.confirming}
            onOpenChange={reminder.setConfirming}
        >
            <DialogContent>
                <DialogTitle>Add image descriptions?</DialogTitle>
                <DialogDescription>
                    {reminder.undescribed === 1
                        ? 'An image has no description.'
                        : `${reminder.undescribed} images have no description.`}{' '}
                    Screen readers read it out to people who can't see the
                    image.
                </DialogDescription>
                <DialogFooter className="flex-col sm:flex-row">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            reminder.dismiss();
                            post();
                        }}
                        data-test="image-description-reminder-dismiss"
                    >
                        Don't remind me again
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            reminder.approve();
                            post();
                        }}
                        data-test="image-description-reminder-post"
                    >
                        Post anyway
                    </Button>
                    <Button
                        type="button"
                        onClick={describe}
                        data-test="image-description-reminder-describe"
                    >
                        Add descriptions
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
