import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Button from '@mui/material/Button';
import Container from '@mui/system/Container';
import DtkChatContent from './ChatContent';
import { QueryContext } from '../QueryContext';
import { AppContext } from '../AppContext';
import DtkChatBar from './ChatBar';
import DtkChatChannelList from './ChatChannelList';
import DtkUserChannelSelection from './UserChannelSelection';
import { AppBar, DrawerHeader, drawerWidth } from './mui';

export default function DtkAppContainer() {
  const { user, chat_data, currentSelectedUsers, errorChat, createChannel } = React.useContext(AppContext);
  const { query, setDrawerOpen, selectChannel } = React.useContext(QueryContext);
  const { currentChannelId, drawerOpen } = query;
  const currentChat = chat_data?.chat?.find((message) => message.channel_id === currentChannelId);
  const [chatContent, setChatContent] = React.useState(currentChat);
  const theme = useTheme();
  const isTiny = useMediaQuery(theme.breakpoints.down('xs'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    if (currentChat?.channel_id) {
      setChatContent(currentChat);
    }
  }, [currentChat]);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleChannelCreation = () => {
    const channelId = uuidv4();
    createChannel(
      [
        {
          id: user!.id,
          email: user!.email,
          name: user!.name,
        },
        ...currentSelectedUsers,
      ],
      channelId
    );
    setTimeout(() => {
      setDrawerOpen(false);
      selectChannel(channelId, chat_data);
    }, 2000);
  };

  const DisplayChannelCreationButton = () => {
    if (!currentSelectedUsers.length) return null;
    return (
      <Container sx={{ display: 'contents', marginBottom: '0px' }}>
        <Button
          onClick={handleChannelCreation}
          sx={{
            fontSize: '0.8rem',
            marginX: '20px',
            '&:hover': {
              backgroundColor: theme.palette.secondary.dark,
              color: theme.palette.primary.dark,
            },
          }}
          color="primary"
          variant="contained"
        >
          New Channel
        </Button>
      </Container>
    );
  };

  if (!user?.id || errorChat) {
    window.location.href = 'https://auth.dtksi.com';
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <AppBar color="primary" position="fixed" open={drawerOpen}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(drawerOpen && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ minWidth: '100px' }}>
            DTKSI
          </Typography>
          <Typography
            data-testid={user?.name}
            variant="h6"
            noWrap
            component="div"
            sx={{ display: 'flex', justifyContent: 'flex-end', width: '85%' }}
          >
            {chatContent?.users.map((user) => `${user.name.charAt(0).toUpperCase()}${user.name.slice(1)}`).join(', ')}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          justifyContent: 'center',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            backgroundColor: theme.palette.primary.main,
            boxSizing: 'border-box',
            border: '0px',
          },
        }}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
        <DrawerHeader>
          <IconButton color="secondary" onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <DtkUserChannelSelection />
        <DisplayChannelCreationButton />
        <DtkChatChannelList />
      </Drawer>
      <Container style={{ padding: 0 }} sx={{ maxWidth: isTiny || isSmall ? '20vw' : '50vw', padding: 0 }} onClick={handleDrawerClose}>
        <DtkChatContent />
      </Container>
      <DtkChatBar />
    </Box>
  );
}
