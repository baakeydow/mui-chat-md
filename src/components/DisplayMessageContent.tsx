import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import emoji from 'remark-emoji';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AppContext } from '../AppContext';
import { DtkChatMessage } from '../types/DtkChatMessage';
import { DtkChat } from '../types/DtkChat';
import useMouseOver from '../hooks/useHover';

export default function DisplayMessageContent(props: { chatContent: DtkChat; dtkMessage: DtkChatMessage })  {
    const { chatContent, dtkMessage } = props;
    const theme = useTheme();
    const { user } = React.useContext(AppContext);
    const { hoverState, handleHover } = useMouseOver(false);
    const isTiny = useMediaQuery(theme.breakpoints.down('xs'));
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const isMedium = useMediaQuery(theme.breakpoints.down('md'));
    const orientation = dtkMessage.sender_id === user?.id ? 'right' : 'left';
    const cardWidth = () => {
      if (isTiny || isSmall || isMedium) {
        return '100%';
      } else {
        return '80%';
      }
    };
    return (
      <ListItem
        sx={{
          width: '100%',
          display: 'flex',
          marginBottom: 2,
          flexFlow: 'row',
          flexDirection: 'column',
          padding: 0,
          alignItems: orientation === 'right' ? 'flex-end' : 'flex-start',
          justifyContent: orientation === 'right' ? 'flex-end' : 'flex-start',
        }}
      >
        <Card
          onMouseOver={handleHover}
          onMouseOut={handleHover}
          onClick={() => {
            navigator.clipboard.writeText(dtkMessage.message);
          }}
          style={{
            paddingLeft: 4,
            paddingRight: 4,
            maxWidth: cardWidth(),
            minWidth: '20px',
            borderRadius: '30px',
            boxShadow: '0 16px 24px 2px rgb(0 0 0 / 14%), 0 6px 30px 5px rgb(0 0 0 / 12%), 0 8px 10px -5px rgb(0 0 0 / 20%)',
          }}
        >
          <CardContent style={{ padding: 4, margin: 'auto' }}>
            {dtkMessage.sender_id !== user?.id && chatContent.users.length > 2 ? (
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                <Typography component="div" sx={{ mt: 1, fontSize: 12, textAlign: orientation }} color="#2c42b7" variant="caption">
                  {chatContent.users.find((u) => u.id === dtkMessage.sender_id)?.name}
                </Typography>
              </Box>
            ) : null}
            <ReactMarkdown
              children={dtkMessage.message}
              remarkPlugins={[remarkGfm, [emoji, { padSpaceAfter: true, emoticon: true, accessible: true }]]}
              rehypePlugins={[rehypeRaw]}
              components={{
                img: (props) => <img {...props} style={{ margin: 'auto', display: 'block', maxWidth: '80%' }} alt="" />,
                code({ node, inline, className, children, style, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      children={String(children).replace(/\n$/, '')}
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            />
            {hoverState ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center', padding: 1 }}>
                  <Divider sx={{ mt: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(dtkMessage.message);
                        }}
                        sx={{ float: orientation === 'left' ? 'right' : 'left', mx: 1, my: 0, fontSize: 8, minWidth: '40px' }}
                        size="small"
                        color="primary"
                        variant="outlined"
                      >
                        Copy
                      </Button>
                    </>
                    <>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(dtkMessage.message);
                        }}
                        sx={{ float: orientation === 'left' ? 'right' : 'left', mx: 1, my: 0, fontSize: 8, minWidth: '40px' }}
                        size="small"
                        color="primary"
                        variant="outlined"
                      >
                        <Typography component="span" sx={{ fontSize: 8, textAlign: orientation }} variant="caption">
                          {new Date(dtkMessage.date)
                            .toLocaleString()
                            .split(',')
                            .map((d, i) => (
                              <span style={{ color: '#2c42b7' }} key={i}>
                                {d}
                                <br />
                              </span>
                            ))}
                        </Typography>
                      </Button>
                    </>
                  </Box>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              </>
            ) : null}
          </CardContent>
        </Card>
      </ListItem>
    );
  };