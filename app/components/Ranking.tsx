"use client";

interface Player {
  position: number;
  nickname: string;
  time: number; // in seconds
  avatar?: string;
  improved?: boolean;
}

interface RankingProps {
  topPlayers: Player[];
  currentUser: Player;
}

export default function Ranking({ topPlayers, currentUser }: RankingProps) {
  const formatTime = (seconds: number): string => {
    return seconds.toFixed(2);
  };

  const getMedalColor = (position: number): string => {
    if (position === 1) return '#FFD700'; // Gold
    if (position === 2) return '#C0C0C0'; // Silver
    if (position === 3) return '#CD7F32'; // Bronze
    return '';
  };

  const getInitial = (nickname: string): string => {
    return nickname.charAt(0).toUpperCase();
  };

  const RankingCard = ({ player, isCurrentUser = false }: { player: Player; isCurrentUser?: boolean }) => {
    const medalColor = getMedalColor(player.position);
    const showMedal = player.position <= 3;

    return (
      <div
        className={`
          flex items-center justify-between
          h-16 px-5 rounded-2xl
          ${isCurrentUser 
            ? 'bg-[#111111] border border-[rgba(143,94,255,0.5)]' 
            : 'bg-[#111111] border border-[rgba(255,255,255,0.07)]'
          }
          transition-all
        `}
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Left side: Position */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-base font-bold text-[#FFFFFF] whitespace-nowrap">
            #{player.position}
          </span>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {player.avatar ? (
              <img
                src={player.avatar}
                alt={player.nickname}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#151515] flex items-center justify-center border border-[rgba(255,255,255,0.1)]">
                <span className="text-sm font-bold text-[#FFFFFF]">
                  {getInitial(player.nickname)}
                </span>
              </div>
            )}
            
            {/* Medal for top 3 */}
            {showMedal && (
              <div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: medalColor }}
              >
                <span className="text-xs font-bold text-[#000000]">
                  {player.position}
                </span>
              </div>
            )}
          </div>

          {/* Nickname */}
          <span className="text-base font-bold text-[#FFFFFF] truncate flex-1 min-w-0">
            {player.nickname}
          </span>
        </div>

        {/* Right side: Time and indicators */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Improvement indicator */}
          {player.improved !== undefined && (
            <div className="flex items-center">
              {player.improved ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 3L12 7H9V13H7V7H4L8 3Z"
                    fill="#00D26A"
                  />
                </svg>
              ) : (
                <span className="text-[#8A8A8A] text-sm">—</span>
              )}
            </div>
          )}

          {/* Time */}
          <span className="text-base font-bold text-[#FFFFFF] whitespace-nowrap">
            {formatTime(player.time)}s
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 bg-[#000000] min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#FFFFFF] tracking-tight text-center mb-2">
          Ranking
        </h1>
        <p className="text-sm text-[#8A8A8A] tracking-wide text-center">
          Daily Challenge Leaderboard
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Top 6 Players */}
        {topPlayers.slice(0, 6).map((player) => (
          <RankingCard key={player.position} player={player} />
        ))}

        {/* Current User Card */}
        <div className="mt-2">
          <RankingCard player={currentUser} isCurrentUser={true} />
        </div>
      </div>
    </div>
  );
}

