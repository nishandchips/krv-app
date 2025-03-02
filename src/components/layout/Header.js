import Logo from '@/components/Logo';

export default function Header() {
  return (
    <div className="flex-shrink-0 h-16 md:h-24 flex items-center justify-center bg-black/30">
      <Logo />
    </div>
  );
} 