import { sendRequestWithEtagEnabled } from "./api_service.js";
import { parsePawnsData, parsePlayersData } from "./parse_service.js";

export const fetchLobbyState = async (url, etag) => {
  const res = await sendRequestWithEtagEnabled({ url, etag });

  if (!res.changed) {
    return res;
  }

  return {
    etag: res.etag,
    changed: true,
    lobby: res.body.data,
  };
};

export const fetchGameState = async (url, etag) => {
  const res = await sendRequestWithEtagEnabled({ url, etag });
  if (!res.changed) {
    return res;
  }
  const gameContext = res.body.data;
  const disprovalData = gameContext.disprovalData;

  const gameConfig = {
    state: gameContext.state,
    players: parsePlayersData(gameContext.players),
    pawns: parsePawnsData(gameContext.pawns),
    currentPlayer: {
      id: gameContext.currentPlayer.id,
      hand: gameContext.hand,
      pawn: gameContext.currentPlayer.pawn,
    },
    activePlayer: {
      id: gameContext.activePlayer.id,
      pawn: gameContext.activePlayer.pawn,
      name: gameContext.activePlayer.name,
    },
    canRoll: gameContext.canRoll,
    canSuspect: gameContext.canSuspect,
    secretPassageId: gameContext.secretPassageId,
    isPlayerActive:
      gameContext.currentPlayer.id === gameContext.activePlayer.id,
    diceValues: gameContext.diceValues,
    shouldShowDicePopup: gameContext.shouldShowDicePopup,
    ...disprovalData,
    shouldShowAccusationResult: gameContext.shouldShowAccusationResult,
    accusationDetails: gameContext.accusationDetails,
    murderCombination: gameContext.murderCombination,
    possiblePaths: gameContext.possiblePaths,
    canPass: gameContext.canPass,
  };
  return { etag: res.etag, changed: res.changed, gameConfig };
};
