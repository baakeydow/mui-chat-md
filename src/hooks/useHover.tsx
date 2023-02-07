import { useEffect, useRef, useState, MouseEvent } from 'react';
import { debounce, DebouncedFunc } from 'lodash';

export type AttributesHookReturn = {
  hoverState: boolean;
  handleHover: DebouncedFunc<(event: MouseEvent<HTMLDivElement | HTMLInputElement>) => void>;
};

export default function useMouseOver(state: boolean): AttributesHookReturn {
  const [hoverState, setHoverState] = useState(state);
  const handleHover = useRef(
    debounce((event: MouseEvent<HTMLDivElement | HTMLInputElement>) => {
      if (event.type === 'mouseout') {
        setHoverState(false);
      } else {
        setHoverState(true);
      }
      event.stopPropagation();
      event.preventDefault();
    }, 100)
  ).current;
  useEffect(() => handleHover.cancel(), [handleHover]);
  return { hoverState, handleHover };
}
