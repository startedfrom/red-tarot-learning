import type { Orientation, TarotCard } from "../data/cards";

type TarotCardVisualProps = {
  card: TarotCard;
  orientation?: Orientation;
  size?: "small" | "medium" | "large";
  priority?: boolean;
};

export function TarotCardVisual({
  card,
  orientation = "upright",
  size = "medium",
  priority = false,
}: TarotCardVisualProps) {
  const reversed = orientation === "reversed";

  return (
    <figure
      className={`tarot-visual tarot-${card.visual.accent} tarot-${size}`}
      aria-label={`${card.nameKo} ${reversed ? "역방향" : "정방향"}`}
      data-priority={priority || undefined}
    >
      <div className={`tarot-face ${reversed ? "is-reversed" : ""}`}>
        <div className="tarot-frame">
          <span className="tarot-number">{card.number}</span>
          <span className="tarot-spark tarot-spark-one" aria-hidden="true">
            ✦
          </span>
          <span className="tarot-spark tarot-spark-two" aria-hidden="true">
            ·
          </span>
          <div className="tarot-orbit" aria-hidden="true">
            <span className="tarot-glyph">{card.visual.glyph}</span>
          </div>
          <div className="tarot-land" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="tarot-label">
            <strong>{card.nameKo}</strong>
          </div>
        </div>
      </div>
      {reversed ? <figcaption>역방향</figcaption> : null}
    </figure>
  );
}
