import { useEffect, useState } from "react";

import { Card } from "../card";
import {
  CardConfiguration,
  CardInputData,
  isFixedCardConfiguration,
} from "./card-collection-types";
import { useCardCollectionConfiguration } from "./use-card-collection-configuration";

enum CardStyle {
  DIV = "DIV",
  CARD = "CARD",
}

interface CardCollectionProps {
  cardInputData: CardInputData[];
  cardStyle?: CardStyle;
  columnCountToFill: number;
}

interface CardContentProps {
  cardWidthClass: string;
  cardConfiguration: CardConfiguration;
  cardConfigurations: CardConfiguration[];
}

const CardContent = ({
  cardWidthClass,
  cardConfiguration,
  cardConfigurations,
}: CardContentProps) => {
  const [previousCardWidthClass, setPreviousCardWidthClass] =
    useState<string>(cardWidthClass);

  useEffect(() => {
    if (cardWidthClass !== previousCardWidthClass) {
      setPreviousCardWidthClass(cardWidthClass);

      if (isFixedCardConfiguration(cardConfiguration)) {
        return;
      }

      cardConfiguration.onCardSizeChange?.();
    }
  }, [previousCardWidthClass, cardWidthClass]);

  return cardConfiguration.renderCardContent({ cardConfigurations });
};

export const CardCollection = ({
  cardInputData,
  columnCountToFill,
  cardStyle = CardStyle.CARD,
}: CardCollectionProps) => {
  const { cardConfigurations } = useCardCollectionConfiguration({
    cardInputData,
    columnCountToFill,
  });

  return (
    <>
      {cardConfigurations
        .sort((a, b) => (a.order > b.order ? 1 : -1))
        .map((card) => {
          const cardWidthClass = `span ${card.currentColumnCount} / span ${card.currentColumnCount}`;

          if (cardStyle == CardStyle.CARD) {
            return (
              <Card
                key={card.cardId}
                className={card.cardClassname}
                style={{ gridColumn: cardWidthClass }}
                hidden={card.currentColumnCount <= 0}
              >
                <CardContent
                  cardWidthClass={cardWidthClass}
                  cardConfiguration={card}
                  cardConfigurations={cardConfigurations}
                />
              </Card>
            );
          }

          return (
            <div
              key={card.cardId}
              className={card.cardClassname}
              style={{ gridColumn: cardWidthClass }}
              hidden={card.currentColumnCount <= 0}
            >
              <CardContent
                cardWidthClass={cardWidthClass}
                cardConfiguration={card}
                cardConfigurations={cardConfigurations}
              />
            </div>
          );
        })}
    </>
  );
};
