import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, screen } from '@testing-library/react';
import { CssBaseline, Container, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { AppContext } from '../AppContext';
import { DtkChatUser } from '../types/DtkChatUser';
import { QueryContext } from '../QueryContext';
import { ChatForUsers } from '../types/ChatForUsers';
import DtkAppContainer from '../components/AppContainer';
import mockAppContext from './mockAppContext.json';
import mockQueryContext from './mockQueryContext.json';

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          height: '100%',
          overflow: 'hidden',
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#11152A',
    },
    secondary: {
      main: '#F5F5F5',
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

interface Props {
  children: React.ReactNode;
}

const defaultQueryState = {
  query: {
    currentChannelId: mockQueryContext.query.currentChannelId,
    drawerOpen: mockQueryContext.query.drawerOpen,
  },
  selectChannel: (channelId: string, chat_data: ChatForUsers | null) => console.log(channelId, chat_data),
  setDrawerOpen: (open: boolean) => console.log(open),
};

const defaultAppState = {
  user: mockAppContext.user,
  chat_data: mockAppContext.chat_data,
  currentSelectedUsers: [],
  currentMessage: mockAppContext.currentMessage,
  isLoadingChat: mockAppContext.isLoadingChat,
  errorChat: mockAppContext.errorChat,
  isFetchingChat: mockAppContext.isFetchingChat,
  refetchChat: () => console.log,
  setChatMessage: (message: string) => console.log(message),
  setSelectedUsers: (users: React.SetStateAction<DtkChatUser[]>) => console.log(users),
  createChannel: async (users: DtkChatUser[], channelId: string) => console.log(users, channelId),
  postChatMessage: (async (channel_id: string, chat_payload: any) => console.log(channel_id, chat_payload)) as any,
};

describe('<DtkAppContainer />', () => {
  test(`${mockQueryContext.query.currentChannelId}`, async () => {
    const Wrapper: React.FC<Props> = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <QueryContext.Provider value={defaultQueryState}>
          <AppContext.Provider value={defaultAppState}>{children}</AppContext.Provider>
        </QueryContext.Provider>
      </QueryClientProvider>
    );

    render(
      <Wrapper>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Container maxWidth="xl" style={{ padding: 0, marginTop: 2 }} sx={{ my: 10, height: '100vh' }}>
            <DtkAppContainer />
          </Container>
        </ThemeProvider>
      </Wrapper>
    );

    expect(screen.getByTestId(mockAppContext.user.name)).toBeInTheDocument();
    expect(screen.getByTestId(mockAppContext.chat_data.chat[0].channel_id)).toBeInTheDocument();
  });
});
