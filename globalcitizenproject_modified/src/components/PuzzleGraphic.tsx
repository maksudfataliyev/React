import { MessageCircle, BookOpen, Heart, Users } from "lucide-react";

const PuzzleGraphic = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <svg viewBox="0 0 600 600" className="w-full h-auto">
        {/* Teal piece - CHAT */}
        <g className="hover:scale-105 transition-transform cursor-pointer">
          <path
            d="M50 50 L250 50 L250 80 Q260 80 260 90 Q260 100 250 100 L250 250 L220 250 Q220 260 210 260 Q200 260 200 250 L50 250 Z"
            fill="hsl(186 42% 35%)"
            className="drop-shadow-lg"
          />
          <text x="120" y="150" className="fill-white font-bold text-2xl" textAnchor="middle">CHAT</text>
        </g>

        {/* Yellow piece - MOOD */}
        <g className="hover:scale-105 transition-transform cursor-pointer">
          <path
            d="M350 50 L550 50 L550 250 L400 250 Q400 260 390 260 Q380 260 380 250 L350 250 L350 100 Q340 100 340 90 Q340 80 350 80 Z"
            fill="hsl(45 100% 60%)"
            className="drop-shadow-lg"
          />
          <text x="430" y="150" className="fill-primary font-bold text-2xl" textAnchor="middle">MOOD</text>
        </g>

        {/* Coral piece - EDU */}
        <g className="hover:scale-105 transition-transform cursor-pointer">
          <path
            d="M50 350 L200 350 Q200 340 210 340 Q220 340 220 350 L250 350 L250 550 L50 550 Z"
            fill="hsl(5 70% 68%)"
            className="drop-shadow-lg"
          />
          <text x="120" y="450" className="fill-white font-bold text-2xl" textAnchor="middle">EDU</text>
        </g>

        {/* Mint piece - CONSULT */}
        <g className="hover:scale-105 transition-transform cursor-pointer">
          <path
            d="M350 350 L380 350 Q380 340 390 340 Q400 340 400 350 L550 350 L550 550 L350 550 L350 380 Q340 380 340 370 Q340 360 350 360 Z"
            fill="hsl(165 45% 75%)"
            className="drop-shadow-lg"
          />
          <text x="430" y="450" className="fill-primary font-bold text-2xl" textAnchor="middle">CONSULT</text>
        </g>

        {/* Connection arrows */}
        <path d="M 250 150 Q 300 150 350 150" stroke="hsl(45 100% 50%)" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" className="animate-pulse" />
        <path d="M 150 250 Q 150 300 150 350" stroke="hsl(5 70% 58%)" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" className="animate-pulse" />
        <path d="M 250 450 Q 300 450 350 450" stroke="hsl(165 45% 65%)" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" className="animate-pulse" />

        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      {/* Labels with icons */}
      <div className="absolute top-[15%] left-[8%] flex items-center gap-2 pointer-events-none">
        <MessageCircle className="w-6 h-6 text-white" />
      </div>
      <div className="absolute top-[15%] right-[15%] flex items-center gap-2 pointer-events-none">
        <Heart className="w-6 h-6 text-primary" />
      </div>
      <div className="absolute bottom-[15%] left-[8%] flex items-center gap-2 pointer-events-none">
        <BookOpen className="w-6 h-6 text-white" />
      </div>
      <div className="absolute bottom-[15%] right-[12%] flex items-center gap-2 pointer-events-none">
        <Users className="w-6 h-6 text-primary" />
      </div>
    </div>
  );
};

export default PuzzleGraphic;
