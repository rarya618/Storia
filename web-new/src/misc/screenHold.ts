import { createContext, useContext, useLayoutEffect } from "react";

// A screen inside Shell is ready once nothing in it is still loading. Loading
// holds its screen while it's mounted, so Shell can keep the previous screen up
// until the next one has something to show. Outside Shell, holding does nothing.
export const ScreenHold = createContext<() => () => void>(() => () => {});

export const useHoldScreen = () => {
  const hold = useContext(ScreenHold);
  // a layout effect, so Shell knows about the hold before the first paint
  useLayoutEffect(() => hold(), [hold]);
};
