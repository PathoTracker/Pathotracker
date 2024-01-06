/**
 * @file CardCollection Component
 * @description This component organizes and renders components inside cards of variable length.
 * The cards are all next to each other horizontally and occupy a certain number of columns that can vary as functions are called.
 * Please see card-collection-types.tsx for a list of all of the types of cards and how they behave.
 */

import React, { useEffect, useState } from "react";

import { Card } from "../card";
import {
  CardConfiguration,
  CardInputData,
  CardStyle,
  isFixedCardConfiguration,
} from "./card-collection-types";
import { useCardCollectionConfiguration } from "./use-card-collection-configuration";

interface CardCollectionProps {
  cardInputData: CardInputData[];
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

          const styleToContainerMap: {
            [key in CardStyle]: (input: {
              props: {
                key: string;
                className: string;
                style: React.CSSProperties;
                hidden: boolean;
              };
              children: React.ReactNode;
            }) => React.ReactNode;
          } = {
            [CardStyle.CARD]: ({ props, children }) => (
              <Card
                key={props.key}
                className={props.className}
                style={props.style}
                hidden={props.hidden}
              >
                {children}
              </Card>
            ),
            [CardStyle.DIV]: ({ props, children }) => (
              <div 
                key={props.key}
                className={props.className}
                style={props.style}
                hidden={props.hidden}
              >
                {children}
              </div>
            ),
          };

          return styleToContainerMap[card.cardStyle]({
            props: {
              key: card.cardId,
              className: card.cardClassname,
              style: { gridColumn: cardWidthClass },
              hidden: card.currentColumnCount <= 0,
            },
            children: (
              <CardContent
                cardWidthClass={cardWidthClass}
                cardConfiguration={card}
                cardConfigurations={cardConfigurations}
              />
            ),
          });
        })}
    </>
  );
};
