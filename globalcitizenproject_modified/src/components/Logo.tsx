const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Teal piece - top left */}
        <path d="M2 2h18v18H2z" fill="hsl(186 42% 35%)" />
        {/* Yellow piece - top right */}
        <path d="M28 2h18v18H28z" fill="hsl(45 100% 60%)" />
        {/* Coral piece - bottom left */}
        <path d="M2 28h18v18H2z" fill="hsl(5 70% 68%)" />
        {/* Mint piece - bottom right */}
        <path d="M28 28h18v18H28z" fill="hsl(165 45% 75%)" />
      </svg>
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-primary uppercase tracking-tight">YUnity</h1>
        <p className="text-xs text-muted-foreground italic">Pieces of peace.</p>
      </div>
    </div>
  );
};

export default Logo;
