import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { AppContext } from '../AppContext';
import { QueryContext } from '../QueryContext';
import { DtkChat } from '../types/DtkChat';

const stringToHexaColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

export default function DtkChatChannelList() {
  const { chat_data } = React.useContext(AppContext);
  const { query, selectChannel } = React.useContext(QueryContext);
  const { currentChannelId } = query;
  const theme = useTheme();
  const [chatData, setChatData] = React.useState(chat_data?.chat);

  React.useEffect(() => {
    setChatData(chat_data?.chat);
  }, [chat_data]);

  if (!chatData?.length) {
    return <p>should have never happened, the backend code is broken</p>;
  }

  const handleUserNavigation = (selectedChat: DtkChat) => {
    selectChannel(selectedChat.channel_id, chat_data);
  };

  const getLastMessageFromChannel = (channelId: string) => {
    const currentChat = chatData.find((chat) => chat.channel_id === channelId);
    const lastMessage = currentChat?.messages[currentChat.messages.length - 1];
    if (!lastMessage) return '$';
    const sub = lastMessage.message.substring(0, 20);
    return (lastMessage.message.length >= 20 ? sub?.concat('...') : sub );
  };

  const displayUsers = () => {
    return chatData.map((chat, id) => {
      return (
        <div key={id}>
          <ListItemButton
            onClick={() => handleUserNavigation(chat)}
            selected={currentChannelId === chat.channel_id}
            alignItems="center"
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light,
                color: 'white',
                '.MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
              },
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ width: 30, height: 30, color: stringToHexaColor(chat.channel_id), backgroundColor: '#11152A' }} />
            </ListItemAvatar>
            <ListItemText
              data-testid={chat.channel_id}
              primary={
                <React.Fragment>
                  <Typography
                    sx={{ display: 'inline', wordWrap: 'break-word' }}
                    component="span"
                    fontSize={12}
                    color="white"
                    fontWeight="bold"
                  >
                    {chat.users.map((user) => `${user.name.charAt(0).toUpperCase()}${user.name.slice(1)}`).join(', ')}
                  </Typography>
                </React.Fragment>
              }
              secondary={
                <span style={{display: 'flex', flexDirection: 'column'}}>
                  <Typography
                    component="span"
                    sx={{ fontSize: 5, display: 'inline', wordWrap: 'break-word' }}
                    color="grey"
                    variant="caption"
                  >
                    {chat.channel_id}
                  </Typography>
                  <Typography component="span" variant="caption" style={{ marginTop: 10, color: 'white', fontSize: 8}}>{getLastMessageFromChannel(chat.channel_id)}</Typography>
                </span>
              }
            />
          </ListItemButton>
          <Divider variant="inset" component="li" />
        </div>
      );
    });
  };
  return (
    <List
      sx={{
        overflow: 'auto',
        mt: '10px',
        minHeight: '300',
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      }}
    >
      {displayUsers()}
    </List>
  );
}
