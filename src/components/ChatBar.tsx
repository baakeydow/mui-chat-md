import * as React from 'react';
import { debounce } from 'lodash';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { AppContext } from '../AppContext';
import { QueryContext } from '../QueryContext';
import { TextField, Typography, useMediaQuery } from '@mui/material';
import { AppBar, chatInputHeightClose, chatInputHeightOpen, maxCharacters } from './mui';

export default function BottomAppBar() {
  const theme = useTheme();
  const isTiny = useMediaQuery(theme.breakpoints.down('xs'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const { postChatMessage, setChatMessage } = React.useContext(AppContext);
  const { query } = React.useContext(QueryContext);
  const { currentChannelId, drawerOpen } = query;
  const [rows, setRows] = React.useState(isTiny || isSmall ? 1 : chatInputHeightClose);
  const [msg, setMsg] = React.useState('');
  const delayedMessageUpdate = React.useMemo(() => debounce(setChatMessage, 300), [setChatMessage]);

  const sendMessage = () => {
    const msgToSend = msg.trim();
    if (msgToSend) {
      postChatMessage(currentChannelId, msgToSend);
      setMsg('');
    }
  };

  const setMessage = (message: string) => {
    setMsg(message);
    delayedMessageUpdate(msg);
  };

  const handleEnterKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && msg.length <= maxCharacters) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <React.Fragment>
      <AppBar open={drawerOpen} position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
        <Toolbar sx={{ paddingX: drawerOpen ? '0px !important' : '10' }}>
          <Box
            sx={{
              display: 'flex',
              margin: '20px auto',
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              width: '100%',
              minWidth: '20%',
            }}
          >
            <TextField
              variant="filled"
              color="secondary"
              id="message-text-field"
              value={msg}
              rows={rows}
              onKeyDown={handleEnterKey}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setRows(isTiny || isSmall ? 5 : chatInputHeightOpen)}
              onBlur={() => {
                let chatInputHeight = isTiny || isSmall ? 1 : chatInputHeightClose;
                setTimeout(() => {
                  setRows(chatInputHeight);
                }, 1000);
              }}
              InputProps={{ style: { padding: 5, color: '#000000' } }}
              InputLabelProps={{
                style: { color: '#000000' },
              }}
              style={{
                height: '100%',
                color: '#000000',
                backgroundColor: 'white',
              }}
              sx={{ color: '#000000', input: { color: '#000000' } }}
              fullWidth
              multiline
            />
            {msg.length > maxCharacters ? (
                <Typography component="div" style={{marginRight: 0}} sx={{ mx: 2, fontSize: 12, wordWrap: 'break-word' }} color="#2c42b7" variant="caption">
                  (<span style={{color: 'red'}}>{msg.length}</span>/<span>{maxCharacters}</span>)
                </Typography>
            ) : null}
            {msg.length <= maxCharacters ? (
              <IconButton disabled={msg.length > maxCharacters} sx={{ mx: 2 }} color="inherit" onClick={sendMessage}>
                <SendIcon />
              </IconButton>
            ) : null}
          </Box>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}
