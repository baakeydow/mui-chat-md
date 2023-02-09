import * as React from 'react';
import axios from 'axios';
import { debounce, DebouncedFunc } from 'lodash';
import { useQuery } from 'react-query';
import Cookies from 'js-cookie';
import { DtkUser } from './types/DtkUser';
import { ChatForUsers } from './types/ChatForUsers';
import { DtkChatUser } from './types/DtkChatUser';
import { QueryContext } from './QueryContext';
import { DtkChat } from './types/DtkChat';

const chatEndpoint = process.env.NODE_ENV !== 'production' ? 'http://127.0.0.1:1342/chat' : 'https://core.api.dtksi.com/chat';
const wsChatEndpoint = process.env.NODE_ENV !== 'production' ? 'ws://127.0.0.1:1342/chat/ws' : 'wss://core.api.dtksi.com/chat/ws';

export interface AppContextDef {
  user: DtkUser | null;
  chat_data: ChatForUsers;
  currentSelectedUsers: DtkChatUser[];
  currentMessage: string;
  isLoadingChat: boolean;
  errorChat: any;
  isFetchingChat: boolean;
  refetchChat: () => void;
  setChatMessage: (message: string) => void;
  setSelectedUsers: (users: React.SetStateAction<DtkChatUser[]>) => void;
  createChannel: (users: DtkChatUser[], channelId: string) => Promise<void>;
  postChatMessage: DebouncedFunc<(channel_id: string, chat_payload: any) => Promise<void>>;
}
const defaultState = {
  user: null,
  chat_data: {
    chat: [] as DtkChat[],
    users: [] as DtkChatUser[],
    id: '',
    count: 0,
  },
  currentSelectedUsers: [] as DtkChatUser[],
  currentMessage: '',
  isLoadingChat: false,
  errorChat: null,
  isFetchingChat: false,
  refetchChat: () => console.log,
  setChatMessage: (message: string) => console.log(message),
  setSelectedUsers: (users: React.SetStateAction<DtkChatUser[]>) => console.log(users),
  createChannel: async (users: DtkChatUser[], channelId: string) => console.log(users, channelId),
  postChatMessage: (async (channel_id: string, chat_payload: any) => console.log(channel_id, chat_payload)) as any,
};

const getDtkHeaders = (user: DtkUser) => ({
  user_id: user?.id,
  Authorization: user?.token,
  'Content-Type': 'application/json',
});

const getChatData = async (user: DtkUser) => {
  const { data } = await axios.post(
    `${chatEndpoint}/get`,
    { user },
    {
      headers: getDtkHeaders(user),
    }
  );
  return data as ChatForUsers;
};

const postMessage = async (user: DtkUser, chat_payload: any) => {
  const { data } = await axios.post(
    `${chatEndpoint}/post`,
    { user, chat_payload },
    {
      headers: getDtkHeaders(user),
    }
  );
  return data as DtkChat;
};

export const AppContext = React.createContext<AppContextDef>(defaultState);

const handleWebSocketMessage = (
  event: MessageEvent<any>,
  chat_data: ChatForUsers,
  currentChat: DtkChat | undefined,
  currentChannelId: string,
  user: DtkUser | null,
  setChatData: React.Dispatch<React.SetStateAction<ChatForUsers>>,
  selectChannel: (channel_id: string, chat_data: ChatForUsers) => void
) => {
  const wsData = JSON.parse(event.data) as ChatForUsers;
  if (wsData?.chat?.length && !currentChat?.channel_id && !chat_data?.chat?.length) {
    // console.log('# => websocket message retreived but no channel_id is fetched from query yet');
    setChatData(wsData);
    if (!currentChannelId) {
      // console.log('# => channel_id override');
      selectChannel(wsData?.chat?.find((message) => message.channel_id === user?.id)?.channel_id || 'shouldneverhappen', wsData);
    }
    // console.log('# => chat ready')
  } else if (wsData?.chat?.length > 1 && currentChat?.channel_id && chat_data?.chat?.length) {
    // console.log('# => channel navigation');
    setChatData(wsData);
    // console.log('# => chat ready')
  } else if (wsData?.chat?.length === 1) {
    // console.log('# => websocket message received, updating chat data...', wsData?.chat)
    const newChatData = chat_data.chat?.map((chat) => {
      if (chat.channel_id === wsData.chat[0].channel_id) {
        return wsData.chat[0];
      }
      return chat;
    });
    setChatData({
      ...chat_data,
      chat: newChatData,
    });
    // console.log('# => chat updated')
  }
};

