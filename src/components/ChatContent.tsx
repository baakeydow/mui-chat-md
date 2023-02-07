import * as React from 'react';
import List from '@mui/material/List';
import { AppContext } from '../AppContext';
import { QueryContext } from '../QueryContext';
import { CustomTopMarginSpacer, Main } from './mui';
import DisplayMessageContent from './DisplayMessageContent';

export default function DtkChatContent() {
  const { chat_data, currentMessage } = React.useContext(AppContext);
  const { query } = React.useContext(QueryContext);
  const currentChat = chat_data?.chat?.find((message) => message.channel_id === query.currentChannelId);
  const [chatContent, setChatContent] = React.useState(currentChat);
  const messagesEndRef = React.useRef(null as any);

  const scrollToBottom = () => {
    if (!currentMessage.length && currentChat?.channel_id) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }
  };

  React.useEffect(() => {
    if (document.readyState === 'complete' && currentChat?.channel_id) {
      scrollToBottom();
    } else {
      window.addEventListener('load', scrollToBottom);
      return () => window.removeEventListener('load', scrollToBottom);
    }
  })

  React.useEffect(() => {
    setChatContent(currentChat);
  }, [currentChat]);

  return (
    <Main open={query.drawerOpen}>
      <List sx={{ bgcolor: 'background.paper' }}>
        <CustomTopMarginSpacer />
        {chatContent?.messages.map((dtkMessage, i) => (
          <DisplayMessageContent key={i} dtkMessage={dtkMessage} chatContent={chatContent} />
        ))}
        <CustomTopMarginSpacer />
        <CustomTopMarginSpacer />
        <CustomTopMarginSpacer />
        <div ref={messagesEndRef} />
      </List>
    </Main>
  );
}
