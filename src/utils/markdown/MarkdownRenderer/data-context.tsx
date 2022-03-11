import { createContext, Dispatch, FC, useEffect, useReducer } from "react";
import { useIsomorphicLayoutEffect } from "react-use";

interface MarkdownDataContextType {
  selectedTabText: string;
}

type SET_SELECTED_TAB_TEXT_ACTION = {
  type: "SET_SELECTED_TAB_TEXT";
  payload: string;
};

function reducer(
  state: MarkdownDataContextType,
  action: SET_SELECTED_TAB_TEXT_ACTION
) {
  switch (action.type) {
    case "SET_SELECTED_TAB_TEXT":
      return { selectedTabText: action.payload };
    default:
      throw new Error();
  }
}

const initialState: MarkdownDataContextType = { selectedTabText: "" };

export const MarkdownDataContext = createContext<{
  state: MarkdownDataContextType;
  dispatch: Dispatch<SET_SELECTED_TAB_TEXT_ACTION>;
}>({
  state: initialState,
  dispatch: () => {},
});

export const MarkdownDataProvider: FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Alternative to `useEffect`
  useIsomorphicLayoutEffect(() => {
    const tabSelect = localStorage.getItem("tabs-selection");
    if (!tabSelect) return;
    dispatch({
      type: "SET_SELECTED_TAB_TEXT",
      payload: tabSelect,
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("tabs-selection", state.selectedTabText || "");
  }, [state.selectedTabText]);

  // If user has linked to a heading that's inside of a tab
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const el = document.querySelector(hash);
    // If not header
    if (!el || !/[hH][1-6]/.exec(el.tagName)) return;
    // If header is not in a tab
    const tabName = el.getAttribute("data-tabname");
    if (!tabName) return;
    dispatch({ type: "SET_SELECTED_TAB_TEXT", payload: tabName });
    // This is an awful hack and I hate it.
    // However, it's also the only way I can get both Chrome and Firefox to scroll to the right place.
    window.location.hash = " ";
    setTimeout(() => {
      setTimeout(() => {
        el.scrollIntoView(true);
        window.location.hash = hash;
      }, 100);
    }, 100);
  }, []);

  return (
    <MarkdownDataContext.Provider value={{ state, dispatch }}>
      {children}
    </MarkdownDataContext.Provider>
  );
};
