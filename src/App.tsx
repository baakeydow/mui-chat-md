import * as React from 'react';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import DtkAppContainer from './components/AppContainer';
import QueryContextProvider, { QueryContext } from './QueryContext';
import AppContextProvider, { AppContext } from './AppContext';
import { DtkLoading, theme } from './components/mui';

export default function App() {
  const { user, chat_data, isLoadingChat, isFetchingChat } = React.useContext(AppContext);
  const { query, selectChannel } = React.useContext(QueryContext);
  const currentChannelId = query.currentChannelId || chat_data?.chat?.find((message) => message.channel_id === user?.id)?.channel_id;

  React.useEffect(() => {
    const currentChat = chat_data?.chat?.find((message) => message.channel_id === query.currentChannelId);
    if (chat_data?.chat.length && !isLoadingChat && !isFetchingChat && !currentChat?.channel_id) {
      setTimeout(() => {
        selectChannel(chat_data?.chat?.find((message) => message.channel_id === user?.id)?.channel_id || 'shouldneverhappen', chat_data);
      }, 300);
    } else if (chat_data?.chat.length && currentChannelId && !query.currentChannelId) {
      selectChannel(currentChannelId, chat_data);
    }
  }, [selectChannel, isLoadingChat, isFetchingChat, currentChannelId, chat_data, query, user]);

  if (isLoadingChat) return <DtkLoading />;

  return (
    <QueryContextProvider>
      <AppContextProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Container maxWidth="xl" style={{ padding: 0, marginTop: 2 }} sx={{ my: 10, height: '100vh' }}>
            <DtkAppContainer />
          </Container>
        </ThemeProvider>
      </AppContextProvider>
    </QueryContextProvider>
  );
}
