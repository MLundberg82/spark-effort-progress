import { Share2 } from 'lucide-react';
import { useT } from '@/lib/i18n';

interface ShareButtonProps {
  text: string;
  compact?: boolean;
}

const ShareButton = ({ text, compact = false }: ShareButtonProps) => {
  const t = useT();

  const handleShare = async () => {
    const shareData = {
      title: 'GymRat',
      text,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      // Fallback: copy to clipboard
      const fullText = `${text}\n\n${window.location.origin}`;
      await navigator.clipboard.writeText(fullText);
      // toast would be nice but we keep it simple
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleShare}
        className="p-2 rounded-lg hover:bg-secondary/50 transition-all text-muted-foreground hover:text-primary"
        title="Share"
      >
        <Share2 className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-all shadow-elevated"
    >
      <Share2 className="w-3 h-3" />
      {t('share' as any) || 'Share'}
    </button>
  );
};

export default ShareButton;
