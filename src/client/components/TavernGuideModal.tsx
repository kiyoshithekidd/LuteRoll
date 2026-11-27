import { BARD_TITLE_LADDER, DIFFICULTY_TIERS } from '../../shared/constants';

type TavernGuideModalProps = {
  onClose: () => void;
};

export function TavernGuideModal({ onClose }: TavernGuideModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-label="Tavern Guide"
    >
      <div className="tavern-wood-frame w-full max-w-md rounded-2xl p-4 flex flex-col gap-3 max-h-[90vh] min-h-0 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <h2 className="font-serif text-xl font-bold text-[#ffe875]">
            📜 Tavern Guide
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-lg bg-black/40 border border-[#d4af37]/40 text-[#f5ead2] cursor-pointer"
          >
            Close
          </button>
        </div>

        <div
          className="parchment-card rounded-xl p-3.5 min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y space-y-3 text-xs text-[#26160a]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div>
            <h3 className="font-bold uppercase tracking-wider text-[#6e4726] mb-1">
              How to Play
            </h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                <strong>Roll your daily d20</strong> (1 reroll per day). High
                rolls give easier tunes; <strong>Nat 20</strong> gives the
                easiest tune at a <strong>3.0x crit XP payout</strong>.
              </li>
              <li>
                <strong>Listen</strong> as the keys light up, then{' '}
                <strong>tap it back</strong> note for note.
              </li>
              <li>
                Score <strong>50%+ accuracy</strong> to earn XP (below 50% =
                tomatoes &amp; 0 XP). Replay as many times a day as you want!
              </li>
            </ol>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-[#6e4726] mb-1">
              Chests, Modes &amp; Duels
            </h3>
            <ul className="space-y-1">
              <li>
                🎁 <strong>Mystery Chests &amp; Challenge Mythics:</strong> Earn
                1 chest on your first clear + 1 bonus chest for 100% or Nat 20,
                plus <strong>Streak Milestone Chests</strong> at Days 3, 7, 14
                &amp; 30. Collect <strong>75 Chest Relics</strong> (3rd
                duplicate guarantees new) to unlock{' '}
                <strong>13 voiced instruments &amp; keyboard skins</strong>, and
                forge <strong>10 Earned-Only Mythic Relics</strong> through hard
                challenges, streaks &amp; high levels (0% chest RNG!).
              </li>
              <li>
                🎭 <strong>Modular Build-a-Bard Vault:</strong> Customize your
                generic Chibi Bard&apos;s <strong>Skin &amp; Face</strong> and
                equip <strong>130 mix-and-match Hair, Hats, Outfits, Props &amp; Auras</strong>{' '}
                (1-to-1 with every Relic &amp; 25 Feats), plus{' '}
                <strong>6 Animal Familiars</strong>,{' '}
                <strong>5 d20 Dice Skins</strong>,{' '}
                <strong>5 Note-Hit Sparks</strong>, and{' '}
                <strong>Bard Epithets</strong>.
              </li>
              <li>
                ⚡ <strong>Encore Challenge Modes:</strong> After your first
                daily clear, toggle <strong>No-Lights</strong> or{' '}
                <strong>Fast Tempo (+20%)</strong> for{' '}
                <strong>+50% Bonus XP</strong>.
              </li>
              <li>
                ⚔️ <strong>Bardic Gauntlet:</strong> Throw a Gauntlet after
                clearing or take a <strong>Random Gauntlet</strong> to duel
                another bard&apos;s exact melody for <strong>+35 XP</strong>.
              </li>
              <li>
                🍻 <strong>Tavern Tip Jar:</strong> Every bard&apos;s XP fills
                today&apos;s subreddit Tip Jar — hitting the goal activates{' '}
                <strong>+15% Encore XP</strong> for everyone all day.
              </li>
              <li>
                🛡️ <strong>Ward of Grace &amp; Freezes:</strong> 3-day streak
                grants <strong>1 free miss</strong> (7-day = <strong>2</strong>
                ); earn a <strong>Streak Freeze</strong> every 5 days.
              </li>
              <li>
                🎯 <strong>Daily Bounty:</strong> Complete today&apos;s rotating
                objective for bonus XP.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-[#6e4726] mb-1">
              Roll to Difficulty
            </h3>
            <div className="grid grid-cols-3 gap-1 text-[11px] bg-black/5 rounded-lg p-2">
              <span className="font-bold">Roll</span>
              <span className="font-bold">Tier</span>
              <span className="font-bold text-right">XP Mult</span>
              {DIFFICULTY_TIERS.map((t) => (
                <div key={t.id} className="contents">
                  <span>
                    {t.minRoll === t.maxRoll
                      ? t.minRoll
                      : `${t.minRoll}–${t.maxRoll}`}
                  </span>
                  <span>{t.name}</span>
                  <span className="text-right font-semibold">
                    {t.xpMultiplier.toFixed(1)}x
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold uppercase tracking-wider text-[#6e4726] mb-1">
              Bard Title Ladder (Lvl 1–100)
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[...BARD_TITLE_LADDER].reverse().map((b) => (
                <span
                  key={b.minLevel}
                  className="px-2 py-0.5 rounded-md bg-[#2c1b0e]/10 border border-[#9c7538]/40 text-[10px] font-semibold"
                >
                  Lvl {b.minLevel}: {b.title}
                </span>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-[#6e4726]/85 border-t border-[#9c7538]/30 pt-2">
            Ported from <em>College of Keys</em> (d20 Performance Check &amp;
            Daily Quest System). Desktop keys: Lower C4–B4 (Z–M, sharps S D G H
            J) • Upper C5–C6 (Q–I, sharps 2 3 5 6 7).
          </p>
        </div>
      </div>
    </div>
  );
}