const connectWs = (
  message: string,
  url: string,
  chat_data: ChatForUsers,
  currentChat: DtkChat | undefined,
  currentChannelId: string,
  user: DtkUser | null,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setChatData: React.Dispatch<React.SetStateAction<ChatForUsers>>,
  selectChannel: (channel_id: string, chat_data: ChatForUsers) => void
) => {
  const ws = new WebSocket(url);
  ws.onerror = (error: any) => {
    console.error('# => ws::error', error);
    ws.close();
    setIsOpen(false);
  };
  ws.onclose = () => {
    // console.log('# => ws::onclose disconnected');
    setIsOpen(false);
    setTimeout(() => {
      // console.log('# => ws::onclose reconnecting...');
      connectWs(message, url, chat_data, currentChat, currentChannelId, user, setIsOpen, setChatData, selectChannel);
    }, 1000);
  };
  ws.onopen = () => {
    // console.log('# => ws::onopen connected');
    setIsOpen(true);
    ws.send(`/join ${currentChannelId}`);
    ws.send(message);
    // console.log('# => ws::onopen message sent');
  };
  ws.onmessage = (event: any) => {
    handleWebSocketMessage(event, chat_data, currentChat, currentChannelId, user, setChatData, selectChannel);
  };
  return ws;
};

interface Props {
  children: React.ReactNode;
}
const AppContextProvider: React.FC<Props> = ({ children }) => {
  const { query, selectChannel } = React.useContext(QueryContext);
  const { currentChannelId } = query;
  const user = JSON.parse(Cookies.get('dtksi-user')?.toString() || '{}');
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentSelectedUsers, setCurrentSelectedUsers] = React.useState(defaultState.currentSelectedUsers);
  const [currentMessage, setCurrentMessage] = React.useState(defaultState.currentMessage);
  const [chat_data, setChatData] = React.useState(defaultState.chat_data);
  const { isLoading, error, data, isFetching, refetch } = useQuery(
    `chat-data-${currentChannelId}-${user?.id}-${user?.token}`,
    () => getChatData(user),
    {
      enabled: !!user.id && !!user.token && !chat_data.chat.length,
    }
  );
  const currentChat = chat_data?.chat?.find((message) => message.channel_id === query.currentChannelId);
  const endpoint_with_creds = `${wsChatEndpoint}?user_id=${user?.id}&token=${user?.token}&channel_id=${currentChannelId}`;

  React.useEffect(() => {
    if (!user.id || !user.token) {
      return;
    }
    if (!chat_data?.chat?.length && currentChat?.channel_id) {
      console.error('# => should never happen');
      refetch();
    }
    if (data?.chat?.length && !currentChat?.channel_id && chat_data?.chat?.length) {
      // console.log('# => fallback for new user with no/wrong channel_id in query url');
      setChatData(data);
      selectChannel(data?.chat?.find((message) => message.channel_id === user?.id)?.channel_id || 'shouldneverhappen', chat_data);
      // console.log('# => chat ready');
    }
    if (!isOpen) {
      connectWs('/get', endpoint_with_creds, chat_data, currentChat, currentChannelId, user, setIsOpen, setChatData, selectChannel);
    }
  }, [user, data, endpoint_with_creds, isOpen, currentChat, currentChannelId, chat_data, refetch, setChatData, selectChannel]);

  const callbacks = React.useMemo(() => {
    const setChatMessage = (message: string) => {
      setCurrentMessage(message);
    };

    const setSelectedUsers = (users: React.SetStateAction<DtkChatUser[]>) => {
      setCurrentSelectedUsers(users);
    };

    const createChannel = async (users: DtkChatUser[], channelId: string) => {
      const formattedChatPayload = {
        channel_id: channelId,
        users,
        messages: [],
      };
      await postMessage(user, formattedChatPayload);
      connectWs('/post', endpoint_with_creds, chat_data, currentChat, currentChannelId, user, setIsOpen, setChatData, selectChannel);
      setCurrentSelectedUsers([]);
      setCurrentMessage('');
    };

    const postChatMessage = debounce(async (channel_id: string, msg: string) => {
      const formattedChatPayload = {
        channel_id,
        users: [
          {
            id: user?.id,
            email: user?.email,
            name: user?.name,
          },
        ],
        messages: [
          {
            sender_id: user?.id,
            date: new Date(),
            message: msg,
          },
        ],
      };
      await postMessage(user, formattedChatPayload);
      connectWs('/post', endpoint_with_creds, chat_data, currentChat, currentChannelId, user, setIsOpen, setChatData, selectChannel);
      setCurrentMessage('');
    }, 1000);

    return {
      setChatMessage,
      setSelectedUsers,
      postChatMessage,
      createChannel,
    };
  }, [user, chat_data, currentChannelId, currentChat, endpoint_with_creds, selectChannel]);

  return (
    <AppContext.Provider
      value={{
        user,
        chat_data,
        currentSelectedUsers,
        currentMessage,
        isLoadingChat: isLoading,
        errorChat: error,
        isFetchingChat: isFetching,
        refetchChat: refetch,
        ...callbacks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
