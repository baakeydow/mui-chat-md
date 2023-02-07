import * as React from 'react';
import Cookies from 'js-cookie';
import { StringParam, useQueryParams, withDefault, BooleanParam } from 'use-query-params';
import { ChatForUsers } from './types/ChatForUsers';

export type AppQuery = {
  currentChannelId: string;
  drawerOpen: boolean;
};

interface QueryContextDef {
  query: AppQuery;
  selectChannel: (channelId: string, chat_data: ChatForUsers | null) => void;
  setDrawerOpen: (open: boolean) => void;
}

const defaultState: QueryContextDef = {
  query: {
    currentChannelId: '',
    drawerOpen: false,
  },
  selectChannel: (channelId: string, chat_data: ChatForUsers | null) => console.log(channelId, chat_data),
  setDrawerOpen: (open: boolean) => console.log(open),
};

export const QueryContext = React.createContext<QueryContextDef>(defaultState);

interface Props {
  children: React.ReactNode;
}
const QueryContextProvider: React.FC<Props> = ({ children }) => {
  const user = JSON.parse(Cookies.get('dtksi-user')?.toString() || '{}');

  const [query, setQuery] = useQueryParams({
    currentChannelId: withDefault(StringParam, defaultState.query.currentChannelId),
    drawerOpen: withDefault(BooleanParam, defaultState.query.drawerOpen),
  });

  const callbacks = React.useMemo(() => {
    const selectChannel = (currentChannelId: string, chat_data: ChatForUsers | null) => {
      const currentChat = chat_data?.chat?.find((message) => message.channel_id === query.currentChannelId);
      if (currentChat?.channel_id) {
        setQuery({ currentChannelId });
      } else {
        setQuery({ currentChannelId: chat_data?.chat?.find((message) => message.channel_id === user?.id)?.channel_id || '' });
      }
    };
    const setDrawerOpen = (drawerOpen: boolean) => {
      setQuery({ drawerOpen });
    };
    return { selectChannel, setDrawerOpen };
  }, [query.currentChannelId, user?.id, setQuery]);

  return (
    <QueryContext.Provider
      value={{
        query: { ...query },
        ...callbacks,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
};

export default QueryContextProvider;
